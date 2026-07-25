const userService = require('../services/user.service');
const { sendSuccess } = require('../utils/response.util');
const HTTP_STATUS = require('../utils/httpStatus.util');

class UserController {
  async getUsers(req, res, next) {
    try {
      const result = await userService.getAllUsers(req.query);
      return sendSuccess(res, 'Users retrieved successfully', result, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req, res, next) {
    try {
      const user = await userService.getUserById(req.params.id);
      return sendSuccess(res, 'User retrieved successfully', user, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req, res, next) {
    try {
      await userService.deleteUser(req.params.id);
      return sendSuccess(res, 'User deleted successfully', {}, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
