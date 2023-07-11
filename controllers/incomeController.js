const express = require('express');
const router = express.Router();
const IncomeSchema = require('../models/incomeModel');
const authMiddleware = require('../middlewares/authMiddleware');

// Create a new income
router.post('/', authMiddleware, async (req, res) => {
  const { title, amount, date, category, description, user } = req.body;

  const income = IncomeSchema({
    title,
    amount,
    date,
    category,
    description,
    user,
  });
  console.log(income);
  try {
    // Validations
    if (!title || !amount || !category || !description || !date) {
      return res.status(400).json({
        status: false,
        message: 'All fields must be provided',
      });
    } else if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        status: false,
        message: 'Please enter a valid number for the amount',
      });
    }
    await income.save();
    return res.status(200).json({
      status: true,
      message: 'Income Added Successfully',
      data: income,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: 'Server Error',
    });
  }
});

// Get all income records
router.get('/', authMiddleware, async (req, res) => {
  try {
    const incomes = await IncomeSchema.find().sort({ createdAt: -1 });
    res.status(200).json({
      status: true,
      message: 'List of incomes found',
      data: incomes,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Server Error',
    });
  }
});

// Get one income by id
router.get('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const singleIncome = await IncomeSchema.findById(id);

    if (!singleIncome) {
      res.status(404).json({
        status: false,
        message: 'Income not found',
      });
      return;
    }

    res.status(200).json({
      status: true,
      data: singleIncome,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Income
router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { title, amount, category, date, description } = req.body;

  try {
    const income = await IncomeSchema.findByIdAndUpdate(
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

    if (!income) {
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

    await income.save();

    res.status(200).json({
      status: true,
      message: 'Income updated successfully',
      data: income,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Server Error',
    });
  }
});

// Delete Income by id
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  IncomeSchema.findByIdAndDelete(id)
    .then((income) => {
      res.status(200).json({
        status: true,
        message: 'Income Deleted',
        data: income,
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
