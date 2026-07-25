const favoriteRepository = require('../repositories/favorite.repository');
const followerRepository = require('../repositories/follower.repository');
const recentlyViewedRepository = require('../repositories/recentlyViewed.repository');

class CustomerInteractionService {
  // Favorites
  async getFavorites(userId) {
    return await favoriteRepository.findUserFavorites(userId);
  }

  async addFavorite(userId, { companyId, serviceId }) {
    if (!companyId && !serviceId) {
      const error = new Error('Either companyId or serviceId must be specified to add favorite.');
      error.statusCode = 400;
      throw error;
    }
    return await favoriteRepository.addFavorite(userId, companyId, serviceId);
  }

  async removeFavorite(favoriteId, userId) {
    return await favoriteRepository.removeFavorite(favoriteId, userId);
  }

  // Following
  async getFollowing(userId) {
    return await followerRepository.findUserFollowing(userId);
  }

  async followCompany(userId, companyId) {
    if (!companyId) {
      const error = new Error('Company ID is required.');
      error.statusCode = 400;
      throw error;
    }
    return await followerRepository.followCompany(userId, companyId);
  }

  async unfollowCompany(userId, companyId) {
    return await followerRepository.unfollowCompany(userId, companyId);
  }

  // Recently Viewed
  async getRecentlyViewed(userId) {
    return await recentlyViewedRepository.findUserHistory(userId);
  }

  async recordView(userId, { companyId, serviceId }) {
    return await recentlyViewedRepository.recordView(userId, companyId, serviceId);
  }
}

module.exports = new CustomerInteractionService();
