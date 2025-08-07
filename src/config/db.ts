import { configDotenv } from 'dotenv';
import mongoose from 'mongoose';

configDotenv();

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;
  
  if (!mongoUri) {
    console.error('MONGODB_URI environment variable is not defined');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log(' MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};