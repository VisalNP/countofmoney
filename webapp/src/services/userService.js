// src/services/userService.js
import api from './api'; // Your configured axios instance

export const getProfile = async () => {
  try {
    const response = await api.get('/users/profile');
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch user profile');
  }
};

export const updateProfile = async (profileData) => {
  try {
    // The profileData should match what the backend PUT /api/users/profile expects:
    // { nickname, email, defaultCurrency, preferredCryptos (array), pressKeywords (array) }
    const response = await api.put('/users/profile', profileData);
    return response.data; // Backend returns updated user info with a new token
  } catch (error) {
    console.error('Error updating user profile:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to update user profile');
  }
};