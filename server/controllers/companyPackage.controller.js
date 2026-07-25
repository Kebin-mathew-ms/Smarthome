const companyServiceService = require('../services/companyService.service');
const { sendSuccess } = require('../utils/response.util');
const HTTP_STATUS = require('../utils/httpStatus.util');

class CompanyPackageController {
  async getPackages(req, res, next) {
    try {
      const packages = await companyServiceService.getPackages(req.companyId);
      return sendSuccess(res, 'Packages retrieved successfully', packages, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async createPackage(req, res, next) {
    try {
      const pkg = await companyServiceService.createPackage(req.companyId, req.user.id, req.ip, req.body);
      return sendSuccess(res, 'Package created successfully', pkg, HTTP_STATUS.CREATED);
    } catch (error) {
      next(error);
    }
  }

  async updatePackage(req, res, next) {
    try {
      const updated = await companyServiceService.updatePackage(req.params.id, req.companyId, req.user.id, req.ip, req.body);
      return sendSuccess(res, 'Package updated successfully', updated, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async deletePackage(req, res, next) {
    try {
      await companyServiceService.deletePackage(req.params.id, req.companyId, req.user.id, req.ip);
      return sendSuccess(res, 'Package deleted successfully', {}, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CompanyPackageController();
