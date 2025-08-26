import mongoose from 'mongoose';
const BookingSchema = new mongoose.Schema({
  userId: { type: String, index: true }, // keep as string for simplicity
  kind: { type: String, enum: ['FLIGHT', 'HOTEL'], required: true },
  provider: String,          // 'duffel' | 'rapid' | 'hotelbeds'
  providerId: { type: String, index: true },
  status: String,
  totalAmount: Number,
  currency: { type: String, default: 'USD' },
  raw: mongoose.Schema.Types.Mixed
}, { timestamps: true });

export default mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
