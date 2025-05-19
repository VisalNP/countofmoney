const express = require('express');
const router = express.Router();
const {
  createRSSFeedSource,
  getAllRSSFeedSources,
  getRSSFeedSourceById,
  updateRSSFeedSource,
  deleteRSSFeedSource,
} = require('../controllers/rssFeedController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect, admin);

router.route('/')
  .post(createRSSFeedSource)   
  .get(getAllRSSFeedSources); 

router.route('/:id')
  .get(getRSSFeedSourceById)   
  .put(updateRSSFeedSource)   
  .delete(deleteRSSFeedSource); 

module.exports = router;