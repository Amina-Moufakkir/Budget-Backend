const express = require('express');
const router = express.Router();

let transactionsModel = require('../models/transactionModel');

// Get all transactions
router.get('/transactions', (req, res) => {
  res.json(transactionsModel);
});

// Get a specific transaction by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;

  const match = transactionsModel.find((item) => item.id === parseInt(id));

  if (!match) {
    res.status(404).json({
      status: false,
      message: 'Transaction not found',
    });
  } else {
    res.status(200).json({ status: true, data: match });
  }
});

// Create a new transaction
router.post('/', (req, res) => {
  const { id, category, amount, description, date } = req.body;

  const newTransaction = {
    id,
    category,
    amount,
    description,
    date,
  };

  transactionsModel.push(newTransaction);

  res.status(201).json({
    status: true,
    message: 'Transaction created successfully',
    data: newTransaction,
  });
});

// Update a transaction
router.put('/:id', (req, res) => {
  const { id } = req.params;

  const matchIndex = transactionsModel.findIndex(
    (item) => item.id === parseInt(id)
  );

  if (matchIndex === -1) {
    res.status(404).json({
      status: false,
      message: 'Transaction not found',
    });
  } else {
    const { category, amount, description, date } = req.body;

    transactionsModel[matchIndex] = {
      id: parseInt(id),
      category,
      amount,
      description,
      date,
    };

    res.status(200).json({
      status: true,
      message: 'Transaction updated successfully',
      data: transactionsModel[matchIndex],
    });
  }
});

// Delete a transaction
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const matchIndex = transactionsModel.findIndex(
    (item) => item.id === parseInt(id)
  );

  if (matchIndex === -1) {
    res.status(404).json({
      status: false,
      message: 'Transaction not found',
    });
  } else {
    const deletedTransaction = transactionsModel.splice(matchIndex, 1)[0];

    res.status(200).json({
      status: true,
      message: 'Transaction deleted successfully',
      data: deletedTransaction,
    });
  }
});

module.exports = router;
