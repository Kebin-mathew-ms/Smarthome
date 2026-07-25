import api from './api';

export const adminService = {
  // Dashboard Stats
  getDashboardStats: async () => {
    return await api.get('/admin/dashboard');
  },

  // Companies Management
  getCompanies: async (params) => {
    return await api.get('/admin/companies', { params });
  },
  getCompanyById: async (id) => {
    return await api.get(`/admin/companies/${id}`);
  },
  createCompany: async (companyData) => {
    return await api.post('/admin/companies', companyData);
  },
  updateCompany: async (id, companyData) => {
    return await api.put(`/admin/companies/${id}`, companyData);
  },
  updateCompanyStatus: async (companyId, status) => {
    return await api.patch('/admin/companies/status', { companyId, status });
  },
  resetCompanyPassword: async (companyId) => {
    return await api.patch('/admin/companies/reset-password', { companyId });
  },
  deleteCompany: async (id) => {
    return await api.delete(`/admin/companies/${id}`);
  },

  // Categories & Subcategories Management
  getCategories: async (params) => {
    return await api.get('/admin/categories', { params });
  },
  createCategory: async (data) => {
    return await api.post('/admin/categories', data);
  },
  updateCategory: async (id, data) => {
    return await api.put(`/admin/categories/${id}`, data);
  },
  deleteCategory: async (id) => {
    return await api.delete(`/admin/categories/${id}`);
  },

  getSubcategories: async (params) => {
    return await api.get('/admin/subcategories', { params });
  },
  getSubcategoryById: async (id) => {
    return await api.get(`/admin/subcategories/${id}`);
  },
  createSubcategory: async (data) => {
    return await api.post('/admin/subcategories', data);
  },
  updateSubcategory: async (id, data) => {
    return await api.put(`/admin/subcategories/${id}`, data);
  },
  deleteSubcategory: async (id) => {
    return await api.delete(`/admin/subcategories/${id}`);
  },

  // Users Management
  getUsers: async (params) => {
    return await api.get('/admin/users', { params });
  },
  getUserById: async (id) => {
    return await api.get(`/admin/users/${id}`);
  },
  updateUserStatus: async (userId, status) => {
    return await api.patch('/admin/users/status', { userId, status });
  },

  // Audit Logs
  getAuditLogs: async (params) => {
    return await api.get('/admin/audit-logs', { params });
  }
};
