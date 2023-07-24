const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const BadRequestError = require('../error-helpers/badRequest');
const UnAuthenticatedError = require('../error-helpers/UnAuthenticatedError');
const authMiddleware = require('../middlewares/authMiddleware');

// Register
router.post('/register', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  // Check if all fields are provided, if not throw an error
  if (!firstName || !lastName || !email || !password) {
    throw new BadRequestError('Please enter all values.');
  }

  // Check for duplicate emails
  const userAlreadyRegistered = await User.findOne({ email });
  if (userAlreadyRegistered) {
    throw new BadRequestError('Email Already Exists');
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
  });
  const token = user.createJWT();
  return res.status(201).json({
    user: {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: user.password,
    },
    token,
    isAdmin: user.isAdmin,
  });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError('Please enter all values.');
  }
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new UnAuthenticatedError('Invalid Credentials');
  }
  // compare passwords
  console.log(user);
  const isPasswordMatching = await user.comparePassword(password);
  if (!isPasswordMatching) {
    throw new UnAuthenticatedError('Invalid Credentials');
  }
  const token = user.createJWT();
  user.password = undefined;
  res.status(200).json({ user, token, isAdmin: user.isAdmin });
});

router.get('/', async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (err) {
    res.json(err);
  }
});

router.patch('/update-user', authMiddleware, async (req, res) => {
  // console.log(req.user);
  const { email, firstName, lastName } = req.body;
  if (!email || !firstName || !lastName) {
    throw new BadRequestError('Please provide all values');
  }
  const user = await User.findOne({ _id: req.user.userId });

  user.email = email;
  user.firstName = firstName;
  user.lastName = lastName;

  await user.save();
  const token = user.createJWT();
  res.status(200).json({
    user: {
      user,
      token,
    },
  });
});

module.exports = router;

// router.delete('/:id', async (req, res) => {
//   const { id } = req.params;

//   validateMongodbId(id);
//   try {
//     const deletedUser = await User.findByIdAndDelete(id);
//     res.json(deletedUser);
//   } catch (error) {
//     res.json(error);
//   }
// });

// router.get('/profile', async (req, res) => {
//   const { _id } = req?.user;

//   try {
//     const myProfile = await User.findById(_id).populate([
//       'expenses',
//       'income',
//     ]);

//     res.json(myProfile);
//   } catch (error) {
//     res.json(error);
//   }
// });
