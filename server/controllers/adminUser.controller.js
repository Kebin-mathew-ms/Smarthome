const userService = require('../services/user.service');
const auditLogService = require('../services/auditLog.service');
const { sendSuccess } = require('../utils/response.util');
const HTTP_STATUS = require('../utils/httpStatus.util');

class AdminUserController {
  async getUsers(req, res, next) {
    try {
      const result = await userService.getAllUsers(req.query);
      return sendSuccess(res, 'Users list retrieved successfully', result, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req, res, next) {
    try {
      const user = await userService.getUserById(req.params.id);
      return sendSuccess(res, 'User details retrieved successfully', user, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async updateUserStatus(req, res, next) {
    try {
      const { userId, status } = req.body;
      const updatedUser = await userService.updateUserStatus(userId, status);

      let actionName = `User Status Changed to ${status}`;
      if (status === 'suspended' || status === 'inactive') {
        actionName = 'User Blocked';
      } else if (status === 'active') {
        actionName = 'User Activated';
      }

      await auditLogService.log({
        user_id: req.user.id,
        action: actionName,
        table_name: 'users',
        record_id: userId,
        ip_address: req.ip
      });

      return sendSuccess(res, `User status updated to ${status}`, updatedUser, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminUserController();
