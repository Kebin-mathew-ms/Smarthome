import api from './api';

export const companyPortalService = {
  // Dashboard Stats
  getDashboardStats: async () => {
    return await api.get('/company/dashboard');
  },

  // Company Profile
  getProfile: async () => {
    return await api.get('/company/profile');
  },
  updateProfile: async (profileData) => {
    return await api.put('/company/profile', profileData);
  },

  // Service Management
  getServices: async (params) => {
    return await api.get('/company/services', { params });
  },
  getServiceById: async (id) => {
    return await api.get(`/company/services/${id}`);
  },
  createService: async (serviceData) => {
    return await api.post('/company/services', serviceData);
  },
  updateService: async (id, serviceData) => {
    return await api.put(`/company/services/${id}`, serviceData);
  },
  updateServiceStatus: async (serviceId, status) => {
    return await api.patch('/company/services/status', { serviceId, status });
  },
  duplicateService: async (id) => {
    return await api.post(`/company/services/${id}/duplicate`);
  },
  deleteService: async (id) => {
    return await api.delete(`/company/services/${id}`);
  },

  // Service Packages
  getPackages: async () => {
    return await api.get('/company/packages');
  },
  createPackage: async (data) => {
    return await api.post('/company/packages', data);
  },
  updatePackage: async (id, data) => {
    return await api.put(`/company/packages/${id}`, data);
  },
  deletePackage: async (id) => {
    return await api.delete(`/company/packages/${id}`);
  },

  // Employee Management
  getEmployees: async (params) => {
    return await api.get('/company/employees', { params });
  },
  getEmployeeById: async (id) => {
    return await api.get(`/company/employees/${id}`);
  },
  createEmployee: async (data) => {
    return await api.post('/company/employees', data);
  },
  updateEmployee: async (id, data) => {
    return await api.put(`/company/employees/${id}`, data);
  },
  updateEmployeeStatus: async (employeeId, status) => {
    return await api.patch('/company/employees/status', { employeeId, status });
  },
  deleteEmployee: async (id) => {
    return await api.delete(`/company/employees/${id}`);
  },

  // Gallery Portfolio
  getGallery: async () => {
    return await api.get('/company/gallery');
  },
  addImage: async (data) => {
    return await api.post('/company/gallery', data);
  },
  deleteImage: async (id) => {
    return await api.delete(`/company/gallery/${id}`);
  }
};
