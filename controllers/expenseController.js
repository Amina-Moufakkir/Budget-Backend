const express = require('express');
const router = express.Router();
const ExpenseSchema = require('../models/expenseModel');
const authMiddleware = require('../middlewares/authMiddleware');

// Create a new expense
router.post('/', authMiddleware, async (req, res) => {
  const { title, amount, date, category, description, user } = req.body;

  const expenses = ExpenseSchema({
    title,
    amount,
    date,
    category,
    description,
    user,
  });
  console.log(expenses);
  try {
    // Validations
    if (!title || !amount || !category || !description || !date) {
      res.status(400).json({
        status: false,
        message: 'All fields must be provided',
      });
    } else if (isNaN(amount) || amount <= 0) {
      res.status(400).json({
        status: false,
        message: 'Please enter a valid number for the amount',
      });
    }
    await expenses.save();
    res.status(200).json({
      status: true,
      message: 'Expense Added Successfully',
      data: expenses,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Server Error',
    });
  }
});

// Get all expenses
router.get('/', authMiddleware, async (req, res) => {
  try {
    const expenses = await ExpenseSchema.find().sort({ createdAt: -1 });
    res.status(200).json({
      status: true,
      message: 'List of Expenses found',
      data: expenses,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Server Error',
    });
  }
});

// Get one expense by id
router.get('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const singleExpense = await ExpenseSchema.findById(id);

    if (!singleExpense) {
      res.status(404).json({
        status: false,
        message: 'Expense not found',
      });
      return;
    }

    res.status(200).json({
      status: true,
      data: singleExpense,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Expense
router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { title, amount, category, date, description } = req.body;

  try {
    const expense = await ExpenseSchema.findByIdAndUpdate(
      id,
      {
        title,
        amount,
        category,
        date,
        description,
      },
      { new: true }
    );

    if (!expense) {
      res.status(404).json({
        status: false,
        message: 'Expense not found',
      });
      return;
    }

    if (!title || !amount || !category || !description || !date) {
      res.status(400).json({
        status: false,
        message: 'All fields must be provided',
      });
    } else if (isNaN(amount) || amount <= 0) {
      res.status(400).json({
        status: false,
        message: 'Please enter a valid number for the amount',
      });
    }

    await expense.save();

    res.status(200).json({
      status: true,
      message: 'Expense updated successfully',
      data: expense,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Server Error',
    });
  }
});

// Delete Expense
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  ExpenseSchema.findByIdAndDelete(id)
    .then((expense) => {
      res.status(200).json({
        status: true,
        message: 'Expense Deleted',
        data: expense,
      });
    })
    .catch((error) => {
      res.status(500).json({
        status: false,
        message: 'Server Error',
      });
    });
});

module.exports = router;
