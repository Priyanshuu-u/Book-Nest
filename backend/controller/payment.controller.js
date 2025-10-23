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
 * Uses a compact timestamp + short random hex so it's unique but stays short.
 */
const makeReceipt = (prefix = 'rcpt') => {
  const ts = Date.now().toString(36); // short timestamp
  const rnd = crypto.randomBytes(6).toString('hex'); // 12 hex chars
  // example: rcpt_kr1h2j_4f3a8c9d2b1e -> length ~ 22
  let receipt = `${prefix}_${ts}_${rnd}`;
  if (receipt.length > 40) {
    receipt = receipt.slice(0, 40);
  }
  return receipt;
};

/**
 * POST /create-order
 * body: { bookId, userId, amount } - amount expected in rupees (we convert to paise here).
 */
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

    // Normalize amount: accept rupees (e.g. 199) or paise (if a large integer was already passed).
    let amt = Number(amount);
    if (Number.isNaN(amt)) return res.status(400).json({ error: 'invalid amount' });

    // If amount looks like rupees (smaller than 100000), convert to paise
    // If frontend already passed paise, it will be a much larger number; be cautious.
    // We'll treat values < 100000 as rupees and convert.
    let amountInPaise = amt;
    if (amt < 100000) {
      amountInPaise = Math.round(amt * 100);
    } else {
      amountInPaise = Math.round(amt); // assume already in paise
    }

    if (amountInPaise <= 0) return res.status(400).json({ error: 'amount must be > 0' });

    // Build a receipt id <= 40 chars
    const receipt = makeReceipt(String(userId).slice(-12)); // use last chars of userId as hint

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
      // Log full error from Razorpay to Render logs for debugging
      console.error('createOrder error:', err && err.error ? err.error : err);
      // Try to extract meaningful message for client
      const serverMsg = err && err.error && err.error.description ? err.error.description : 'Failed to create order';
      return res.status(err?.error?.statusCode || 500).json({ error: serverMsg });
    }

    // Optionally store the order record
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

    // TODO: create final order record, mark book sold, notify seller, etc.

    return res.json({ success: true, message: 'Payment verified' });
  } catch (err) {
    console.error('verifyPayment error:', err);
    return res.status(500).json({ error: 'Verification failed' });
  }
};
