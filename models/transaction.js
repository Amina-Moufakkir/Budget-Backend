const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Enter your transaction.'],
      trim: true,
    },
    transactionType: {
      type: String,
      enum: ['Income', 'Expenses'],
      required: [true, 'Enter your transaction'],
      default: 'Income',
    },
    amount: {
      type: Number,
      required: [true, 'Please enter the amount for this transaction'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Food',
        'Transportation',
        'Entertainment',
        'Shopping',
        'Utilities',
        'Health',
        'Travel',
        'Education',
        'Personal',
        'Groceries',
        'Bills',
        'Other',
      ],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    date: {
      type: Date,
      default: Date.now(),
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', TransactionSchema);
