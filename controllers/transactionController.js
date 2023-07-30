const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Transaction = require('../models/transactionModel');
const BadRequestError = require('../error-helpers/badRequest');
const NotFoundError = require('../error-helpers/notFound');
const checkPermissions = require('../utils/checkPermissions');
const CustomAPIError = require('../error-helpers/customError');

const moment = require('moment');

// Create a new transaction
router.post('/', async (req, res) => {
  const { name, transactionType, amount, date, categoryType, description } =
    req.body;

  if (!name || !amount) {
    throw new BadRequestError('Please Provide All Values');
  }
  const transaction = await Transaction.create({
    name,
    transactionType,
    amount,
    date,
    categoryType,
    description,
    createdBy: req.user.userId,
  });
  res.status(201).json({ transaction });
});

// Get all Transactions
router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.find({
      createdBy: req.user.userId,
    }).sort({ createdAt: -1 });
    res.status(200).json({
      transactions,
      totalMoney: 0,
      moneyIn: 0,
      moneyOut: 0,
      numOfPages: 1,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Server Error',
    });
  }
});

// Update Transaction
router.put('/:id', async (req, res) => {
  const { id: transactionId } = req.params;
  const { name, amount } = req.body;

  if (!name || !amount) {
    throw new BadRequestError('Please Provide All Values');
  }
  const transaction = await Transaction.findOne({ _id: transactionId });

  if (!transaction) {
    throw new NotFoundError(`No transaction with id ${transactionId}`);
  }

  // check for permission
  checkPermissions(req.user, transaction.createdBy);

  const updatedTransaction = await Transaction.findOneAndUpdate(
    { _id: transactionId },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({ updatedTransaction });
});

// Delete Transaction by id
router.delete('/:id', async (req, res) => {
  const { id: transactionId } = req.params;
  const transaction = await Transaction.findById(transactionId);

  if (!transaction) {
    throw new CustomAPIError.NotFoundError(
      `No transaction was found with ID: ${transactionId}`
    );
  }

  // check for permission
  checkPermissions(req.user, transaction.createdBy);

  await Transaction.deleteOne({ _id: transactionId });

  res.status(200).json({ msg: 'Transaction deleted successfully' });
});

// get stats
router.get('/stats', async (req, res) => {
  console.log(req.user);
  let stats = await Transaction.aggregate([
    { $match: { createdBy: new mongoose.Types.ObjectId(req.user.userId) } },
    { $group: { _id: '$transactionType', totalAmount: { $sum: '$amount' } } },
  ]);
  console.log('Aggregation Result:', stats);
  stats = stats.reduce((acc, curr) => {
    const { _id: title, totalAmount } = curr;
    acc[title] = totalAmount;
    return acc;
  }, {});

  const defaultStats = {
    income: stats.Income || 0,
    expenses: stats.Expenses || 0,
    balance: (stats.Income || 0) - (stats.Expenses || 0),
  };

  let monthlyTransactions = await Transaction.aggregate([
    { $match: { createdBy: new mongoose.Types.ObjectId(req.user.userId) } },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
        },
        income: {
          $sum: {
            $cond: [{ $eq: ['$transactionType', 'Income'] }, '$amount', 0],
          },
        },
        expenses: {
          $sum: {
            $cond: [{ $eq: ['$transactionType', 'Expenses'] }, '$amount', 0],
          },
        },
      },
    },
    {
      $addFields: {
        balance: { $subtract: ['$income', '$expenses'] },
      },
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 6 },
  ]);

  monthlyTransactions.forEach((item) => {
    const {
      _id: { year, month },
    } = item;
    const date = moment()
      .month(month - 1)
      .year(year)
      .format('MMM Y');
    item.date = date;
  });

  monthlyTransactions.sort(
    (a, b) => b._id.year - a._id.year || b._id.month - a._id.month
  );

  res.status(200).json({ defaultStats, monthlyTransactions });
});

module.exports = router;
