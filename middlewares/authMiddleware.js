// Import required dependencies
const jwt = require('jsonwebtoken');
const UnAuthenticatedError = require('../error-helpers/UnAuthenticatedError');

// Authentication middleware function
const authMiddleware = async (req, res, next) => {
  // Extract the "Authorization" header from the request
  const authHeader = req.headers.authorization;

  // Check if the "Authorization" header exists or starts with "Bearer",
  // if not, throw an UnAuthenticatedError indicating invalid authentication
  if (!authHeader || !authHeader.startsWith('Bearer')) {
    throw new UnAuthenticatedError('Authentication Invalid');
  }

  // Extract the token from the "Authorization" header
  const token = authHeader.split(' ')[1];

  try {
    // Verify the JWT token using the provided JWT secret
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the user ID from the JWT payload to the request object
    req.user = { userId: payload.userId };

    // Proceed to the next middleware or route handler
    next();
  } catch (e) {
    // If an error occurs during JWT verification, throw an UnAuthenticatedError
    // indicating invalid authentication
    throw new UnAuthenticatedError('Authentication Invalid');
  }
};

module.exports = authMiddleware;
