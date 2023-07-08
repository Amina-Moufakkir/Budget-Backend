const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();

const transactionsController = require('./controllers/transactionsController');
const incomeController = require('./controllers/incomeController');
const expenseController = require('./controllers/expenseController');

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// app.get('/', (req, res) => {
//   res.send('Budget App');
// });

// app.use('/api/v1/', transactionsController);
app.use('/api/v1/income', incomeController);
app.use('/api/v1/expense', expenseController);

module.exports = app;
