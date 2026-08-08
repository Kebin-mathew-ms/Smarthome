const bookingRepository = require('../repositories/booking.repository');
const Booking = require('../models/booking.model');

class AdminBookingService {
  async getAllBookings(query) {
    const result = await bookingRepository.findAllBookings(query);
    return {
      ...result,
      items: result.items.map(b => new Booking(b))
    };
  }

  async exportBookingsCSV(query) {
    const result = await bookingRepository.findAllBookings({ ...query, limit: 10000 });
    const items = result.items;

    const headers = ['Booking Number', 'Customer Name', 'Service Name', 'Scheduled Date', 'Scheduled Time', 'Status', 'Payment Status', 'Total Amount', 'Created At'];
    const rows = items.map(b => [
      b.booking_number,
      `"${b.customer_name || ''}"`,
      `"${b.service_name || ''}"`,
      b.scheduled_date,
      b.scheduled_time,
      b.booking_status,
      b.payment_status,
      b.total_amount,
      b.created_at
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  async assignVolunteers(bookingId, volunteerIds) {
    const updated = await bookingRepository.assignVolunteers(bookingId, volunteerIds);
    return new Booking(updated);
  }

  async updateBookingStatus(bookingId, status, remarks = null) {
    const updated = await bookingRepository.updateStatus(bookingId, status, remarks, 'Admin');
    return new Booking(updated);
  }
}

module.exports = new AdminBookingService();
