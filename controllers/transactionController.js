// Import required dependencies and modules
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
  // Extract data from request body
  const { name, transactionType, amount, date, categoryType, description } =
    req.body;

  // Check if required fields are provided
  if (!name || !amount) {
    throw new BadRequestError('Please Provide All Values');
  }

  // Create a new transaction and store it in the database
  const transaction = await Transaction.create({
    name,
    transactionType,
    amount,
    date,
    categoryType,
    description,
    createdBy: req.user.userId, // Associate the transaction with the user who created it
  });
  // Return the created transaction in the response
  res.status(201).json({ transaction });
});

// Get all Transactions
router.get('/', async (req, res) => {
  // Extract query parameters from the request
  const { transactionType, categoryType, search, sort } = req.query;

  // Build the query object based on the provided parameters and the user's ID
  const queryObject = {
    createdBy: req.user.userId,
  };

  if (transactionType && transactionType !== 'all') {
    queryObject.transactionType = transactionType;
  }
  if (categoryType && categoryType !== 'all') {
    queryObject.categoryType = categoryType;
  }
  if (search) {
    queryObject.name = { $regex: search, $options: 'i' };
  }

  // Perform the database query based on the built query object and sort if required
  let result = Transaction.find(queryObject);
  if (sort === 'highest-amount') {
    result = result.sort('-amount');
  }
  if (sort === 'highest-amount') {
    result = result.sort({ amount: -1 });
  }
  if (sort === 'lowest-amount') {
    result = result.sort({ amount: 1 });
  }
  if (sort === 'z-a') {
    result = result.sort('-name');
  }

  // Pagination: Limit the number of results per page and skip records accordingly
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 5;
  const skip = (page - 1) * limit;

  result = result.skip(skip).limit(limit);

  // Execute the query and get the transactions for the current page
  const transactions = await result;

  // Count total transactions that match the query
  const totalTransactions = await Transaction.countDocuments(queryObject);
  const numOfPages = Math.ceil(totalTransactions / limit);

  // Return the paginated transactions along with total transaction count and number of pages
  res.status(200).json({
    transactions,
    totalTransactions,
    numOfPages,
  });
});

// Update Transaction
router.put('/:id', async (req, res) => {
  // Extract transaction ID from the request parameters and data from the request body
  const { id: transactionId } = req.params;
  const { name, amount } = req.body;

  // Check if required fields are provided
  if (!name || !amount) {
    throw new BadRequestError('Please Provide All Values');
  }

  // Find the existing transaction by ID
  const transaction = await Transaction.findOne({ _id: transactionId });

  // If no transaction found, throw an error
  if (!transaction) {
    throw new NotFoundError(`No transaction with id ${transactionId}`);
  }

  // Check if the user has permission to update the transaction (belongs to the same user)
  checkPermissions(req.user, transaction.createdBy);

  // Update the transaction and return the updated transaction in the response
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
  // Extract transaction ID from the request parameters
  const { id: transactionId } = req.params;

  // Find the existing transaction by ID
  const transaction = await Transaction.findById(transactionId);

  // If no transaction found, throw an error
  if (!transaction) {
    throw new CustomAPIError.NotFoundError(
      `No transaction was found with ID: ${transactionId}`
    );
  }

  // Check if the user has permission to delete the transaction (belongs to the same user)
  checkPermissions(req.user, transaction.createdBy);

  // Delete the transaction and return success message in the response
  await Transaction.deleteOne({ _id: transactionId });

  res.status(200).json({ msg: 'Transaction deleted successfully' });
});

// Get stats for the user's transactions
router.get('/stats', async (req, res) => {
  // Aggregate the user's transactions to get statistics
  let stats = await Transaction.aggregate([
    { $match: { createdBy: new mongoose.Types.ObjectId(req.user.userId) } },
    { $group: { _id: '$transactionType', totalAmount: { $sum: '$amount' } } },
  ]);

  // Log the aggregation result (for debugging purposes)
  console.log('Aggregation Result:', stats);

  // Transform the aggregation result to a more user-friendly format
  stats = stats.reduce((acc, curr) => {
    const { _id: title, totalAmount } = curr;
    acc[title] = totalAmount;
    return acc;
  }, {});

  // If no data is available for a specific type, set it to zero
  const defaultStats = {
    income: stats.Income || 0,
    expenses: stats.Expenses || 0,
    balance: (stats.Income || 0) - (stats.Expenses || 0),
  };

  // Aggregate monthly transactions for the user
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
    { $limit: 12 },
  ]);

  // Transform the aggregated monthly data to include formatted date
  monthlyTransactions = monthlyTransactions.map((item) => {
    const {
      _id: { year, month },
    } = item;
    const date = moment()
      .month(month - 1)
      .year(year)
      .format('MMM Y');
    return { ...item, date };
  });

  // Reverse the monthly data to have the most recent month first
  monthlyTransactions.reverse();

  // Return the user's stats and monthly transaction data in the response
  res.status(200).json({ defaultStats, monthlyTransactions });
});

module.exports = router;
