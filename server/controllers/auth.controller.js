const authService = require('../services/auth.service');
const { recordFailedLogin, recordSuccessfulLogin } = require('../middlewares/bruteForce.middleware');
const { sendSuccess } = require('../utils/response.util');
const HTTP_STATUS = require('../utils/httpStatus.util');

class AuthController {
  async register(req, res, next) {
    try {
      const user = await authService.register(req.body, req.ip);
      return sendSuccess(res, 'Registration successful', user, HTTP_STATUS.CREATED);
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      recordSuccessfulLogin(req.ip);
      return sendSuccess(res, 'Login successful', result, HTTP_STATUS.OK);
    } catch (error) {
      recordFailedLogin(req.ip);
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      // JWT is stateless; client discards the token on logout
      return sendSuccess(res, 'Logged out successfully', null, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const user = await authService.getProfile(req.user.id);
      return sendSuccess(res, 'User profile retrieved', user, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const user = await authService.updateProfile(req.user.id, req.body);
      return sendSuccess(res, 'Profile updated successfully', user, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
