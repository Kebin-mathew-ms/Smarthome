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
  },

  // Service Customization Management
  getServiceCustomizations: async (serviceId, packageId = null) => {
    const params = packageId ? { package_id: packageId } : {};
    return await api.get(`/services/${serviceId}/customizations`, { params });
  },
  createCustomizationGroup: async (serviceId, groupData) => {
    return await api.post(`/admin/services/${serviceId}/customizations/groups`, groupData);
  },
  updateCustomizationGroup: async (groupId, groupData) => {
    return await api.put(`/admin/services/customizations/groups/${groupId}`, groupData);
  },
  deleteCustomizationGroup: async (groupId) => {
    return await api.delete(`/admin/services/customizations/groups/${groupId}`);
  },
  createCustomizationOption: async (optionData) => {
    return await api.post(`/admin/services/customizations/options`, optionData);
  },
  updateCustomizationOption: async (optionId, optionData) => {
    return await api.put(`/admin/services/customizations/options/${optionId}`, optionData);
  },
  deleteCustomizationOption: async (optionId) => {
    return await api.delete(`/admin/services/customizations/options/${optionId}`);
  },
  getPackageOverrides: async (packageId) => {
    return await api.get(`/admin/packages/${packageId}/customizations`);
  },
  savePackageConfig: async (configData) => {
    return await api.post(`/admin/packages/customizations`, configData);
  },
  deletePackageConfig: async (packageId, optionId) => {
    return await api.delete(`/admin/packages/${packageId}/customizations/${optionId}`);
  }
};
