import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  paymentId: { type: String },
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: { type: Number },
  currency: { type: String },
  status: { type: String, enum: ['created', 'paid', 'failed'], default: 'created' },
  receipt: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Payment', paymentSchema);
