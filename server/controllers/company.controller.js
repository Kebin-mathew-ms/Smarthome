const companyService = require('../services/company.service');
const { sendSuccess } = require('../utils/response.util');
const HTTP_STATUS = require('../utils/httpStatus.util');

class CompanyController {
  async getCompanies(req, res, next) {
    try {
      const result = await companyService.getCompanies(req.query);
      return sendSuccess(res, 'Companies retrieved successfully', result, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async getCompanyById(req, res, next) {
    try {
      const company = await companyService.getCompanyById(req.params.id);
      return sendSuccess(res, 'Company retrieved successfully', company, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async createCompany(req, res, next) {
    try {
      const logoPath = req.file ? req.file.path : null;
      const company = await companyService.createCompany(
        { ...req.body, logo: logoPath },
        req.user ? req.user.id : null
      );
      return sendSuccess(res, 'Company created successfully', company, HTTP_STATUS.CREATED);
    } catch (error) {
      next(error);
    }
  }

  async updateCompany(req, res, next) {
    try {
      const logoPath = req.file ? req.file.path : undefined;
      const companyData = { ...req.body };
      if (logoPath !== undefined) {
        companyData.logo = logoPath;
      }
      const updatedCompany = await companyService.updateCompany(req.params.id, companyData);
      return sendSuccess(res, 'Company updated successfully', updatedCompany, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async deleteCompany(req, res, next) {
    try {
      await companyService.deleteCompany(req.params.id);
      return sendSuccess(res, 'Company deleted successfully', {}, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CompanyController();
