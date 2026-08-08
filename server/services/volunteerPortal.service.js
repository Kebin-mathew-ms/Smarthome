const volunteerPortalRepository = require('../repositories/volunteerPortal.repository');
const bookingRepository = require('../repositories/booking.repository');
const { comparePassword: bcryptCompare, hashPassword } = require('../utils/password.util');
const bcryptUtil = { comparePassword: bcryptCompare, hashPassword };
const jwtUtil = require('../utils/jwt.util');
const auditLogService = require('./auditLog.service');

class VolunteerPortalService {
  async login(ipAddress, { email, password }) {
    const vol = await volunteerPortalRepository.findVolunteerByEmailOrPhone(email);
    if (!vol) {
      const error = new Error('Invalid volunteer credentials or inactive record.');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await bcryptUtil.comparePassword(password, vol.password_hash);
    if (!isMatch) {
      const error = new Error('Invalid volunteer credentials.');
      error.statusCode = 401;
      throw error;
    }

    const token = jwtUtil.generateToken({
      id: vol.user_id,
      email: vol.email,
      role: 'Volunteer',
      volunteerId: vol.id
    });

    await auditLogService.log({
      user_id: vol.user_id,
      action: 'Volunteer Login',
      ip_address: ipAddress
    });

    return {
      token,
      volunteer: {
        id: vol.id,
        user_id: vol.user_id,
        volunteer_name: vol.volunteer_name,
        designation: vol.designation,
        email: vol.email,
        phone: vol.phone,
        role: 'Volunteer'
      }
    };
  }

  async getDashboard(user) {
    const vol = await volunteerPortalRepository.findVolunteerByUserId(user.id);
    if (!vol) {
      const error = new Error('Volunteer record not found.');
      error.statusCode = 404;
      throw error;
    }

    const assignedBookings = await volunteerPortalRepository.findAssignedBookings(vol.id, {});
    const today = new Date().toISOString().split('T')[0];

    const todayJobs = assignedBookings.filter(b => b.scheduled_date === today);
    const completedJobs = assignedBookings.filter(b => b.booking_status === 'Completed');
    const activeJobs = assignedBookings.filter(b => ['Confirmed', 'Scheduled', 'Work Started', 'On The Way'].includes(b.booking_status));

    return {
      volunteer: vol,
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
    const vol = await volunteerPortalRepository.findVolunteerByUserId(user.id);
    if (!vol) {
      const error = new Error('Volunteer record not found.');
      error.statusCode = 404;
      throw error;
    }

    return await volunteerPortalRepository.findAssignedBookings(vol.id, query);
  }

  async getAssignedBookingById(user, bookingId) {
    const vol = await volunteerPortalRepository.findVolunteerByUserId(user.id);
    if (!vol) {
      const error = new Error('Volunteer record not found.');
      error.statusCode = 404;
      throw error;
    }

    const b = await volunteerPortalRepository.findAssignedBookingById(vol.id, bookingId);
    if (!b) {
      const error = new Error('Booking not found or not assigned to you.');
      error.statusCode = 403;
      throw error;
    }
    return b;
  }

  async checkIn(user, ipAddress, data) {
    const vol = await volunteerPortalRepository.findVolunteerByUserId(user.id);
    if (!vol) {
      const error = new Error('Volunteer record not found.');
      error.statusCode = 404;
      throw error;
    }

    const checkinId = await volunteerPortalRepository.checkIn({
      booking_id: data.booking_id,
      volunteer_id: vol.id,
      latitude: data.latitude,
      longitude: data.longitude,
      address: data.address,
      notes: data.notes
    });

    await auditLogService.log({
      user_id: user.id,
      action: 'Volunteer GPS Check-In',
      table_name: 'volunteer_checkins',
      record_id: checkinId,
      ip_address: ipAddress
    });

    return checkinId;
  }

  async checkOut(user, ipAddress, data) {
    const vol = await volunteerPortalRepository.findVolunteerByUserId(user.id);
    if (!vol) {
      const error = new Error('Volunteer record not found.');
      error.statusCode = 404;
      throw error;
    }

    await volunteerPortalRepository.checkOut(data.checkin_id, { notes: data.notes });

    await auditLogService.log({
      user_id: user.id,
      action: 'Volunteer Check-Out',
      table_name: 'volunteer_checkins',
      record_id: data.checkin_id,
      ip_address: ipAddress
    });
  }

  async updateBookingStatus(user, ipAddress, bookingId, status) {
    const vol = await volunteerPortalRepository.findVolunteerByUserId(user.id);
    if (!vol) {
      const error = new Error('Volunteer record not found.');
      error.statusCode = 404;
      throw error;
    }

    const b = await volunteerPortalRepository.findAssignedBookingById(vol.id, bookingId);
    if (!b) {
      const error = new Error('Booking not assigned to you.');
      error.statusCode = 403;
      throw error;
    }

    // We map internally to repository status change function
    await bookingRepository.updateStatus(bookingId, status, `Status changed by volunteer`, 'Volunteer');

    await auditLogService.log({
      user_id: user.id,
      action: `Volunteer Updated Booking Status to ${status}`,
      table_name: 'bookings',
      record_id: bookingId,
      ip_address: ipAddress
    });
  }

  async saveCustomerSignature(user, ipAddress, data) {
    const vol = await volunteerPortalRepository.findVolunteerByUserId(user.id);
    if (!vol) {
      const error = new Error('Volunteer record not found.');
      error.statusCode = 404;
      throw error;
    }

    await volunteerPortalRepository.saveSignature({
      booking_id: data.booking_id,
      volunteer_id: vol.id,
      customer_signature: data.customer_signature
    });

    await auditLogService.log({
      user_id: user.id,
      action: 'Customer Digital Signature Captured',
      table_name: 'volunteer_signatures',
      record_id: data.booking_id,
      ip_address: ipAddress
    });
  }

  async createWorkLog(user, ipAddress, data) {
    const vol = await volunteerPortalRepository.findVolunteerByUserId(user.id);
    if (!vol) {
      const error = new Error('Volunteer record not found.');
      error.statusCode = 404;
      throw error;
    }

    const logId = await volunteerPortalRepository.createWorkLog({
      volunteer_id: vol.id,
      booking_id: data.booking_id,
      work_summary: data.work_summary
    });

    await auditLogService.log({
      user_id: user.id,
      action: 'Volunteer Work Log Posted',
      table_name: 'volunteer_daily_logs',
      record_id: logId,
      ip_address: ipAddress
    });

    return logId;
  }

  async getAttendance(user) {
    const vol = await volunteerPortalRepository.findVolunteerByUserId(user.id);
    if (!vol) {
      const error = new Error('Volunteer record not found.');
      error.statusCode = 404;
      throw error;
    }

    return await volunteerPortalRepository.findAttendance(vol.id);
  }
}

module.exports = new VolunteerPortalService();
