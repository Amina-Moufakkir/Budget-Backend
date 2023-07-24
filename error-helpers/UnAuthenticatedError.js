const CustomAPIError = require('./customError');

class UnAuthenticatedError extends CustomAPIError {
  constructor(message) {
    super(message);
    this.statusCode = 401;
  }
}

module.exports = UnAuthenticatedError;
