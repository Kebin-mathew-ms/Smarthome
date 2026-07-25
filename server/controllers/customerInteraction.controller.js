const customerInteractionService = require('../services/customerInteraction.service');
const { sendSuccess } = require('../utils/response.util');
const HTTP_STATUS = require('../utils/httpStatus.util');

class CustomerInteractionController {
  // Favorites
  async getFavorites(req, res, next) {
    try {
      const favorites = await customerInteractionService.getFavorites(req.user.id);
      return sendSuccess(res, 'User favorites retrieved successfully', favorites, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async addFavorite(req, res, next) {
    try {
      const id = await customerInteractionService.addFavorite(req.user.id, req.body);
      return sendSuccess(res, 'Added to favorites', { favoriteId: id }, HTTP_STATUS.CREATED);
    } catch (error) {
      next(error);
    }
  }

  async removeFavorite(req, res, next) {
    try {
      await customerInteractionService.removeFavorite(req.params.id, req.user.id);
      return sendSuccess(res, 'Removed from favorites', {}, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  // Following
  async getFollowing(req, res, next) {
    try {
      const following = await customerInteractionService.getFollowing(req.user.id);
      return sendSuccess(res, 'Followed companies retrieved successfully', following, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async followCompany(req, res, next) {
    try {
      await customerInteractionService.followCompany(req.user.id, req.body.companyId);
      return sendSuccess(res, 'Now following company', {}, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async unfollowCompany(req, res, next) {
    try {
      await customerInteractionService.unfollowCompany(req.user.id, req.body.companyId);
      return sendSuccess(res, 'Unfollowed company', {}, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  // Recently Viewed
  async getRecentlyViewed(req, res, next) {
    try {
      const history = await customerInteractionService.getRecentlyViewed(req.user.id);
      return sendSuccess(res, 'Recently viewed history retrieved', history, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CustomerInteractionController();
