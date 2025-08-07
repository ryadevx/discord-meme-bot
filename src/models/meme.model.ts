import { Schema, model } from 'mongoose';

const memeSchema = new Schema({
  imagePath: { type: String, required: true },
  description: { type: String },
  keywords: [{ type: String }],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  visibility: { type: String, enum: ['public', 'admin-only'], default: 'public' },
}, { timestamps: true });

export default model('Meme', memeSchema);
