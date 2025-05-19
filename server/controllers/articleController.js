const Article = require('../models/Article');
const User = require('../models/User');
const AppPreference = require('../models/AppPreference'); 
const getArticles = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10; 
    
    let query = {};
    let sortOptions = { pubDate: -1, createdAt: -1 }; 
    let isAnonymousTopKRequest = false;

    try {
        if (req.user && req.user.pressKeywords && req.user.pressKeywords.length > 0) {
            const userKeywords = req.user.pressKeywords;
            const searchText = userKeywords.join(' ');
            query = { $text: { $search: searchText } };
            sortOptions = { score: { $meta: "textScore" }, ...sortOptions };
        } else {
            isAnonymousTopKRequest = true;
            const kPreference = await AppPreference.findOne({ key: 'anonymousHomepageArticleCount' });
            const articlesToFetchForAnonymous = kPreference && kPreference.value ? parseInt(kPreference.value) : 10; 
            limit = articlesToFetchForAnonymous; 
        }

        const skip = (page - 1) * limit;

        const articles = await Article.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(limit)
            .select('id title link imageUrl pubDate sourceName summary'); 
        const countQueryForTotal = (isAnonymousTopKRequest) ? {} : query;
        const totalArticlesCount = await Article.countDocuments(countQueryForTotal);

        res.json({
            articles,
            currentPage: page,
            totalPages: isAnonymousTopKRequest ? 1 : Math.ceil(totalArticlesCount / limit),
            totalResults: isAnonymousTopKRequest ? articles.length : totalArticlesCount, 
        });

    } catch (error) {
        console.error('Error fetching articles:', error);
        res.status(500).json({ message: 'Server error fetching articles' });
    }
};

const getArticleById = async (req, res) => {
    try {
        const article = await Article.findById(req.params.id)
            .select('id title summary sourceName pubDate link imageUrl categories');

        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }

        res.json({
            articleId: article._id,
            title: article.title,
            summary: article.summary,
            source: article.sourceName,
            date: article.pubDate,
            articleUrl: article.link,
            imageUrl: article.imageUrl,
        });

    } catch (error) {
        console.error(`Error fetching article by ID ${req.params.id}:`, error);
        if (error.kind === 'ObjectId') {
             return res.status(404).json({ message: 'Article not found (invalid ID format)' });
        }
        res.status(500).json({ message: 'Server error fetching article' });
    }
};

module.exports = {
    getArticles,
    getArticleById,
};