const jwt = require('jsonwebtoken');
const userSchema = require('../models/userModel');

const authMiddleware = async (req, res, next) => {
  let token;

  if (req?.headers?.authorization?.startsWith('Bearer')) {
    token = req?.headers?.authorization?.split(' ')[1];
    try {
      if (token) {
        const decodedUser = jwt.verify(token, process.env.JWT_KEY);
        const user = await userSchema.findById(decodedUser.id);

        req.user = user;
        next();
      }
    } catch (e) {
      console.log('Not Authorized', e);
    }
  } else {
    return res.status(403).json({
      status: false,
      message: 'No Token Found',
    });
  }
};

module.exports = authMiddleware;
