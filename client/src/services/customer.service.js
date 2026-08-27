import api from './api';

export const customerService = {
  // Landing & Marketplace Public
  getLandingData: async () => {
    return await api.get('/marketplace/landing');
  },
  getCompanies: async (params) => {
    return await api.get('/companies', { params });
  },
  getCompanyById: async (id) => {
    return await api.get(`/companies/${id}`);
  },
  getCompanyServices: async (companyId) => {
    return await api.get(`/companies/${companyId}/services`);
  },
  getServiceById: async (id) => {
    return await api.get(`/services/${id}`);
  },
  searchMarketplace: async (q, category) => {
    return await api.get('/marketplace/search', { params: { q, category } });
  },

  // Customer Authorized Interactions
  getFavorites: async () => {
    return await api.get('/favorites');
  },
  addFavorite: async (data) => {
    return await api.post('/favorites', data);
  },
  removeFavorite: async (id) => {
    return await api.delete(`/favorites/${id}`);
  },

  getFollowing: async () => {
    return await api.get('/following');
  },
  followCompany: async (companyId) => {
    return await api.post('/follow-company', { companyId });
  },
  unfollowCompany: async (companyId) => {
    return await api.delete('/follow-company', { data: { companyId } });
  },

  getRecentlyViewed: async () => {
    return await api.get('/recently-viewed');
  }
};
