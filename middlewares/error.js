// Middleware to handle "Not Found" errors
const notFoundMiddleware = (req, res, next) => {
  // Create a new error with a message indicating the URL was not found
  const error = new Error(`${req.originalUrl} - Not Found`);

  // Set the status code of the error to 404 (Not Found)
  error.statusCode = 404;

  // Pass the error to the next middleware or error handler
  next(error);
};

// Middleware to handle errors in the application
const errorHandlerMiddleware = (err, req, res, next) => {
  // Log the error to the console for debugging purposes
  console.log(err);

  // Create a default error object with a status code of 500 (Internal Server Error)
  const defaultError = {
    statusCode: err.statusCode || 500,
    msg: err.message || 'Something went wrong, please try again later',
  };

  // If the error is a Mongoose validation error, update the status code to 400 (Bad Request)
  // and concatenate error messages from the validation errors
  if (err.name === 'ValidationError') {
    defaultError.statusCode = 400;
    defaultError.msg = Object.values(err.errors)
      .map((value) => value.message)
      .join('. ');
  }

  // If the error is a MongoDB duplicate key error (11000), update the status code to 400 (Bad Request)
  // and modify the error message to indicate the field that has to be unique
  if (err.code && err.code === 11000) {
    defaultError.statusCode = 400;
    defaultError.msg = `${Object.keys(err.keyValue)} field has to be unique`;
  }

  // Send the error response with the appropriate status code and message
  res.status(defaultError.statusCode).json({ msg: defaultError.msg });
};

module.exports = { errorHandlerMiddleware, notFoundMiddleware };
