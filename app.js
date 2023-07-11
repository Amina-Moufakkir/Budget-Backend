const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();

const userController = require('./controllers/userController');
const incomeController = require('./controllers/incomeController');
const expenseController = require('./controllers/expenseController');
const { errorHandler, notFound } = require('./middlewares/error');

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/v1/income', incomeController);
app.use('/api/v1/expenses', expenseController);
app.use('/api/v1/users', userController);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
