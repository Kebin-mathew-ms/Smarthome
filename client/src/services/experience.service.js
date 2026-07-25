import api from './api';

export const experienceService = {
  // Reviews API
  getReviews: async (params) => {
    return await api.get('/reviews', { params });
  },
  getUserReviews: async () => {
    return await api.get('/reviews/my');
  },
  createReview: async (formData) => {
    return await api.post('/reviews', formData);
  },
  replyToReview: async (id, reply) => {
    return await api.post(`/reviews/${id}/reply`, { reply });
  },

  // Complaints & Support Tickets API
  getComplaints: async () => {
    return await api.get('/complaints');
  },
  getComplaintById: async (id) => {
    return await api.get(`/complaints/${id}`);
  },
  createComplaint: async (formData) => {
    return await api.post('/complaints', formData);
  },
  addComplaintMessage: async (id, formData) => {
    return await api.post(`/complaints/${id}/message`, formData);
  },
  updateComplaintStatus: async (id, status) => {
    return await api.patch(`/complaints/${id}/status`, { status });
  },

  // Warranty API
  getWarranties: async () => {
    return await api.get('/warranties');
  },
  getWarrantyByBookingId: async (bookingId) => {
    return await api.get(`/warranties/booking/${bookingId}`);
  },
  issueWarranty: async (data) => {
    return await api.post('/warranties', data);
  },

  // Coupons & Loyalty API
  getCoupons: async () => {
    return await api.get('/coupons');
  },
  getUserRewardPoints: async () => {
    return await api.get('/coupons/rewards');
  },
  applyCoupon: async (coupon_code, order_amount) => {
    return await api.post('/coupon/apply', { coupon_code, order_amount });
  },
  createCoupon: async (data) => {
    return await api.post('/admin/coupons', data);
  },

  // Notification Feed API
  getNotifications: async () => {
    return await api.get('/notifications');
  },
  markNotificationRead: async (id) => {
    return await api.patch('/notifications/read', { id });
  },
  markAllNotificationsRead: async () => {
    return await api.patch('/notifications/read-all');
  },
  deleteNotification: async (id) => {
    return await api.delete(`/notifications/${id}`);
  }
};
