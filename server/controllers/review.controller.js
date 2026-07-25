const reviewService = require('../services/review.service');
const { sendSuccess } = require('../utils/response.util');
const HTTP_STATUS = require('../utils/httpStatus.util');

class ReviewController {
  async createReview(req, res, next) {
    try {
      const reviewId = await reviewService.createReview(req.user, req.ip, req.body, req.files || []);
      return sendSuccess(res, 'Review submitted successfully', { reviewId }, HTTP_STATUS.CREATED);
    } catch (error) {
      next(error);
    }
  }

  async addReply(req, res, next) {
    try {
      await reviewService.addReply(req.user, req.ip, req.params.id, req.body.reply);
      return sendSuccess(res, 'Company reply submitted successfully', null, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async getCompanyReviews(req, res, next) {
    try {
      const reviews = await reviewService.getCompanyReviews(req.params.companyId || req.query.company_id, req.query);
      return sendSuccess(res, 'Company reviews retrieved', reviews, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async getUserReviews(req, res, next) {
    try {
      const reviews = await reviewService.getUserReviews(req.user.id);
      return sendSuccess(res, 'User reviews retrieved', reviews, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReviewController();
