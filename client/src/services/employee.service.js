import api from './api';

export const employeeService = {
  // Employee Auth API
  login: async (email, password) => {
    return await api.post('/employee/login', { email, password });
  },

  // Dashboard & Bookings
  getDashboard: async () => {
    return await api.get('/employee/dashboard');
  },
  getAssignedBookings: async (params) => {
    return await api.get('/employee/bookings', { params });
  },
  getAssignedBookingById: async (id) => {
    return await api.get(`/employee/bookings/${id}`);
  },
  updateBookingStatus: async (bookingId, status) => {
    return await api.patch('/employee/bookings/status', { bookingId, status });
  },

  // GPS Check-In & Check-Out
  checkIn: async (data) => {
    return await api.post('/employee/check-in', data);
  },
  checkOut: async (data) => {
    return await api.post('/employee/check-out', data);
  },
  getAttendance: async () => {
    return await api.get('/employee/attendance');
  },

  // Customer Signature & Work Logs
  saveCustomerSignature: async (booking_id, customer_signature) => {
    return await api.post('/employee/signature', { booking_id, customer_signature });
  },
  createWorkLog: async (booking_id, work_summary) => {
    return await api.post('/employee/worklogs', { booking_id, work_summary });
  }
};
