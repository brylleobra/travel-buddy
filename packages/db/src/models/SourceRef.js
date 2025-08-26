import mongoose from 'mongoose';
const PriceMentionSchema = new mongoose.Schema({
  type: { type: String, enum: ['price', 'discount'] },
  value: Number,
  currency: String,
  context: String
}, { _id: false });

const SourceRefSchema = new mongoose.Schema({
  url: { type: String, unique: true, index: true },
  title: String,
  site: String,
  scrapedAt: Date,
  kind: { type: String, enum: ['BLOG', 'REVIEW', 'NEWS', 'DEALS'], default: 'REVIEW' },
  quotes: { type: Array, default: [] },
  priceMentions: { type: [PriceMentionSchema], default: [] }
}, { timestamps: true });

export default mongoose.models.SourceRef || mongoose.model('SourceRef', SourceRefSchema);
