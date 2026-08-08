import api from './api';

export const adminService = {
  // Dashboard Stats
  getDashboardStats: async () => {
    return await api.get('/admin/dashboard');
  },

  // Volunteers Management
  getVolunteers: async (params) => {
    return await api.get('/admin/volunteers', { params });
  },
  getVolunteerById: async (id) => {
    return await api.get(`/admin/volunteers/${id}`);
  },
  createVolunteer: async (volunteerData) => {
    return await api.post('/admin/volunteers', volunteerData);
  },
  updateVolunteer: async (id, volunteerData) => {
    return await api.put(`/admin/volunteers/${id}`, volunteerData);
  },
  updateVolunteerStatus: async (volunteerId, status) => {
    return await api.patch('/admin/volunteers/status', { volunteerId, status });
  },
  deleteVolunteer: async (id) => {
    return await api.delete(`/admin/volunteers/${id}`);
  },

  // Services Management
  getServices: async (params) => {
    return await api.get('/admin/services', { params });
  },
  getServiceById: async (id) => {
    return await api.get(`/admin/services/${id}`);
  },
  createService: async (serviceData) => {
    return await api.post('/admin/services', serviceData);
  },
  updateService: async (id, serviceData) => {
    return await api.put(`/admin/services/${id}`, serviceData);
  },
  updateServiceStatus: async (serviceId, status) => {
    return await api.patch('/admin/services/status', { serviceId, status });
  },
  deleteService: async (id) => {
    return await api.delete(`/admin/services/${id}`);
  },

  // Packages Management
  getPackages: async () => {
    return await api.get('/admin/packages');
  },
  getPackagesByServiceId: async (serviceId) => {
    return await api.get(`/admin/services/${serviceId}/packages`);
  },
  createPackage: async (packageData) => {
    return await api.post('/admin/packages', packageData);
  },
  updatePackage: async (id, packageData) => {
    return await api.put(`/admin/packages/${id}`, packageData);
  },
  deletePackage: async (id) => {
    return await api.delete(`/admin/packages/${id}`);
  },

  // Bookings Actions
  getBookings: async (params) => {
    return await api.get('/admin/bookings', { params });
  },
  assignVolunteers: async (bookingId, volunteerIds) => {
    return await api.patch('/admin/bookings/assign', { bookingId, volunteerIds });
  },
  updateBookingStatus: async (bookingId, status, remarks) => {
    return await api.patch('/admin/bookings/status', { bookingId, status, remarks });
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
