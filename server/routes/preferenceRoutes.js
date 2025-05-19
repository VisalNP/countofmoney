const express = require('express');
const router = express.Router();
const {
  getAllPreferences,
  getPreferenceByKey,
  setPreference,
  deletePreferenceByKey,
} = require('../controllers/preferenceController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect, admin);

router.route('/')
  .get(getAllPreferences) 
  .post(setPreference);   

router.route('/:key')
  .get(getPreferenceByKey)   
  .delete(deletePreferenceByKey); 
module.exports = router;