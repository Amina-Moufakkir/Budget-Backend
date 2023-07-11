const mongoose = require('mongoose');

const IncomeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      trim: true,
      maxLength: 20,
    },
    type: {
      type: String,
      default: 'income',
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
      required: [true, 'User ID is required'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Income', IncomeSchema);
