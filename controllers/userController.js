// Import required dependencies and modules
const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const BadRequestError = require('../error-helpers/badRequest');
const UnAuthenticatedError = require('../error-helpers/UnAuthenticatedError');
const authMiddleware = require('../middlewares/authMiddleware');

// Register a new user
router.post('/register', async (req, res) => {
  // Extract user data from request body
  const { firstName, lastName, email, password } = req.body;

  // Check if all required fields are provided, if not, throw an error
  if (!firstName || !lastName || !email || !password) {
    throw new BadRequestError('Please enter all values.');
  }

  // Check for duplicate emails in the database
  const userAlreadyRegistered = await User.findOne({ email });
  if (userAlreadyRegistered) {
    throw new BadRequestError('Email Already Exists');
  }

  // Create a new user and store it in the database
  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
  });

  // Generate a JSON Web Token (JWT) for the user
  const token = user.createJWT();

  // Return user data (except password) and token in the response
  return res.status(201).json({
    user: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    },
    token,
    isAdmin: user.isAdmin,
  });
});

// User login
router.post('/login', async (req, res) => {
  // Extract email and password from the request body
  const { email, password } = req.body;

  // Check if both email and password are provided, if not, throw an error
  if (!email || !password) {
    throw new BadRequestError('Please enter all values.');
  }

  // Find the user in the database based on the provided email
  const user = await User.findOne({ email }).select('+password');

  // If no user found, throw an authentication error
  if (!user) {
    throw new UnAuthenticatedError('Invalid Credentials');
  }

  // Compare the provided password with the stored password for the user
  const isPasswordMatching = await user.comparePassword(password);

  // If passwords don't match, throw an authentication error
  if (!isPasswordMatching) {
    throw new UnAuthenticatedError('Invalid Credentials');
  }

  // Generate a new JSON Web Token (JWT) for the user
  const token = user.createJWT();

  // Remove the password from the user object before sending it in the response
  user.password = undefined;

  // Return user data (without password) and the token in the response
  res.status(200).json({ user, token, isAdmin: user.isAdmin });
});

// Get all users (for admin use)
router.get('/', async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await User.find({});
    res.json(users);
  } catch (err) {
    res.json(err);
  }
});

// Update User (by the authenticated user)
router.patch('/update-user', authMiddleware, async (req, res) => {
  // Extract email, firstName, and lastName from the request body
  const { email, firstName, lastName } = req.body;

  // Check if all required fields are provided, if not, throw an error
  if (!email || !firstName || !lastName) {
    throw new BadRequestError('Please provide all values');
  }

  // Find the authenticated user in the database based on the user ID stored in the token
  const user = await User.findOne({ _id: req.user.userId });

  // Update the user's email, firstName, and lastName
  user.email = email;
  user.firstName = firstName;
  user.lastName = lastName;

  // Save the updated user to the database
  await user.save();

  // Generate a new JSON Web Token (JWT) for the user (after updating the email or name)
  const token = user.createJWT();

  // Return the updated user data (including token) in the response
  res.status(200).json({
    user: {
      user,
      token,
    },
  });
});

module.exports = router;
