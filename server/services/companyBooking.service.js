const bookingRepository = require('../repositories/booking.repository');
const employeeRepository = require('../repositories/employee.repository');
const notificationRepository = require('../repositories/notification.repository');
const auditLogService = require('./auditLog.service');
const Booking = require('../models/booking.model');

class CompanyBookingService {
  async getCompanyBookings(companyId, query) {
    const result = await bookingRepository.findCompanyBookings(companyId, query);
    return {
      ...result,
      items: result.items.map(b => new Booking(b))
    };
  }

  async updateBookingStatus(companyId, userId, ipAddress, { bookingId, status, remarks }) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking || booking.company_id !== companyId) {
      const error = new Error('Booking not found or unauthorized access.');
      error.statusCode = 404;
      throw error;
    }

    const updated = await bookingRepository.updateStatus(bookingId, status, remarks, 'Company Provider');

    // Queue Notification
    await notificationRepository.queueNotification({
      user_id: booking.user_id,
      company_id: companyId,
      booking_id: bookingId,
      notification_type: `BOOKING_${status.toUpperCase().replace(/\s+/g, '_')}`,
      title: `Booking Status Update`,
      message: `Your booking ${booking.booking_number} has been updated to: ${status}.`
    });

    // Write Audit Log
    const actionName = status === 'Confirmed' ? 'Booking Accepted' : status === 'Rejected' ? 'Booking Rejected' : `Booking Status Changed (${status})`;
    await auditLogService.log({
      user_id: userId,
      action: actionName,
      table_name: 'bookings',
      record_id: bookingId,
      ip_address: ipAddress
    });

    return new Booking(updated);
  }

  async assignEmployees(companyId, userId, ipAddress, { bookingId, employeeIds }) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking || booking.company_id !== companyId) {
      const error = new Error('Booking not found or unauthorized access.');
      error.statusCode = 404;
      throw error;
    }

    // Verify all employeeIds belong to this company
    for (const empId of employeeIds) {
      const emp = await employeeRepository.findById(empId, companyId);
      if (!emp) {
        const error = new Error(`Employee ID ${empId} does not belong to your company.`);
        error.statusCode = 400;
        throw error;
      }
    }

    const updated = await bookingRepository.assignEmployees(bookingId, employeeIds);

    await notificationRepository.queueNotification({
      user_id: booking.user_id,
      company_id: companyId,
      booking_id: bookingId,
      notification_type: 'EMPLOYEE_ASSIGNED',
      title: 'Technician Assigned',
      message: `Technician(s) have been assigned to your booking ${booking.booking_number}.`
    });

    await auditLogService.log({
      user_id: userId,
      action: 'Employee Assigned',
      table_name: 'booking_employees',
      record_id: bookingId,
      ip_address: ipAddress
    });

    return new Booking(updated);
  }
}

module.exports = new CompanyBookingService();
