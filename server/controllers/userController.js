const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const registerUser = async (req, res) => {
  const { nickname, email, password } = req.body;

  try {
    if (!nickname || !email || !password) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const user = await User.create({
      nickname,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        nickname: user.nickname,
        email: user.email,
        token: generateToken(user._id),
        isAdmin: user.isAdmin, 
        defaultCurrency: user.defaultCurrency,
        preferredCryptos: user.preferredCryptos,
        pressKeywords: user.pressKeywords,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Server error during registration:', error);
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error during registration' });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
        return res.status(400).json({ message: 'Please enter email and password' });
    }
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        nickname: user.nickname,
        email: user.email,
        token: generateToken(user._id),
        isAdmin: user.isAdmin, 
        defaultCurrency: user.defaultCurrency,
        preferredCryptos: user.preferredCryptos,
        pressKeywords: user.pressKeywords,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Server error during login:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};
const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');


  if (user) {
    res.json({
      _id: user._id,
      nickname: user.nickname,
      email: user.email,
      defaultCurrency: user.defaultCurrency,
      preferredCryptos: user.preferredCryptos,
      pressKeywords: user.pressKeywords,
      isAdmin: user.isAdmin, 
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};
const updateUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.nickname = req.body.nickname || user.nickname;
    if (req.body.email && req.body.email !== user.email) {
        const emailExists = await User.findOne({ email: req.body.email });
        if (emailExists && emailExists._id.toString() !== user._id.toString()) {
            return res.status(400).json({ message: 'Email already in use by another account' });
        }
        user.email = req.body.email;
    }

    user.defaultCurrency = req.body.defaultCurrency !== undefined ? req.body.defaultCurrency.toUpperCase() : user.defaultCurrency;
    user.preferredCryptos = Array.isArray(req.body.preferredCryptos) ? req.body.preferredCryptos : user.preferredCryptos;
    user.pressKeywords = Array.isArray(req.body.pressKeywords) ? req.body.pressKeywords : user.pressKeywords;

    if (req.body.password) {
      user.password = req.body.password; 
    }

    try {
      const updatedUser = await user.save();
      res.json({ 
        _id: updatedUser._id,
        nickname: updatedUser.nickname,
        email: updatedUser.email,
        token: generateToken(updatedUser._id), 
        isAdmin: updatedUser.isAdmin,
        defaultCurrency: updatedUser.defaultCurrency,
        preferredCryptos: updatedUser.preferredCryptos,
        pressKeywords: updatedUser.pressKeywords,
      });
    } catch (error) {
        console.error('Error updating profile:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        res.status(500).json({ message: 'Error updating profile' });
    }
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};
const logoutUser = (req, res) => {
  res.json({ message: 'User logged out successfully' });
};
const oauthInitiate = (req, res) => {
  const provider = req.params.provider;
  res.status(501).json({ message: `OAuth with ${provider} not yet implemented. This route should be handled by Passport directly.` });
};

const oauthCallback = (req, res) => {
  const provider = req.params.provider;
  res.status(501).json({ message: `OAuth callback for ${provider} not yet implemented. This route should be handled by Passport directly.` });
};


module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  logoutUser,
};