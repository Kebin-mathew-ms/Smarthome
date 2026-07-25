import api from './api';
import { API_ENDPOINTS } from '../constants/api';

export const companyService = {
  getCompanies: async (params) => {
    return await api.get(API_ENDPOINTS.COMPANIES, { params });
  },
  getCompanyById: async (id) => {
    return await api.get(`${API_ENDPOINTS.COMPANIES}/${id}`);
  },
  createCompany: async (companyData) => {
    return await api.post(API_ENDPOINTS.COMPANIES, companyData);
  },
  updateCompany: async (id, companyData) => {
    return await api.put(`${API_ENDPOINTS.COMPANIES}/${id}`, companyData);
  },
  deleteCompany: async (id) => {
    return await api.delete(`${API_ENDPOINTS.COMPANIES}/${id}`);
  }
};
