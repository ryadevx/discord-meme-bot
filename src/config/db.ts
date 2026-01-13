import mongoose from "mongoose";

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI is not defined");
  }

  while (true) {
    try {
      await mongoose.connect(mongoUri);
      console.log("MongoDB connected successfully");
      break;
    } catch (error) {
      console.error("MongoDB connection failed. Retrying in 5 seconds...");
      await new Promise((res) => setTimeout(res, 5000));
    }
  }
};
