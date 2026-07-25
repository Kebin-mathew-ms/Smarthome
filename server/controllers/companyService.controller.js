const companyServiceService = require('../services/companyService.service');
const { sendSuccess } = require('../utils/response.util');
const HTTP_STATUS = require('../utils/httpStatus.util');

class CompanyServiceController {
  async getServices(req, res, next) {
    try {
      const result = await companyServiceService.getServices(req.companyId, req.query);
      return sendSuccess(res, 'Company services retrieved successfully', result, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async getServiceById(req, res, next) {
    try {
      const service = await companyServiceService.getServiceById(req.params.id, req.companyId);
      return sendSuccess(res, 'Service details retrieved successfully', service, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async createService(req, res, next) {
    try {
      const service = await companyServiceService.createService(
        req.companyId,
        req.user.id,
        req.ip,
        req.body,
        req.files || {}
      );
      return sendSuccess(res, 'Service created successfully', service, HTTP_STATUS.CREATED);
    } catch (error) {
      next(error);
    }
  }

  async updateService(req, res, next) {
    try {
      const updated = await companyServiceService.updateService(
        req.params.id,
        req.companyId,
        req.user.id,
        req.ip,
        req.body,
        req.files || {}
      );
      return sendSuccess(res, 'Service updated successfully', updated, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async updateServiceStatus(req, res, next) {
    try {
      const { serviceId, status } = req.body;
      const updated = await companyServiceService.updateServiceStatus(serviceId, req.companyId, status);
      return sendSuccess(res, `Service status updated to ${status}`, updated, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async deleteService(req, res, next) {
    try {
      await companyServiceService.deleteService(req.params.id, req.companyId, req.user.id, req.ip);
      return sendSuccess(res, 'Service deleted successfully', {}, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async duplicateService(req, res, next) {
    try {
      const duplicated = await companyServiceService.duplicateService(req.params.id, req.companyId, req.user.id, req.ip);
      return sendSuccess(res, 'Service duplicated successfully', duplicated, HTTP_STATUS.CREATED);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CompanyServiceController();
