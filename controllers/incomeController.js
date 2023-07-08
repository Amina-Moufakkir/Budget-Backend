const express = require('express');
const router = express.Router();
const IncomeSchema = require('../models/incomeModel');

router.post('/add-income', async (req, res) => {
  const { title, amount, category, date, description } = req.body;

  const income = IncomeSchema({
    title,
    amount,
    category,
    description,
    date,
  });
  //   console.log(income);
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
    await income.save();
    res.status(200).json({
      status: true,
      message: 'Income Added Successfully',
      data: income,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Server Error',
    });
  }
});

router.get('/get-incomes', async (req, res) => {
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

// Update Income
router.put('/update-income/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const income = await IncomeSchema.findById(id);

    if (!income) {
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

// Patch the expense
router.patch('/update-income/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const income = await IncomeSchema.findById(id);

    if (!income) {
      res.status(404).json({
        status: false,
        message: 'Income not found',
      });
      return;
    }

    // Update only the fields(income) that are provided in the request body
    const allowedFields = [
      'title',
      'amount',
      'category',
      'date',
      'description',
    ];

    for (const field of allowedFields) {
      if (req.body[field]) {
        income[field] = req.body[field];
      }
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

// Delete Income
router.delete('/delete-income/:id', async (req, res) => {
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
