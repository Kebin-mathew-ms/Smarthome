import api from './api';

export const analyticsService = {
  // Analytics APIs
  getAdminAnalytics: async () => {
    return await api.get('/admin/analytics');
  },
  getCompanyAnalytics: async () => {
    return await api.get('/company/analytics');
  },
  getBookingReport: async (params) => {
    return await api.get('/reports/bookings', { params });
  },

  // System Health Telemetry API
  getSystemHealth: async () => {
    return await api.get('/system/health');
  },

  // Activity & Audit Logs API
  getActivityLogs: async (params) => {
    return await api.get('/activity-logs', { params });
  },

  // System Announcements API
  getActiveAnnouncements: async () => {
    return await api.get('/announcements/active');
  },
  getAllAnnouncements: async () => {
    return await api.get('/announcements');
  },
  createAnnouncement: async (data) => {
    return await api.post('/announcements', data);
  },
  updateAnnouncement: async (id, data) => {
    return await api.put(`/announcements/${id}`, data);
  },
  deleteAnnouncement: async (id) => {
    return await api.delete(`/announcements/${id}`);
  }
};
