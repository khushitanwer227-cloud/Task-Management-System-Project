const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DATABASE_URI || 'mongodb://127.0.0.1:27017/taskcraft');
    console.log(`MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (err) {
    console.error(`Database connection error: ${err.message}`);
    process.exit(1); 
  }
};

module.exports = connectDB;