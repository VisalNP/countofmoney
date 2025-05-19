const mongoose = require('mongoose');

const RSSFeedSourceSchema = new mongoose.Schema({
  name: { 
    type: String,
    required: [true, 'Source name is required'],
    trim: true,
  },
  url: {
    type: String,
    required: [true, 'Source URL is required'],
    unique: true,
    trim: true,
    match: [
        /^(ftp|http|https):\/\/[^ "]+$/,
        'Please fill a valid URL'
    ]
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('RSSFeedSource', RSSFeedSourceSchema);