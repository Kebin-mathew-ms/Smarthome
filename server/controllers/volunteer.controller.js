const volunteerService = require('../services/volunteer.service');
const { sendSuccess } = require('../utils/response.util');
const HTTP_STATUS = require('../utils/httpStatus.util');

class VolunteerController {
  async getVolunteers(req, res, next) {
    try {
      const result = await volunteerService.getVolunteers(req.query);
      return sendSuccess(res, 'Volunteers retrieved successfully', result, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async getVolunteerById(req, res, next) {
    try {
      const vol = await volunteerService.getVolunteerById(req.params.id);
      return sendSuccess(res, 'Volunteer details retrieved successfully', vol, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async createVolunteer(req, res, next) {
    try {
      const photoFile = req.file ? req.file : null;
      const vol = await volunteerService.createVolunteer(
        req.user.id,
        req.ip,
        req.body,
        photoFile
      );
      return sendSuccess(res, 'Volunteer added successfully', vol, HTTP_STATUS.CREATED);
    } catch (error) {
      next(error);
    }
  }

  async updateVolunteer(req, res, next) {
    try {
      const photoFile = req.file ? req.file : null;
      const updated = await volunteerService.updateVolunteer(
        req.params.id,
        req.user.id,
        req.ip,
        req.body,
        photoFile
      );
      return sendSuccess(res, 'Volunteer updated successfully', updated, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async updateVolunteerStatus(req, res, next) {
    try {
      const { volunteerId, status } = req.body;
      const updated = await volunteerService.updateVolunteerStatus(volunteerId, status);
      return sendSuccess(res, `Volunteer status updated to ${status}`, updated, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async deleteVolunteer(req, res, next) {
    try {
      await volunteerService.deleteVolunteer(req.params.id, req.user.id, req.ip);
      return sendSuccess(res, 'Volunteer deleted successfully', {}, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new VolunteerController();
