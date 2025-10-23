import Razorpay from 'razorpay';
import crypto from 'crypto';
import Payment from '../model/payment.model.js'; // optional: store payments
import dotenv from 'dotenv';
dotenv.config();

// Create Razorpay instance using keys from env
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || ''
});

/**
 * POST /create-order
 * Body: { bookId, userId, amount }  // amount in paise expected by Razorpay (backend will accept paise or rupees*cents with conversion)
 * Response: { id, amount, currency, key }
 */
export const createOrder = async (req, res) => {
  try {
    const { bookId, userId, amount } = req.body;

    if (!userId) return res.status(400).json({ error: 'userId required' });
    if (!amount && amount !== 0) return res.status(400).json({ error: 'amount required' });

    // razorpay expects amount in smallest currency unit (paise for INR)
    const amt = Number(amount);
    const amountInPaise = amt >= 1 ? Math.round(amt * 100) : Math.round(amt); // accept either rupees or paise if frontend already sent paise

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${userId}_${Date.now()}`,
      payment_capture: 1
    };

    const order = await razorpay.orders.create(options);

    // Optional: create a Payment record with status 'created'
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
      // non-fatal: log error but do not block order creation
      console.error('Failed to create payment record:', e);
    }

    // Return order details and public key id for frontend Razorpay checkout
    return res.status(201).json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID || ''
    });
  } catch (error) {
    console.error('createOrder error:', error);
    return res.status(500).json({ error: 'Failed to create order' });
  }
};

/**
 * POST /verify-payment
 * Body: { razorpay_payment_id, razorpay_order_id, razorpay_signature, bookId, userId }
 * Verifies the signature using HMAC SHA256 and updates payment record.
 */
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
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      console.warn('Payment signature mismatch', { generated_signature, razorpay_signature });
      // update payment record if exists
      await Payment.findOneAndUpdate(
        { orderId: razorpay_order_id },
        { status: 'failed', paymentId: razorpay_payment_id },
        { new: true }
      ).catch(() => {});
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Payment is verified. Update DB record to 'paid'
    await Payment.findOneAndUpdate(
      { orderId: razorpay_order_id },
      { status: 'paid', paymentId: razorpay_payment_id },
      { new: true, upsert: true }
    );

    // TODO: mark book as sold / create order record / notify seller, etc.

    return res.json({ success: true, message: 'Payment verified' });
  } catch (err) {
    console.error('verifyPayment error:', err);
    return res.status(500).json({ error: 'Verification failed' });
  }
};
