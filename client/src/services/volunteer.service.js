import api from './api';

export const volunteerService = {
  // Volunteer Auth API
  login: async (email, password) => {
    return await api.post('/volunteer/login', { email, password });
  },

  // Dashboard & Bookings
  getDashboard: async () => {
    return await api.get('/volunteer/dashboard');
  },
  getAssignedBookings: async (params) => {
    return await api.get('/volunteer/bookings', { params });
  },
  getAssignedBookingById: async (id) => {
    return await api.get(`/volunteer/bookings/${id}`);
  },
  updateBookingStatus: async (bookingId, status) => {
    return await api.patch('/volunteer/bookings/status', { bookingId, status });
  },

  // GPS Check-In & Check-Out
  checkIn: async (data) => {
    return await api.post('/volunteer/check-in', data);
  },
  checkOut: async (data) => {
    return await api.post('/volunteer/check-out', data);
  },
  getAttendance: async () => {
    return await api.get('/volunteer/attendance');
  },

  // Customer Signature & Work Logs
  saveCustomerSignature: async (booking_id, customer_signature) => {
    return await api.post('/volunteer/signature', { booking_id, customer_signature });
  },
  createWorkLog: async (booking_id, work_summary) => {
    return await api.post('/volunteer/worklogs', { booking_id, work_summary });
  }
};
