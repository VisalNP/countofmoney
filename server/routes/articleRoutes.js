const express = require('express');
const router = express.Router();
const { getArticles, getArticleById } = require('../controllers/articleController');
const { optionalProtect } = require('../middleware/optionalAuthMiddleware'); 
router.get('/', optionalProtect, getArticles);
router.get('/:id', optionalProtect, getArticleById);

module.exports = router;