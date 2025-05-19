const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const optionalProtect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      console.warn('Optional auth: Invalid token received, proceeding as anonymous.');
      req.user = null;
    }
  }
  next();
};

module.exports = { optionalProtect };