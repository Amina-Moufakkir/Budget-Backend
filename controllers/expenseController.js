const expressAsyncHandler = require('express-async-handler');
const express = require('express');
const router = express.Router();
const ExpenseSchema = require('../models/expenseModel');
const authMiddleware = require('../middlewares/authMiddleware');

// Create a new expense
router.post(
  '/',
  expressAsyncHandler(async (req, res) => {
    const { title, amount, date, category, description } = req.body;

    try {
      const expense = await ExpenseSchema.create({
        title,
        amount,
        date,
        category,
        description,
        user: req?.user?._id,
      });
      res.json(expense);
    } catch (error) {
      res.json(error);
    }
  })
);

// Get all expense records
router.get(
  '/',
  expressAsyncHandler(async (req, res) => {
    try {
      const expenses = await ExpenseSchema.find().sort({ createdAt: -1 });
      res.status(200).json({
        status: true,
        message: 'List of expenses found',
        data: expenses,
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: 'Server Error',
      });
    }
  })
);

// Get one expense by id
router.get(
  '/:id',
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
      const singleExpense = await ExpenseSchema.findById(id);

      res.status(200).json({
        status: true,
        data: singleExpense,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  })
);

// Update Expense
router.put(
  '/:id',
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    const { title, amount, category, date, description } = req.body;

    try {
      const expense = await ExpenseSchema.findByIdAndUpdate(id, {
        title,
        amount,
        category,
        date,
        description,
      });

      res.json(expense);
    } catch (error) {
      res.json(error);
    }
  })
);

// Delete expense by id
router.delete(
  '/:id',
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    ExpenseSchema.findByIdAndDelete(id)
      .then((expense) => {
        res.status(200).json({
          status: true,
          message: 'expense Deleted',
          data: expense,
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
