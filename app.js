const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();

const userController = require('./controllers/userController');
const transactionController = require('./controllers/transactionController');

const {
  errorHandlerMiddleware,
  notFoundMiddleware,
} = require('./middlewares/error');
const authMiddleware = require('./middlewares/authMiddleware');

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/v1/users', userController);
app.use('/api/v1/transactions', authMiddleware, transactionController);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

module.exports = app;
