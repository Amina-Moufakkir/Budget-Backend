const mongoose = require('mongoose');
require('dotenv').config();
const db = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`DB connection established: ${conn.connection.host}`);
  } catch (e) {
    console.log('DB connection error', e);
  }
};

module.exports = db;
