// src/services/articleService.js
import api from './api'; // Your configured axios instance

export const getArticlesList = async (page = 1, limit = 10) => {
  try {
    // The backend's GET /api/articles uses optionalProtect,
    // token sent automatically by api.js interceptor if present.
    const response = await api.get(`/articles?page=${page}&limit=${limit}`);
    return response.data; // Expects { articles, currentPage, totalPages, totalResults }
  } catch (error) {
    console.error('Error fetching articles list:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch articles');
  }
};

// We might not need getArticleById if we're just linking out.
// If needed later:
/*
export const getArticleById = async (articleId) => {
  try {
    const response = await api.get(`/articles/${articleId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching article by ID ${articleId}:`, error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch article details');
  }
};
*/