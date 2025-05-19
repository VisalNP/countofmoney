// src/services/cryptoService.js
import api from './api'; // Your configured axios instance

export const getCryptosList = async () => {
  try {
    // The backend's GET /api/cryptos uses optionalProtect,
    // so the token will be sent automatically if present by our api.js interceptor.
    const response = await api.get('/cryptos');
    return response.data;
  } catch (error) {
    console.error('Error fetching cryptos list:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch cryptocurrencies');
  }
};

export const getCryptoDetails = async (coingeckoId) => {
  try {
    // This endpoint GET /api/cryptos/:cmid requires authentication
    const response = await api.get(`/cryptos/${coingeckoId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching crypto details for ${coingeckoId}:`, error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch cryptocurrency details');
  }
};

export const getCryptoHistory = async (coingeckoId, period) => {
  try {
    // This endpoint GET /api/cryptos/:cmid/history/:period requires authentication
    const response = await api.get(`/cryptos/${coingeckoId}/history/${period}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching crypto history for ${coingeckoId} (${period}):`, error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch cryptocurrency history');
  }
};