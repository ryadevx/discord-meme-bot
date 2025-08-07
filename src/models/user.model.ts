import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  discordId: { type: String, required: true, unique: true },
  username: String,
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  canViewAllMemes: { type: Boolean, default: false }
});

export default model('User', userSchema);
