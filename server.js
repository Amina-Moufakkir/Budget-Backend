require('dotenv').config();
const app = require('./app');
const connectDB = require('./db/db');

connectDB();

const PORT = process.env.PORT || 8080;

app.listen(PORT, (req, res) => {
  console.log(`Server is now running on PORT: ${PORT}`);
});
