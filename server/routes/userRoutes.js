const express = require('express');
const router = express.Router();
const passport = require('passport'); 
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  logoutUser,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const generateToken = require('../utils/generateToken'); 

router.post('/register', registerUser);
router.post('/login', loginUser);

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/logout', protect, logoutUser); 

router.get(
  '/auth/google', 
  passport.authenticate('google', {
    scope: ['profile', 'email'], 
    session: false,
  })
);

router.get(
  '/auth/google/callback', 
  passport.authenticate('google', {
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?oauth_error=google_failed`,
    session: false,
  }),
  (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Google authentication failed, user not found or created.' });
    }

    const token = generateToken(req.user._id); 

    const frontendRedirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/oauth-callback?token=${token}`;
    res.redirect(frontendRedirectUrl);
  }
);

module.exports = router;