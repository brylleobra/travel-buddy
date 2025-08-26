import mongoose from 'mongoose';
const DealSchema = new mongoose.Schema({
  title: { type: String, index: true, unique: true },
  summary: String,
  score: Number,
  kind: { type: String, enum: ['FLIGHT', 'HOTEL'], required: true },
  route: String,
  hotelId: String,
  price: Number,
  currency: String,
  sourceIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SourceRef' }],
  validFrom: Date,
  validTo: Date
}, { timestamps: true });

export default mongoose.models.Deal || mongoose.model('Deal', DealSchema);
