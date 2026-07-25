import api from './api';

export const bookingService = {
  // Address Book API
  getAddresses: async () => {
    return await api.get('/addresses');
  },
  getAddressById: async (id) => {
    return await api.get(`/addresses/${id}`);
  },
  createAddress: async (data) => {
    return await api.post('/addresses', data);
  },
  updateAddress: async (id, data) => {
    return await api.put(`/addresses/${id}`, data);
  },
  deleteAddress: async (id) => {
    return await api.delete(`/addresses/${id}`);
  },
  setDefaultAddress: async (id) => {
    return await api.patch(`/addresses/${id}/default`);
  },

  // Customer Bookings API
  createBooking: async (data) => {
    return await api.post('/bookings', data);
  },
  getUserBookings: async (params) => {
    return await api.get('/bookings', { params });
  },
  getBookingById: async (id) => {
    return await api.get(`/bookings/${id}`);
  },
  cancelBooking: async (bookingId, reason) => {
    return await api.patch('/bookings/cancel', { bookingId, reason });
  },
  rescheduleBooking: async (bookingId, scheduled_date, scheduled_time) => {
    return await api.patch('/bookings/reschedule', { bookingId, scheduled_date, scheduled_time });
  },

  // Company Dispatch Bookings API
  getCompanyBookings: async (params) => {
    return await api.get('/company/bookings', { params });
  },
  updateCompanyBookingStatus: async (bookingId, status, remarks) => {
    return await api.patch('/company/bookings/status', { bookingId, status, remarks });
  },
  assignCompanyEmployees: async (bookingId, employeeIds) => {
    return await api.patch('/company/bookings/assign', { bookingId, employeeIds });
  },

  // Admin Bookings Overview API
  getAdminBookings: async (params) => {
    return await api.get('/admin/bookings', { params });
  },

  // Payments API
  createRazorpayOrder: async (bookingId) => {
    return await api.post('/payments/create-order', { bookingId });
  },
  verifyPayment: async (paymentData) => {
    return await api.post('/payments/verify', paymentData);
  },

  // Invoices API
  getInvoice: async (bookingId) => {
    return await api.get(`/invoice/${bookingId}`);
  }
};
