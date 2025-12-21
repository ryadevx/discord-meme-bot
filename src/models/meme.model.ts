import { Schema, model } from 'mongoose';

const memeSchema = new Schema(
  {
    imageUrl: {
      type: String,
      required: true,
    },
    
    backupUrl: {
      type: String, 
    },

    description: {
      type: String,
      maxlength: 500,
    },

    keywords: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],

    // CHANGED: Embed user data instead of referencing
    createdBy: {
      discordId: {
        type: String,
        required: true,
      },
      username: {
        type: String,
        required: true,
      },
    },

    visibility: {
      type: String,
      enum: ['public', 'admin-only'],
      default: 'public',
    },
  },
  { timestamps: true }
);

// Add index for faster queries by Discord user
memeSchema.index({ 'createdBy.discordId': 1 });

export default model('Meme', memeSchema);