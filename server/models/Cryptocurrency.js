const mongoose = require('mongoose');

const CryptocurrencySchema = new mongoose.Schema({
  code: { 
    type: String,
    required: true,
    uppercase: true,
    trim: true,
  },
  coingeckoId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  imageUrl: { 
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});
CryptocurrencySchema.index({ code: 1 }, { unique: true });


module.exports = mongoose.model('Cryptocurrency', CryptocurrencySchema);