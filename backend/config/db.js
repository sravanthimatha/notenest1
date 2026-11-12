const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/notenest';
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host} / ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    console.error('Tip: Start MongoDB locally or set MONGO_URI in backend/.env to your MongoDB Atlas connection string.');
    process.exit(1);
  }
};

module.exports = connectDB;
