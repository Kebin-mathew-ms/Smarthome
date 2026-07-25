const employeePortalRepository = require('../repositories/employeePortal.repository');
const bookingRepository = require('../repositories/booking.repository');
const { comparePassword: bcryptCompare, hashPassword } = require('../utils/password.util');
const bcryptUtil = { comparePassword: bcryptCompare, hashPassword };
const jwtUtil = require('../utils/jwt.util');
const auditLogService = require('./auditLog.service');

class EmployeePortalService {
  async login(ipAddress, { email, password }) {
    const emp = await employeePortalRepository.findEmployeeByEmailOrPhone(email);
    if (!emp) {
      const error = new Error('Invalid technician credentials or inactive employee record.');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await bcryptUtil.comparePassword(password, emp.password_hash);
    if (!isMatch) {
      const error = new Error('Invalid technician credentials.');
      error.statusCode = 401;
      throw error;
    }

    const token = jwtUtil.generateToken({
      id: emp.user_id,
      email: emp.email,
      role: 'Employee',
      employeeId: emp.id,
      companyId: emp.company_id
    });

    await auditLogService.log({
      user_id: emp.user_id,
      action: 'Employee Login',
      ip_address: ipAddress
    });

    return {
      token,
      employee: {
        id: emp.id,
        user_id: emp.user_id,
        employee_name: emp.employee_name,
        designation: emp.designation,
        email: emp.email,
        phone: emp.phone,
        company_name: emp.company_name,
        role: 'Employee'
      }
    };
  }

  async getDashboard(user) {
    const emp = await employeePortalRepository.findEmployeeByUserId(user.id);
    if (!emp) {
      const error = new Error('Employee record not found.');
      error.statusCode = 404;
      throw error;
    }

    const assignedBookings = await employeePortalRepository.findAssignedBookings(emp.id, {});
    const today = new Date().toISOString().split('T')[0];

    const todayJobs = assignedBookings.filter(b => b.scheduled_date === today);
    const completedJobs = assignedBookings.filter(b => b.booking_status === 'Completed');
    const activeJobs = assignedBookings.filter(b => ['Confirmed', 'Scheduled', 'Work Started', 'On The Way'].includes(b.booking_status));

    return {
      employee: emp,
      metrics: {
        totalAssigned: assignedBookings.length,
        todayJobsCount: todayJobs.length,
        completedCount: completedJobs.length,
        activeCount: activeJobs.length
      },
      todayJobs,
      activeJobs
    };
  }

  async getAssignedBookings(user, query) {
    const emp = await employeePortalRepository.findEmployeeByUserId(user.id);
    if (!emp) {
      const error = new Error('Employee record not found.');
      error.statusCode = 404;
      throw error;
    }

    return await employeePortalRepository.findAssignedBookings(emp.id, query);
  }

  async getAssignedBookingById(user, bookingId) {
    const emp = await employeePortalRepository.findEmployeeByUserId(user.id);
    if (!emp) {
      const error = new Error('Employee record not found.');
      error.statusCode = 404;
      throw error;
    }

    const b = await employeePortalRepository.findAssignedBookingById(emp.id, bookingId);
    if (!b) {
      const error = new Error('Booking not found or not assigned to you.');
      error.statusCode = 403;
      throw error;
    }
    return b;
  }

  async checkIn(user, ipAddress, data) {
    const emp = await employeePortalRepository.findEmployeeByUserId(user.id);
    if (!emp) {
      const error = new Error('Employee record not found.');
      error.statusCode = 404;
      throw error;
    }

    const checkinId = await employeePortalRepository.checkIn({
      booking_id: data.booking_id,
      employee_id: emp.id,
      latitude: data.latitude,
      longitude: data.longitude,
      address: data.address,
      notes: data.notes
    });

    await auditLogService.log({
      user_id: user.id,
      action: 'Employee GPS Check-In',
      table_name: 'employee_checkins',
      record_id: checkinId,
      ip_address: ipAddress
    });

    return checkinId;
  }

  async checkOut(user, ipAddress, data) {
    const emp = await employeePortalRepository.findEmployeeByUserId(user.id);
    if (!emp) {
      const error = new Error('Employee record not found.');
      error.statusCode = 404;
      throw error;
    }

    await employeePortalRepository.checkOut(data.checkin_id, { notes: data.notes });

    await auditLogService.log({
      user_id: user.id,
      action: 'Employee Check-Out',
      table_name: 'employee_checkins',
      record_id: data.checkin_id,
      ip_address: ipAddress
    });
  }

  async updateBookingStatus(user, ipAddress, bookingId, status) {
    const emp = await employeePortalRepository.findEmployeeByUserId(user.id);
    if (!emp) {
      const error = new Error('Employee record not found.');
      error.statusCode = 404;
      throw error;
    }

    const b = await employeePortalRepository.findAssignedBookingById(emp.id, bookingId);
    if (!b) {
      const error = new Error('Booking not assigned to you.');
      error.statusCode = 403;
      throw error;
    }

    await bookingRepository.updateBookingStatus(bookingId, status);

    await auditLogService.log({
      user_id: user.id,
      action: `Technician Updated Booking Status to ${status}`,
      table_name: 'bookings',
      record_id: bookingId,
      ip_address: ipAddress
    });
  }

  async saveCustomerSignature(user, ipAddress, data) {
    const emp = await employeePortalRepository.findEmployeeByUserId(user.id);
    if (!emp) {
      const error = new Error('Employee record not found.');
      error.statusCode = 404;
      throw error;
    }

    await employeePortalRepository.saveSignature({
      booking_id: data.booking_id,
      employee_id: emp.id,
      customer_signature: data.customer_signature
    });

    await auditLogService.log({
      user_id: user.id,
      action: 'Customer Digital Signature Captured',
      table_name: 'employee_signatures',
      record_id: data.booking_id,
      ip_address: ipAddress
    });
  }

  async createWorkLog(user, ipAddress, data) {
    const emp = await employeePortalRepository.findEmployeeByUserId(user.id);
    if (!emp) {
      const error = new Error('Employee record not found.');
      error.statusCode = 404;
      throw error;
    }

    const logId = await employeePortalRepository.createWorkLog({
      employee_id: emp.id,
      booking_id: data.booking_id,
      work_summary: data.work_summary
    });

    await auditLogService.log({
      user_id: user.id,
      action: 'Employee Work Log Posted',
      table_name: 'employee_daily_logs',
      record_id: logId,
      ip_address: ipAddress
    });

    return logId;
  }

  async getAttendance(user) {
    const emp = await employeePortalRepository.findEmployeeByUserId(user.id);
    if (!emp) {
      const error = new Error('Employee record not found.');
      error.statusCode = 404;
      throw error;
    }

    return await employeePortalRepository.findAttendance(emp.id);
  }
}

module.exports = new EmployeePortalService();
