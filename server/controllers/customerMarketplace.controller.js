const customerMarketplaceService = require('../services/customerMarketplace.service');
const customerInteractionService = require('../services/customerInteraction.service');
const { sendSuccess } = require('../utils/response.util');
const HTTP_STATUS = require('../utils/httpStatus.util');

class CustomerMarketplaceController {
  async getLandingData(req, res, next) {
    try {
      const data = await customerMarketplaceService.getLandingData();
      return sendSuccess(res, 'Landing page data retrieved successfully', data, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async getCompanies(req, res, next) {
    try {
      const result = await customerMarketplaceService.getCompanies(req.query);
      return sendSuccess(res, 'Companies catalog retrieved successfully', result, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async getCompanyById(req, res, next) {
    try {
      const data = await customerMarketplaceService.getCompanyDetails(req.params.id);

      // Record recently viewed history if user is logged in
      if (req.user) {
        await customerInteractionService.recordView(req.user.id, { companyId: req.params.id });
      }

      return sendSuccess(res, 'Company details and services retrieved successfully', data, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async getCompanyServices(req, res, next) {
    try {
      const services = await customerMarketplaceService.getCompanyServices(req.params.companyId);
      return sendSuccess(res, 'Company services list retrieved successfully', services, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async getServiceById(req, res, next) {
    try {
      const service = await customerMarketplaceService.getServiceDetails(req.params.id);

      // Record recently viewed history if user is logged in
      if (req.user) {
        await customerInteractionService.recordView(req.user.id, { serviceId: req.params.id });
      }

      return sendSuccess(res, 'Service details retrieved successfully', service, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async searchMarketplace(req, res, next) {
    try {
      const results = await customerMarketplaceService.searchMarketplace(req.query.q || '', req.query.category);
      return sendSuccess(res, 'Marketplace search results retrieved', results, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CustomerMarketplaceController();
