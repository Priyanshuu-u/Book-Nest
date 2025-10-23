import Razorpay from 'razorpay';
import crypto from 'crypto';
import Payment from '../model/payment.model.js';
import dotenv from 'dotenv';
dotenv.config();

const KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';

let razorpay;
try {
  razorpay = new Razorpay({
    key_id: KEY_ID,
    key_secret: KEY_SECRET
  });
} catch (err) {
  console.error('Razorpay init error:', err);
}

/**
 * Helper to build a short receipt id (max 40 chars).
 */
const makeReceipt = (prefix = 'rcpt') => {
  const ts = Date.now().toString(36);
  const rnd = crypto.randomBytes(6).toString('hex');
  let receipt = `${prefix}_${ts}_${rnd}`;
  if (receipt.length > 40) receipt = receipt.slice(0, 40);
  return receipt;
};

export const createOrder = async (req, res) => {
  try {
    console.log('createOrder called. Body:', req.body);

    if (!KEY_ID || !KEY_SECRET) {
      console.error('Missing Razorpay keys. KEY_ID present?', !!KEY_ID, 'KEY_SECRET present?', !!KEY_SECRET);
      return res.status(500).json({ error: 'Server misconfiguration: missing payment keys' });
    }

    const { bookId, userId, amount } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });
    if (amount === undefined || amount === null) return res.status(400).json({ error: 'amount required' });

    // Treat incoming amount as rupees and convert once to paise
    const amt = Number(amount);
    if (Number.isNaN(amt) || amt <= 0) return res.status(400).json({ error: 'invalid amount' });
    const amountInPaise = Math.round(amt * 100);

    const receipt = makeReceipt(String(userId).slice(-12));
    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt,
      payment_capture: 1
    };

    let order;
    try {
      order = await razorpay.orders.create(options);
    } catch (err) {
      console.error('createOrder error:', err && err.error ? err.error : err);
      const serverMsg = err && err.error && err.error.description ? err.error.description : 'Failed to create order';
      return res.status(err?.error?.statusCode || 500).json({ error: serverMsg });
    }

    try {
      await Payment.create({
        orderId: order.id,
        bookId,
        userId,
        amount: order.amount,
        currency: order.currency,
        status: 'created',
        receipt: order.receipt
      });
    } catch (e) {
      console.error('Failed to persist payment record:', e);
    }

    return res.status(201).json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: KEY_ID
    });
  } catch (err) {
    console.error('createOrder unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      bookId,
      userId
    } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment verification fields' });
    }

    const generated_signature = crypto
      .createHmac('sha256', KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      console.warn('Payment signature mismatch', { generated_signature, razorpay_signature });
      await Payment.findOneAndUpdate(
        { orderId: razorpay_order_id },
        { status: 'failed', paymentId: razorpay_payment_id },
        { new: true }
      ).catch(() => {});
      return res.status(400).json({ error: 'Invalid signature' });
    }

    await Payment.findOneAndUpdate(
      { orderId: razorpay_order_id },
      { status: 'paid', paymentId: razorpay_payment_id },
      { new: true, upsert: true }
    );

    return res.json({ success: true, message: 'Payment verified' });
  } catch (err) {
    console.error('verifyPayment error:', err);
    return res.status(500).json({ error: 'Verification failed' });
  }
};
