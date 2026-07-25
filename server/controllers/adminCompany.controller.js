const companyService = require('../services/company.service');
const auditLogService = require('../services/auditLog.service');
const { sendSuccess } = require('../utils/response.util');
const HTTP_STATUS = require('../utils/httpStatus.util');

class AdminCompanyController {
  async getCompanies(req, res, next) {
    try {
      const result = await companyService.getCompanies(req.query);
      return sendSuccess(res, 'Companies list retrieved successfully', result, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async getCompanyById(req, res, next) {
    try {
      const company = await companyService.getCompanyById(req.params.id);
      return sendSuccess(res, 'Company details retrieved successfully', company, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async createCompany(req, res, next) {
    try {
      const logoPath = req.file ? req.file.path : null;
      const data = await companyService.createCompany(
        { ...req.body, logo: logoPath },
        req.user ? req.user.id : null
      );

      await auditLogService.log({
        user_id: req.user.id,
        action: 'Company Created',
        table_name: 'companies',
        record_id: data.company.id,
        ip_address: req.ip
      });

      return sendSuccess(res, 'Company created successfully with auto-generated login credentials', data, HTTP_STATUS.CREATED);
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
      const updated = await companyService.updateCompany(req.params.id, companyData);

      await auditLogService.log({
        user_id: req.user.id,
        action: 'Company Updated',
        table_name: 'companies',
        record_id: req.params.id,
        ip_address: req.ip
      });

      return sendSuccess(res, 'Company updated successfully', updated, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async updateCompanyStatus(req, res, next) {
    try {
      const { companyId, status } = req.body;
      const updated = await companyService.updateCompanyStatus(companyId, status);

      await auditLogService.log({
        user_id: req.user.id,
        action: `Company Status Changed to ${status}`,
        table_name: 'companies',
        record_id: companyId,
        ip_address: req.ip
      });

      return sendSuccess(res, `Company status updated to ${status}`, updated, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async resetCompanyPassword(req, res, next) {
    try {
      const { companyId } = req.body;
      const result = await companyService.resetCompanyPassword(companyId);

      await auditLogService.log({
        user_id: req.user.id,
        action: 'Password Reset',
        table_name: 'companies',
        record_id: companyId,
        ip_address: req.ip
      });

      return sendSuccess(res, 'Company password reset successfully', result, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async deleteCompany(req, res, next) {
    try {
      await companyService.deleteCompany(req.params.id);

      await auditLogService.log({
        user_id: req.user.id,
        action: 'Company Deleted',
        table_name: 'companies',
        record_id: req.params.id,
        ip_address: req.ip
      });

      return sendSuccess(res, 'Company deleted successfully', {}, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminCompanyController();
