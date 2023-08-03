const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');

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
app.use(helmet());
app.use(xss());
app.use(mongoSanitize());

app.use('/api/v1/users', userController);
app.use('/api/v1/transactions', transactionController);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

module.exports = app;
