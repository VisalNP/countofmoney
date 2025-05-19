const mongoose = require('mongoose');

const AppPreferenceSchema = new mongoose.Schema({
  key: { 
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  value: { 
    type: mongoose.Schema.Types.Mixed, 
    required: true,
  },
  description: {
    type: String,
    trim: true,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('AppPreference', AppPreferenceSchema);