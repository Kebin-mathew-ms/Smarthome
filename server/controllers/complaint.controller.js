const complaintService = require('../services/complaint.service');
const { sendSuccess } = require('../utils/response.util');
const HTTP_STATUS = require('../utils/httpStatus.util');

class ComplaintController {
  async createComplaint(req, res, next) {
    try {
      const ticket = await complaintService.createComplaint(req.user, req.ip, req.body, req.files || []);
      return sendSuccess(res, 'Complaint support ticket created', ticket, HTTP_STATUS.CREATED);
    } catch (error) {
      next(error);
    }
  }

  async addMessage(req, res, next) {
    try {
      const ticket = await complaintService.addMessage(req.user, req.ip, req.params.id, req.body.message, req.files || []);
      return sendSuccess(res, 'Message added to complaint ticket', ticket, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const ticket = await complaintService.updateStatus(req.user, req.ip, req.params.id, req.body.status);
      return sendSuccess(res, `Complaint status updated to ${req.body.status}`, ticket, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async getComplaintById(req, res, next) {
    try {
      const ticket = await complaintService.getComplaintById(req.params.id);
      return sendSuccess(res, 'Complaint ticket details retrieved', ticket, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async getComplaints(req, res, next) {
    try {
      let list = [];
      if (req.user.role === 'Admin') {
        list = await complaintService.getAllComplaints();
      } else if (req.user.role === 'Company') {
        list = await complaintService.getCompanyComplaints(req.user.companyId || req.user.id);
      } else {
        list = await complaintService.getUserComplaints(req.user.id);
      }
      return sendSuccess(res, 'Complaints retrieved', list, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ComplaintController();
