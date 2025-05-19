// server/config/passportSetup.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User'); 
const generateToken = require('../utils/generateToken'); 
require('dotenv').config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL, 
      scope: ['profile', 'email'], 
    },
    async (accessToken, refreshToken, profile, done) => {

      try {
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          return done(null, user); 
        } else {
          user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            user.googleId = profile.id;
            if (!user.nickname || user.nickname === user.email) {
                user.nickname = profile.displayName || profile.emails[0].value.split('@')[0];
            }
            await user.save();
            return done(null, user);
          } else {
            const newUser = new User({
              googleId: profile.id,
              email: profile.emails[0].value,
              nickname: profile.displayName || profile.emails[0].value.split('@')[0],
            });
            await newUser.save();
            return done(null, newUser);
          }
        }
      } catch (error) {
        console.error('Error in Google OAuth Strategy:', error);
        return done(error, false);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, false);
  }
});
