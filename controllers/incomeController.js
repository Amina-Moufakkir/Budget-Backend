const expressAsyncHandler = require('express-async-handler');
const express = require('express');
const router = express.Router();
const IncomeSchema = require('../models/incomeModel');
const authMiddleware = require('../middlewares/authMiddleware');

// Create a new income
router.post(
  '/',
  expressAsyncHandler(async (req, res) => {
    const { title, amount, date, category, description } = req.body;

    try {
      const income = await IncomeSchema.create({
        title,
        amount,
        date,
        category,
        description,
        user: req?.user?._id,
      });
      res.json(income);
    } catch (error) {
      res.json(error);
    }
  })
);

// Get all income records
router.get(
  '/',
  expressAsyncHandler(async (req, res) => {
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
  })
);

// Get one income by id
router.get(
  '/:id',
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
      const singleIncome = await IncomeSchema.findById(id);

      res.status(200).json({
        status: true,
        data: singleIncome,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  })
);

// Update Income
router.put(
  '/:id',
  expressAsyncHandler(async (req, res) => {
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

      res.json(income);
    } catch (error) {
      res.json(error);
    }
  })
);

// Delete Income by id
router.delete(
  '/:id',
  expressAsyncHandler(async (req, res) => {
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
  })
);

module.exports = router;
