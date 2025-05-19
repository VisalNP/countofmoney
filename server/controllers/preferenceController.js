const AppPreference = require('../models/AppPreference');
const getAllPreferences = async (req, res) => {
  try {
    const preferences = await AppPreference.find({});
    res.json(preferences);
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({ message: 'Server error fetching preferences' });
  }
};

const getPreferenceByKey = async (req, res) => {
  try {
    const preference = await AppPreference.findOne({ key: req.params.key });
    if (!preference) {
      return res.status(404).json({ message: `Preference with key '${req.params.key}' not found` });
    }
    res.json(preference);
  } catch (error) {
    console.error(`Error fetching preference by key ${req.params.key}:`, error);
    res.status(500).json({ message: 'Server error fetching preference' });
  }
};

const setPreference = async (req, res) => {
  const { key, value, description } = req.body;

  if (!key || value === undefined) {
    return res.status(400).json({ message: 'Key and value are required' });
  }

  try {
    const updatedPreference = await AppPreference.findOneAndUpdate(
      { key: key }, 
      { $set: { value: value, description: description } }, 
      { new: true, upsert: true, runValidators: true } 
    );
    res.status(200).json(updatedPreference);
  } catch (error) {
    console.error('Error setting preference:', error);
    if (error.name === 'ValidationError') {
        return res.status(400).json({ message: Object.values(error.errors).map(e => e.message).join(', ') });
    }
    res.status(500).json({ message: 'Server error setting preference' });
  }
};
const deletePreferenceByKey = async (req, res) => {
    try {
        const preference = await AppPreference.findOneAndDelete({ key: req.params.key });
        if (!preference) {
            return res.status(404).json({ message: `Preference with key '${req.params.key}' not found` });
        }
        res.json({ message: `Preference '${req.params.key}' deleted successfully` });
    } catch (error) {
        console.error(`Error deleting preference by key ${req.params.key}:`, error);
        res.status(500).json({ message: 'Server error deleting preference' });
    }
};


module.exports = {
  getAllPreferences,
  getPreferenceByKey,
  setPreference,
  deletePreferenceByKey,
};