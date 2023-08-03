const mongoose = require('mongoose');

const db = async () => {
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(process.env.MONGO_URI);
    console.log('DB connection established');
  } catch (e) {
    console.log('DB connection error', e);
  }
};

module.exports = db;
