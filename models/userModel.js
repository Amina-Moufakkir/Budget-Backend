const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First Name Is Required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last Name Is Required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email Is Required'],
      validate: {
        validator: validator.isEmail,
        message: 'Please enter a valid email address',
      },
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Password Is Required'],
      default: 'secret123',
      minlength: 8,
      select: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function () {
  // console.log(this.modifiedPaths())
  // console.log(this.isModified('firstName'))
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.createJWT = function () {
  return jwt.sign({ userId: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });
};

UserSchema.methods.comparePassword = async function (userPassword) {
  const isMatch = await bcrypt.compare(userPassword, this.password);
  return isMatch;
};

module.exports = mongoose.model('User', UserSchema);
