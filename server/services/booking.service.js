const bookingRepository = require('../repositories/booking.repository');
const serviceRepository = require('../repositories/service.repository');
const servicePackageRepository = require('../repositories/servicePackage.repository');
const addressRepository = require('../repositories/address.repository');
const invoiceRepository = require('../repositories/invoice.repository');
const notificationRepository = require('../repositories/notification.repository');
const paymentRepository = require('../repositories/payment.repository');
const auditLogService = require('./auditLog.service');

const { generateBookingNumber, generateInvoiceNumber } = require('../utils/invoice.util');
const { buildEmailTemplate } = require('../utils/emailTemplates.util');
const Booking = require('../models/booking.model');

class BookingService {
  async createBooking(userId, ipAddress, data) {
    const { service_id, package_id, address_id, scheduled_date, scheduled_time, payment_method, special_instructions } = data;

    // Validate Scheduled Date is not in past
    const selectedDate = new Date(scheduled_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      const error = new Error('Scheduled date cannot be in the past.');
      error.statusCode = 400;
      throw error;
    }

    // Validate Address belongs to user
    const address = await addressRepository.findById(address_id, userId);
    if (!address) {
      const error = new Error('Invalid address selection.');
      error.statusCode = 400;
      throw error;
    }

    // Validate Service
    const service = await serviceRepository.findById(service_id);
    if (!service || service.status !== 'active') {
      const error = new Error('Service is inactive or unavailable.');
      error.statusCode = 400;
      throw error;
    }

    // Determine Price
    let price = Number(service.starting_price);
    let pkgName = null;

    if (package_id) {
      const pkg = await servicePackageRepository.findById(package_id);
      if (pkg && pkg.service_id === Number(service_id)) {
        price = Number(pkg.price);
        pkgName = pkg.package_name;
      }
    }

    const subtotal = price;
    const tax_amount = Number((subtotal * 0.10).toFixed(2)); // 10% tax
    const discount_amount = 0.00;
    const total_amount = subtotal + tax_amount - discount_amount;

    const booking_number = generateBookingNumber();

    const bookingId = await bookingRepository.createBooking({
      booking_number,
      user_id: userId,
      service_id,
      package_id: package_id || null,
      address_id,
      scheduled_date,
      scheduled_time,
      booking_status: 'Pending',
      payment_status: 'Pending',
      payment_method: payment_method || 'Cash',
      special_instructions,
      subtotal,
      tax_amount,
      discount_amount,
      total_amount
    });

    // Create Initial Payment Record
    const paymentRef = `PAY-${booking_number}`;
    await paymentRepository.createPayment({
      booking_id: bookingId,
      payment_reference: paymentRef,
      payment_gateway: payment_method === 'Razorpay' ? 'Razorpay' : 'Offline',
      payment_status: 'Pending',
      amount: total_amount,
      currency: 'USD'
    });

    // Generate Invoice Architecture Entry
    const invoiceNum = generateInvoiceNumber();
    const invoiceDate = new Date().toISOString().slice(0, 10);
    await invoiceRepository.createInvoice({
      booking_id: bookingId,
      invoice_number: invoiceNum,
      invoice_date: invoiceDate
    });

    // Notification Queue
    await notificationRepository.queueNotification({
      user_id: userId,
      company_id: null,
      booking_id: bookingId,
      notification_type: 'BOOKING_CREATED',
      title: `Booking Request ${booking_number}`,
      message: `Your booking request for ${service.service_name} on ${scheduled_date} at ${scheduled_time} has been placed.`
    });

    // Audit Log
    await auditLogService.log({
      user_id: userId,
      action: 'Booking Created',
      table_name: 'bookings',
      record_id: bookingId,
      ip_address: ipAddress
    });

    return await bookingRepository.findById(bookingId);
  }

  async getUserBookings(userId, query) {
    const result = await bookingRepository.findUserBookings(userId, query);
    return {
      ...result,
      items: result.items.map(b => new Booking(b))
    };
  }

  async getBookingById(bookingId, currentUser = null) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) {
      const error = new Error('Booking not found.');
      error.statusCode = 404;
      throw error;
    }

    if (currentUser) {
      const userId = typeof currentUser === 'object' ? currentUser.id : currentUser;
      const userRole = typeof currentUser === 'object' ? currentUser.role : null;
      const userEmail = typeof currentUser === 'object' ? currentUser.email : null;

      // 1. Admin has unrestricted access to all bookings
      if (userRole === 'Admin') {
        return new Booking(booking);
      }

      // 2. Customer who placed the booking
      if (booking.user_id === userId) {
        return new Booking(booking);
      }

      // 3. Volunteer Assigned to Booking
      if (userRole === 'Volunteer' || userRole === 'Employee') {
        const { query } = require('../config/db');
        let targetEmail = userEmail;
        if (!targetEmail && userId) {
          const userRows = await query('SELECT email FROM users WHERE id = ?', [userId]);
          if (userRows.length > 0) targetEmail = userRows[0].email;
        }

        if (targetEmail) {
          const volRows = await query('SELECT id FROM volunteers WHERE email = ?', [targetEmail]);
          if (volRows.length > 0) {
            const volunteerId = volRows[0].id;
            const assignmentRows = await query('SELECT id FROM booking_volunteers WHERE booking_id = ? AND volunteer_id = ?', [bookingId, volunteerId]);
            if (assignmentRows.length > 0) {
              return new Booking(booking);
            }
          }
        }
      }

      // If no permission criteria met, throw 403
      const error = new Error('Access forbidden to this booking.');
      error.statusCode = 403;
      throw error;
    }

    return new Booking(booking);
  }

  async cancelBooking(bookingId, userId, ipAddress, reason) {
    const booking = await this.getBookingById(bookingId, userId);
    if (['Completed', 'Cancelled', 'Rejected'].includes(booking.booking_status)) {
      const error = new Error(`Cannot cancel a booking in '${booking.booking_status}' status.`);
      error.statusCode = 400;
      throw error;
    }

    const updated = await bookingRepository.cancelBooking(bookingId, userId, reason || 'Cancelled by customer');

    await auditLogService.log({
      user_id: userId,
      action: 'Booking Cancelled',
      table_name: 'bookings',
      record_id: bookingId,
      ip_address: ipAddress
    });

    return new Booking(updated);
  }

  async rescheduleBooking(bookingId, userId, ipAddress, { scheduled_date, scheduled_time }) {
    const booking = await this.getBookingById(bookingId, userId);
    if (['Completed', 'Cancelled', 'Rejected'].includes(booking.booking_status)) {
      const error = new Error(`Cannot reschedule a booking in '${booking.booking_status}' status.`);
      error.statusCode = 400;
      throw error;
    }

    const updated = await bookingRepository.rescheduleBooking(bookingId, userId, scheduled_date, scheduled_time);

    await auditLogService.log({
      user_id: userId,
      action: 'Booking Rescheduled',
      table_name: 'bookings',
      record_id: bookingId,
      ip_address: ipAddress
    });

    return new Booking(updated);
  }
}

module.exports = new BookingService();
