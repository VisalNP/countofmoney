const express = require('express');
const router = express.Router();
const {
  addCryptocurrency,
  deleteCryptocurrency,
  getAllManagedCryptocurrencies,
  getCryptocurrenciesList,
  getCryptocurrencyDetailsById,
  getCryptocurrencyHistory,
} = require('../controllers/cryptoController');
const { protect, admin } = require('../middleware/authMiddleware');
const { optionalProtect } = require('../middleware/optionalAuthMiddleware'); 

router.route('/')
  .post(protect, admin, addCryptocurrency);

router.route('/admin/all')
   .get(protect, admin, getAllManagedCryptocurrencies);

router.route('/admin/:coingeckoId') 
  .delete(protect, admin, deleteCryptocurrency); 

router.get('/', optionalProtect, getCryptocurrenciesList);


router.get('/:cmid', protect, getCryptocurrencyDetailsById);


router.get('/:cmid/history/:period', protect, getCryptocurrencyHistory);

module.exports = router;