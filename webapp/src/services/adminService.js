// src/services/adminService.js
import api from './api'; // Your configured axios instance

// --- Crypto Management ---
export const getManagedCryptos = async () => {
  try {
    const response = await api.get('/cryptos/admin/all'); // GET /api/cryptos/admin/all
    return response.data;
  } catch (error) {
    console.error('Error fetching managed cryptos:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch managed cryptocurrencies');
  }
};

export const addManagedCrypto = async (cryptoData) => {
  // cryptoData: { code, name, coingeckoId, imageUrl }
  try {
    const response = await api.post('/cryptos', cryptoData); // POST /api/cryptos
    return response.data;
  } catch (error) {
    console.error('Error adding managed crypto:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to add cryptocurrency');
  }
};

export const deleteManagedCrypto = async (coingeckoId) => {
  try {
    // Our backend route is DELETE /api/cryptos/admin/:coingeckoId
    // If your backend delete route was just /api/cryptos/:id (using coingeckoId as id)
    // then the URL would be different. Let's assume the admin-specific path.
    const response = await api.delete(`/cryptos/admin/${coingeckoId}`);
    return response.data; // Expects { message: 'Cryptocurrency ... removed' }
  } catch (error) {
    console.error(`Error deleting managed crypto ${coingeckoId}:`, error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to delete cryptocurrency');
  }
};

export const getRSSFeeds = async () => {
  try {
    const response = await api.get('/rss-feeds'); // GET /api/rss-feeds
    return response.data;
  } catch (error) {
    console.error('Error fetching RSS feeds:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch RSS feeds');
  }
};

export const addRSSFeed = async (feedData) => {
  // feedData: { name, url }
  try {
    const response = await api.post('/rss-feeds', feedData); // POST /api/rss-feeds
    return response.data;
  } catch (error) {
    console.error('Error adding RSS feed:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to add RSS feed');
  }
};

export const updateRSSFeed = async (feedId, feedData) => {
  // feedData: { name, url }
  try {
    const response = await api.put(`/rss-feeds/${feedId}`, feedData); // PUT /api/rss-feeds/:id
    return response.data;
  } catch (error) {
    console.error(`Error updating RSS feed ${feedId}:`, error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to update RSS feed');
  }
};

export const deleteRSSFeed = async (feedId) => {
  try {
    const response = await api.delete(`/rss-feeds/${feedId}`); // DELETE /api/rss-feeds/:id
    return response.data; // Expects { message: 'RSS feed source removed successfully' }
  } catch (error) {
    console.error(`Error deleting RSS feed ${feedId}:`, error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to delete RSS feed');
  }
};

export const getAllAppPreferences = async () => {
  try {
    const response = await api.get('/preferences'); // GET /api/preferences
    return response.data;
  } catch (error) {
    console.error('Error fetching preferences:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch application preferences');
  }
};

export const setAppPreference = async (preferenceData) => {
  // preferenceData: { key, value, description? }
  // Note: 'value' can be string, number, boolean, array, or object.
  // If it's an array or object, it should be properly formatted JSON in the request body.
  // Our form will handle simple string/number inputs, and textareas for arrays/JSON strings.
  try {
    const response = await api.post('/preferences', preferenceData); // POST /api/preferences
    return response.data;
  } catch (error) {
    console.error('Error setting preference:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to set application preference');
  }
};

export const deleteAppPreference = async (preferenceKey) => {
  try {
    const response = await api.delete(`/preferences/${preferenceKey}`); // DELETE /api/preferences/:key
    return response.data; // Expects { message: 'Preference ... deleted' }
  } catch (error) {
    console.error(`Error deleting preference ${preferenceKey}:`, error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to delete application preference');
  }
};