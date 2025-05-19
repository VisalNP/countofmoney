const Parser = require('rss-parser');
const Article = require('../models/Article');
const RSSFeedSource = require('../models/RSSFeedSource'); 

const parser = new Parser({
    customFields: {
    }
});

const fetchAndStoreArticlesFromSource = async (feedSource) => {
  console.log(`Fetching articles from: ${feedSource.name} (${feedSource.url})`);
  try {
    const feed = await parser.parseURL(feedSource.url);
    let newArticlesCount = 0;

    for (const item of feed.items) {
      const uniqueIdentifier = item.guid || item.link;
      if (!uniqueIdentifier) {
          console.warn(`Skipping item without guid or link from ${feedSource.name}: ${item.title}`);
          continue;
      }

      const query = item.guid ? { guid: item.guid } : { link: item.link };
      const existingArticle = await Article.findOne(query);

      if (!existingArticle) {
        const articleData = {
          title: item.title?.trim(),
          link: item.link?.trim(),
          guid: item.guid?.trim(),
          summary: item.contentSnippet?.trim() || item.content?.trim() || item.summary?.trim(),
          sourceName: feedSource.name,
          sourceUrl: feedSource.url,
          pubDate: item.pubDate ? new Date(item.pubDate) : null,
          isoDate: item.isoDate,
          imageUrl: item.enclosure?.url || (item['media:content'] && item['media:content'].$?.url) || null,
          categories: Array.isArray(item.categories) ? item.categories.map(c => typeof c === 'string' ? c.trim() : c.name?.trim()).filter(Boolean) : []
        };

        if (!articleData.title || !articleData.link) {
            console.warn(`Skipping item with missing title or link from ${feedSource.name}: Link: ${articleData.link}, Title: ${articleData.title}`);
            continue;
        }


        await Article.create(articleData);
        newArticlesCount++;
      }
    }
    if (newArticlesCount > 0) {
      console.log(`Added ${newArticlesCount} new articles from ${feedSource.name}.`);
    } else {
      console.log(`No new articles found from ${feedSource.name}.`);
    }
  } catch (error) {
    console.error(`Error fetching or parsing RSS feed from ${feedSource.name} (${feedSource.url}):`, error.message);
  }
};

const fetchAllArticles = async () => {
  console.log('Starting scheduled job: Fetching all articles...');
  try {
    const sources = await RSSFeedSource.find({});
    if (!sources.length) {
        console.log('No RSS feed sources found in the database. Skipping article fetch.');
        return;
    }

    for (const source of sources) {
      await fetchAndStoreArticlesFromSource(source);
    }
    console.log('Finished scheduled job: Fetching all articles.');
  } catch (error) {
    console.error('Error in fetchAllArticles job:', error);
  }
};

module.exports = {
  fetchAllArticles,
  fetchAndStoreArticlesFromSource,
};