import mongoose from 'mongoose';
const PriceSnapshotSchema = new mongoose.Schema({
  kind: { type: String, enum: ['FLIGHT', 'HOTEL'], required: true },
  route: String,   // e.g., "SFO-JFK-2025-12-10"
  hotelId: String,
  amount: Number,
  currency: String,
  capturedAt: { type: Date, default: Date.now },
  meta: mongoose.Schema.Types.Mixed
}, { timestamps: false });

PriceSnapshotSchema.index({ kind: 1, route: 1, hotelId: 1, capturedAt: -1 });

export default mongoose.models.PriceSnapshot || mongoose.model('PriceSnapshot', PriceSnapshotSchema);
