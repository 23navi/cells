import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    if(process.env.MONGODB_URI){
      console.log("Connecting to cloud mongodb")
    }
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/local-api', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as any);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}; 