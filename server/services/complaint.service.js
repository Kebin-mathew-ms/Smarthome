const complaintRepository = require('../repositories/complaint.repository');
const bookingRepository = require('../repositories/booking.repository');
const userNotificationRepository = require('../repositories/userNotification.repository');
const auditLogService = require('./auditLog.service');
const Complaint = require('../models/complaint.model');

class ComplaintService {
  async createComplaint(user, ipAddress, data, files = []) {
    const booking = await bookingRepository.findById(data.booking_id);
    if (!booking) {
      const error = new Error('Booking not found.');
      error.statusCode = 404;
      throw error;
    }

    if (booking.user_id !== user.id) {
      const error = new Error('Access forbidden. You can only lodge complaints for your own bookings.');
      error.statusCode = 403;
      throw error;
    }

    const ticketNumber = `TKT-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const complaintId = await complaintRepository.createTicket({
      booking_id: data.booking_id,
      ticket_number: ticketNumber,
      user_id: user.id,
      company_id: booking.company_id,
      complaint_category: data.complaint_category || 'Poor Work Quality',
      priority: data.priority || 'Medium',
      subject: data.subject,
      description: data.description
    });

    if (files && files.length) {
      const fullComplaint = await complaintRepository.findById(complaintId);
      const firstMsgId = fullComplaint.messages[0].id;
      for (const file of files) {
        await complaintRepository.addAttachment(firstMsgId, file.path, file.mimetype);
      }
    }

    // Write Audit Log
    await auditLogService.log({
      user_id: user.id,
      action: 'Complaint Ticket Created',
      table_name: 'complaints',
      record_id: complaintId,
      ip_address: ipAddress
    });

    return await complaintRepository.findById(complaintId);
  }

  async addMessage(user, ipAddress, complaintId, messageText, files = []) {
    const complaint = await complaintRepository.findById(complaintId);
    if (!complaint) {
      const error = new Error('Complaint ticket not found.');
      error.statusCode = 404;
      throw error;
    }

    const msgId = await complaintRepository.addMessage(complaintId, user.id, messageText);

    if (files && files.length) {
      for (const file of files) {
        await complaintRepository.addAttachment(msgId, file.path, file.mimetype);
      }
    }

    return await complaintRepository.findById(complaintId);
  }

  async updateStatus(user, ipAddress, complaintId, status) {
    const updated = await complaintRepository.updateStatus(complaintId, status);

    await auditLogService.log({
      user_id: user.id,
      action: `Complaint Status Updated to ${status}`,
      table_name: 'complaints',
      record_id: complaintId,
      ip_address: ipAddress
    });

    return new Complaint(updated);
  }

  async getComplaintById(id) {
    const complaint = await complaintRepository.findById(id);
    if (!complaint) {
      const error = new Error('Complaint ticket not found.');
      error.statusCode = 404;
      throw error;
    }
    return new Complaint(complaint);
  }

  async getUserComplaints(userId) {
    const list = await complaintRepository.findUserComplaints(userId);
    return list.map(c => new Complaint(c));
  }

  async getCompanyComplaints(companyId) {
    const list = await complaintRepository.findCompanyComplaints(companyId);
    return list.map(c => new Complaint(c));
  }

  async getAllComplaints() {
    const list = await complaintRepository.findAllComplaints();
    return list.map(c => new Complaint(c));
  }
}

module.exports = new ComplaintService();
