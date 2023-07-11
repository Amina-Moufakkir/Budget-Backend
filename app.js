const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();

const userController = require('./controllers/userController');
const incomeController = require('./controllers/incomeController');
const expenseController = require('./controllers/expenseController');

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/v1/income', incomeController);
app.use('/api/v1/expenses', expenseController);
app.use('/api/v1/users', userController);

module.exports = app;
