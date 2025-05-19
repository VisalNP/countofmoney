const RSSFeedSource = require('../models/RSSFeedSource');
const createRSSFeedSource = async (req, res) => {
  const { name, url } = req.body;

  try {
    if (!name || !url) {
      return res.status(400).json({ message: 'Please provide both name and URL for the RSS feed source' });
    }

    const existingSource = await RSSFeedSource.findOne({ url });
    if (existingSource) {
      return res.status(400).json({ message: 'RSS feed source with this URL already exists' });
    }

    const newSource = new RSSFeedSource({ name, url });
    const createdSource = await newSource.save();

    res.status(201).json(createdSource);
  } catch (error) {
    console.error('Error creating RSS feed source:', error);
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error while creating RSS feed source' });
  }
};

const getAllRSSFeedSources = async (req, res) => {
  try {
    const sources = await RSSFeedSource.find({}).sort({ createdAt: -1 }); 
    res.json(sources);
  } catch (error) {
    console.error('Error fetching RSS feed sources:', error);
    res.status(500).json({ message: 'Server error while fetching RSS feed sources' });
  }
};

const getRSSFeedSourceById = async (req, res) => {
  try {
    const source = await RSSFeedSource.findById(req.params.id);

    if (!source) {
      return res.status(404).json({ message: 'RSS feed source not found' });
    }
    res.json(source);
  } catch (error) {
    console.error('Error fetching RSS feed source by ID:', error);
    if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'RSS feed source not found (invalid ID format)' });
    }
    res.status(500).json({ message: 'Server error while fetching RSS feed source' });
  }
};

const updateRSSFeedSource = async (req, res) => {
  const { name, url } = req.body;

  try {
    const source = await RSSFeedSource.findById(req.params.id);

    if (!source) {
      return res.status(404).json({ message: 'RSS feed source not found' });
    }
    if (url && url !== source.url) {
        const existingSourceWithNewUrl = await RSSFeedSource.findOne({ url });
        if (existingSourceWithNewUrl && existingSourceWithNewUrl._id.toString() !== source._id.toString()) {
            return res.status(400).json({ message: 'Another RSS feed source with this URL already exists' });
        }
    }

    source.name = name || source.name;
    source.url = url || source.url;

    const updatedSource = await source.save();
    res.json(updatedSource);
  } catch (error) {
    console.error('Error updating RSS feed source:', error);
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ message: messages.join(', ') });
    }
    if (error.kind === 'ObjectId') {
        return res.status(404).json({ message: 'RSS feed source not found (invalid ID format)' });
    }
    res.status(500).json({ message: 'Server error while updating RSS feed source' });
  }
};
const deleteRSSFeedSource = async (req, res) => {
  try {
    const deletedSource = await RSSFeedSource.findByIdAndDelete(req.params.id);

    if (!deletedSource) {
      return res.status(404).json({ message: 'RSS feed source not found' });
    }

    res.json({ message: `RSS feed source '${deletedSource.name}' removed successfully` });
  } catch (error) {
    console.error('Error deleting RSS feed source:', error);
    if (error.kind === 'ObjectId') { 
        return res.status(404).json({ message: 'RSS feed source not found (invalid ID format)' });
    }
    res.status(500).json({ message: 'Server error while deleting RSS feed source' });
  }
};

module.exports = {
  createRSSFeedSource,
  getAllRSSFeedSources,
  getRSSFeedSourceById,
  updateRSSFeedSource,
  deleteRSSFeedSource,
};