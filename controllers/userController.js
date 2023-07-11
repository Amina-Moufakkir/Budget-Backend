const mongoose = require('mongoose');
const expressAsyncHandler = require('express-async-handler');
const express = require('express');
const router = express.Router();
const UserSchema = require('../models/userModel');
const generateToken = require('../middlewares/generateToken');

const validateMongodbId = (id) => {
  const isValid = mongoose.Types.ObjectId.isValid(id);
  if (!isValid) throw new Error('The id is not valid or found');
};

// Register
router.post(
  '/register',
  expressAsyncHandler(async (req, res) => {
    const userExists = await UserSchema.findOne({ email: req?.body?.email });

    if (userExists) throw new Error('User already exists');
    try {
      const user = await UserSchema.create({
        firstName: req?.body?.firstName,
        lastName: req?.body?.lastName,
        email: req?.body?.email,
        password: req?.body?.password,
      });
      res.json(user);
    } catch (error) {
      res.json(error);
    }
  })
);

router.post(
  '/login',
  expressAsyncHandler(async (req, res) => {
    const { email, password } = req.body;
    // find the user in the database
    const userFound = await UserSchema.findOne({ email });

    // compare the user password
    if (userFound && (await userFound?.isPasswordValid(password))) {
      res.json({
        _id: userFound?._id,
        firstName: userFound?.firstName,
        lastName: userFound?.lastName,
        email: userFound?.email,
        isAdmin: userFound?.isAdmin,
        token: generateToken(userFound?._id),
      });
    } else {
      res.status(401);
      throw new Error('Invalid Login Credentials');
    }
  })
);

router.get(
  '/',
  expressAsyncHandler(async (req, res) => {
    try {
      const users = await UserSchema.find({});
      res.json(users);
    } catch (err) {
      res.json(err);
    }
  })
);

router.delete(
  '/:id',
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;

    validateMongodbId(id);
    try {
      const deletedUser = await UserSchema.findByIdAndDelete(id);
      res.json(deletedUser);
    } catch (error) {
      res.json(error);
    }
  })
);

router.get(
  '/:id',
  expressAsyncHandler(async (req, res) => {
    const { id } = req.params;
    //check if user id is valid
    validateMongodbId(id);
    try {
      const user = await UserSchema.findById(id);
      res.json(user);
    } catch (error) {
      res.json(error);
    }
  })
);

router.get(
  '/profile',
  expressAsyncHandler(async (req, res) => {
    const { _id } = req?.user;

    try {
      const myProfile = await UserSchema.findById(_id).populate([
        'expenses',
        'income',
      ]);

      res.json(myProfile);
    } catch (error) {
      res.json(error);
    }
  })
);

router.put(
  '/:id',
  expressAsyncHandler(async (req, res) => {
    const { _id } = req?.user;
    validateMongodbId(_id);
    const user = await UserSchema.findByIdAndUpdate(
      _id,
      {
        firstName: req?.body?.firstName,
        lastName: req?.body?.lastName,
        email: req?.body?.email,
      },
      {
        new: true,
        runValidators: true,
      }
    );
    res.json(user);
  })
);

module.exports = router;
