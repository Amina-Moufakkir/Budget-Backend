const express = require('express');
const router = express.Router();
const UserSchema = require('../models/userModel');
const generateToken = require('../middlewares/generateToken');

// Register
router.post('/register', async (req, res) => {
  const { firstName, lastName, email, password } = req?.body;

  try {
    const userFound = await UserSchema.findOne({ email });
    if (userFound)
      return res
        .status(409)
        .json({ status: false, message: 'User already exists' });

    const user = await UserSchema.create({
      firstName,
      lastName,
      email,
      password,
    });

    res.status(200).json(user);
  } catch (err) {
    console.log(err);
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  // find the user in the database
  const userFound = await UserSchema.findOne({ email });

  // compare the user password
  if (userFound && (await userFound?.isPasswordValid(password))) {
    res.json({
      id: userFound?._id,
      firstName: userFound?.firstName,
      lastName: userFound?.lastName,
      email: userFound?.email,
      isAdmin: userFound?.isAdmin,
      token: generateToken(userFound?._id),
    });
  } else {
    res.status(401).json({
      status: false,
      message: 'Invalid Login Credentials',
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const users = await UserSchema.find({});
    res.json(users);
  } catch (err) {
    res.json(err);
  }
});

module.exports = router;
