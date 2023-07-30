const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Enter your transaction.'],
    },
    amount: {
      type: Number,
      required: [true, 'Please enter the amount for this transaction'],
    },
    transactionType: {
      type: String,
      enum: ['Income', 'Expenses'],
      default: 'Income',
    },

    categoryType: {
      type: String,
      enum: [
        'Salary',
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
        'Other Expenses',
        'Food',
        'Investment',
        'Freelance',
        'Other Income',
      ],
      default: 'Salary',
    },

    description: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide the user'],
    },
    date: {
      type: Date,
      default: Date.now(),
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', TransactionSchema);
