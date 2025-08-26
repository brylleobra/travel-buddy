import mongoose from 'mongoose';
const ItinerarySchema = new mongoose.Schema({
  userId: { type: String, index: true },
  title: String,
  days: { type: Array, default: [] }, // [{date, items:[...]}]
  sources: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SourceRef' }]
}, { timestamps: true });

export default mongoose.models.Itinerary || mongoose.model('Itinerary', ItinerarySchema);
