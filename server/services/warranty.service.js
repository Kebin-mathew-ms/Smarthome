const warrantyRepository = require('../repositories/warranty.repository');
const bookingRepository = require('../repositories/booking.repository');
const userNotificationRepository = require('../repositories/userNotification.repository');
const auditLogService = require('./auditLog.service');
const Warranty = require('../models/warranty.model');

class WarrantyService {
  async issueWarranty(user, ipAddress, data) {
    const booking = await bookingRepository.findById(data.booking_id);
    if (!booking) {
      const error = new Error('Booking not found.');
      error.statusCode = 404;
      throw error;
    }

    const warrantyNumber = `WAR-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const id = await warrantyRepository.issueWarranty({
      booking_id: data.booking_id,
      company_id: booking.company_id,
      warranty_number: warrantyNumber,
      title: data.title,
      description: data.description || null,
      valid_from: data.valid_from,
      valid_until: data.valid_until,
      terms: data.terms || null
    });

    // Write Audit Log
    await auditLogService.log({
      user_id: user.id,
      action: 'Warranty Issued',
      table_name: 'warranties',
      record_id: id,
      ip_address: ipAddress
    });

    return await warrantyRepository.findByBookingId(data.booking_id);
  }

  async getWarrantyByBookingId(bookingId) {
    const w = await warrantyRepository.findByBookingId(bookingId);
    return w ? new Warranty(w) : null;
  }

  async getUserWarranties(userId) {
    const list = await warrantyRepository.findByUserId(userId);
    return list.map(w => new Warranty(w));
  }

  async getCompanyWarranties(companyId) {
    const list = await warrantyRepository.findByCompanyId(companyId);
    return list.map(w => new Warranty(w));
  }
}

module.exports = new WarrantyService();
