import api from './api';
import { API_ENDPOINTS } from '../constants/api';

export const categoryService = {
  getCategories: async (params) => {
    return await api.get(API_ENDPOINTS.CATEGORIES, { params });
  },
  getCategoryById: async (id) => {
    return await api.get(`${API_ENDPOINTS.CATEGORIES}/${id}`);
  },
  createCategory: async (categoryData) => {
    return await api.post(API_ENDPOINTS.CATEGORIES, categoryData);
  },
  updateCategory: async (id, categoryData) => {
    return await api.put(`${API_ENDPOINTS.CATEGORIES}/${id}`, categoryData);
  },
  deleteCategory: async (id) => {
    return await api.delete(`${API_ENDPOINTS.CATEGORIES}/${id}`);
  }
};
