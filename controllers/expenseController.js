const express = require('express');
const router = express.Router();
const ExpenseSchema = require('../models/expenseModel');

// Create a new Expense
router.post('/add-expense', async (req, res) => {
  //   console.log(req.body);
  const { title, amount, category, date, description } = req.body;

  const expense = ExpenseSchema({
    title,
    amount,
    category,
    description,
    date,
  });
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
    await expense.save();
    res.status(200).json({
      status: true,
      message: 'Expense Added Successfully',
      data: expense,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Server Error',
    });
  }
});

// Get all expenses
router.get('/get-expenses', async (req, res) => {
  try {
    const expenses = await ExpenseSchema.find().sort({ createdAt: -1 });
    res.status(200).json({
      status: true,
      message: 'List of incomes found',
      data: expenses,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Server Error',
    });
  }
});

// Update expense
router.put('/update-expense/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const expense = await ExpenseSchema.findById(id);

    if (!expense) {
      res.status(404).json({
        status: false,
        message: 'Expense not found',
      });
      return;
    }

    const { title, amount, category, date, description } = req.body;

    // Update the fields if they are provided in the request body
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

// Patch the expense
router.patch('/update-expense/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const expense = await ExpenseSchema.findById(id);

    if (!expense) {
      res.status(404).json({
        status: false,
        message: 'Expense not found',
      });
      return;
    }

    // Update only the fields(expense) that are provided in the request body
    const allowedFields = [
      'title',
      'amount',
      'category',
      'date',
      'description',
    ];

    for (const field of allowedFields) {
      if (req.body[field]) {
        expense[field] = req.body[field];
      }
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

// Delete expense
router.delete('/delete-expense/:id', async (req, res) => {
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
