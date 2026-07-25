import api from './api';
import { API_ENDPOINTS } from '../constants/api';

export const authService = {
  login: async (credentials) => {
    return await api.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
  },
  register: async (userData) => {
    return await api.post(API_ENDPOINTS.AUTH.REGISTER, userData);
  },
  logout: async () => {
    return await api.post(API_ENDPOINTS.AUTH.LOGOUT);
  },
  getProfile: async () => {
    return await api.get(API_ENDPOINTS.AUTH.PROFILE);
  },
  updateProfile: async (profileData) => {
    return await api.put(API_ENDPOINTS.AUTH.PROFILE, profileData);
  }
};
