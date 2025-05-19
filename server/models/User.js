const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  nickname: {
    type: String,
    required: [true, 'Nickname is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please fill a valid email address',
    ],
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId;
    },
    minlength: 6,
  },
  defaultCurrency: {
    type: String,
    default: 'EUR',
  },
  preferredCryptos: {
    type: [String],
    default: [],
  },
  pressKeywords: {
    type: [String],
    default: [],
  },
  isAdmin: {
    type: Boolean,
    required: true,
    default: false,
  },
  googleId: {
    type: String,
    sparse: true,
    unique: true,
  },
}, {
  timestamps: true,
});

UserSchema.methods.isOAuthUser = function() {
  return false;
};

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);