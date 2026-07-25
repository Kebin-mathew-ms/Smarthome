const express = require('express');
const router = express.Router();

const { authenticate } = require('../middlewares/auth.middleware');
const customerMarketplaceController = require('../controllers/customerMarketplace.controller');
const customerInteractionController = require('../controllers/customerInteraction.controller');

// Optional auth middleware helper to attach user if token present (for public routes)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authenticate(req, res, next);
  }
  next();
};

// -------------------------------------------------------------
// Public Marketplace Browsing Endpoints
// -------------------------------------------------------------
router.get('/marketplace/landing', customerMarketplaceController.getLandingData);
router.get('/companies', customerMarketplaceController.getCompanies);
router.get('/companies/:id', optionalAuth, customerMarketplaceController.getCompanyById);
router.get('/companies/:companyId/services', customerMarketplaceController.getCompanyServices);
router.get('/services/:id', optionalAuth, customerMarketplaceController.getServiceById);
router.get('/marketplace/search', customerMarketplaceController.searchMarketplace);

// -------------------------------------------------------------
// Customer Interaction Endpoints (Require Authentication)
// -------------------------------------------------------------
router.get('/favorites', authenticate, customerInteractionController.getFavorites);
router.post('/favorites', authenticate, customerInteractionController.addFavorite);
router.delete('/favorites/:id', authenticate, customerInteractionController.removeFavorite);

router.get('/following', authenticate, customerInteractionController.getFollowing);
router.post('/follow-company', authenticate, customerInteractionController.followCompany);
router.delete('/follow-company', authenticate, customerInteractionController.unfollowCompany);

router.get('/recently-viewed', authenticate, customerInteractionController.getRecentlyViewed);

module.exports = router;
