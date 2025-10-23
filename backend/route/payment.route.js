import express from 'express';
import { createOrder, verifyPayment } from '../controller/payment.controller.js';

const router = express.Router();

// These endpoints will be mounted by index.js (see instructions).
router.post('/create-order', createOrder);
router.post('/verify-payment', verifyPayment);

export default router;
