const workUpdateService = require('../services/workUpdate.service');
const { sendSuccess } = require('../utils/response.util');
const HTTP_STATUS = require('../utils/httpStatus.util');

class WorkUpdateController {
  async getWorkUpdates(req, res, next) {
    try {
      const updates = await workUpdateService.getWorkUpdates(req.params.bookingId);
      return sendSuccess(res, 'Work updates retrieved successfully', updates, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async createWorkUpdate(req, res, next) {
    try {
      const update = await workUpdateService.createWorkUpdate(
        req.body.bookingId,
        req.user,
        req.ip,
        req.body,
        req.files || []
      );
      return sendSuccess(res, 'Work progress update posted', update, HTTP_STATUS.CREATED);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new WorkUpdateController();
