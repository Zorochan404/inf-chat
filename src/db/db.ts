import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }
    
    // Configure connection with timeout settings optimized for MongoDB Atlas
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000, // Increase timeout for cloud connections
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      bufferCommands: false, // Disable mongoose buffering
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 2, // Maintain a minimum of 2 socket connections
      retryWrites: true, // Retry writes on failure
    });
    
    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🔗 Connection host: ${mongoose.connection.host}:${mongoose.connection.port}`);
    
    // Handle connection events
    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);

  
    
    throw error; // Re-throw to be handled by the server startup
  }
};

export default connectDB;