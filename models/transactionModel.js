const mongoose = require('mongoose');

// Schema Design
const TransactionSchema = new mongoose.Schema({});

module.exports = mongoose.model('Transaction', TransactionSchema);
