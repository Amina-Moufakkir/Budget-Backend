const expressAsyncHandler = require('express-async-handler');
const express = require('express');
const router = express.Router();
const Transaction = require('../models/transaction');

// Create a new transaction (income or expense)
router.post(
  '/',
  expressAsyncHandler(async (req, res) => {
    const { name, transactionType, amount, date, category, description } =
      req.body;

    try {
      const transaction = await Transaction.create({
        name,
        transactionType,
        amount,
        date,
        category,
        description,
        createdBy: req?.user?._id,
      });
      res.json(transaction);
    } catch (error) {
      res.json(error);
    }
  })
);

// Get all income and expense records
router.get(
  '/',
  expressAsyncHandler(async (req, res) => {
    try {
      const transactions = await Transaction.find().sort({ createdAt: -1 });
      res.status(200).json({
        status: true,
        message: 'List of transactions found',
        data: transactions,
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: 'Server Error',
      });
    }
  })
);

// Get one transaction by id
router.get(
  '/:id',
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
      const singleTransaction = await Transaction.findById(id);

      res.status(200).json({
        status: true,
        data: singleTransaction,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  })
);

// Update Transaction (income or expense)
router.put(
  '/:id',
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, transactionType, amount, category, date, description } =
      req.body;

    try {
      const transaction = await Transaction.findByIdAndUpdate(
        id,
        {
          name,
          transactionType,
          amount,
          category,
          date,
          description,
        },
        { new: true }
      );

      res.json(transaction);
    } catch (error) {
      res.json(error);
    }
  })
);

// Delete Transaction by id
router.delete(
  '/:id',
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    Transaction.findByIdAndDelete(id)
      .then((transaction) => {
        res.status(200).json({
          status: true,
          message: 'Transaction Deleted',
          data: transaction,
        });
      })
      .catch((error) => {
        res.status(500).json({
          status: false,
          message: 'Server Error',
        });
      });
  })
);

module.exports = router;
