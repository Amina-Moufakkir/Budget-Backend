const notFoundMiddleware = (req, res, next) => {
  const error = new Error(`${req.originalUrl} - Not Found`);
  error.statusCode = 404;
  next(error);
};

const errorHandlerMiddleware = (err, req, res, next) => {
  console.log(err);
  const defaultError = {
    statusCode: err.statusCode || 500,
    msg: err.message || 'Something went wrong, please try again later',
  };
  if (err.name === 'ValidationError') {
    defaultError.statusCode = 400;

    defaultError.msg = Object.values(err.errors)
      .map((value) => value.message)
      .join('. ');
  }
  if (err.code && err.code === 11000) {
    defaultError.statusCode = 400;
    defaultError.msg = `${Object.keys(err.deyValue)} field has to be unique`;
  }

  res.status(defaultError.statusCode).json({ msg: defaultError.msg });
};

module.exports = { errorHandlerMiddleware, notFoundMiddleware };
