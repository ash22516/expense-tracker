const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/expense_tracker';
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('\nCould not connect to MongoDB at:', uri);
    console.error('Make sure MongoDB is installed and running, then try again.\n');
    process.exit(1);
  }
}

module.exports = connectDB;
