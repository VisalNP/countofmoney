const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  link: { 
    type: String,
    required: true,
    unique: true, 
    trim: true,
  },
  guid: { 
    type: String,
    sparse: true, 
    unique: true,
    trim: true,
  },
  summary: { 
    type: String,
    trim: true,
  },
  sourceName: { 
    type: String,
    required: true,
  },
  sourceUrl: {
    type: String,
    required: true,
  },
  pubDate: { 
    type: Date,
  },
  isoDate: { 
    type: String,
  },
  imageUrl: { 
    type: String,
    trim: true,
  },
  categories: { 
    type: [String],
    default: []
  }
}, {
  timestamps: true, 
});

ArticleSchema.index({ pubDate: -1 });
ArticleSchema.index({ link: 1 });
ArticleSchema.index({ guid: 1 });
ArticleSchema.index({
    title: 'text',
    summary: 'text',
});

module.exports = mongoose.model('Article', ArticleSchema);