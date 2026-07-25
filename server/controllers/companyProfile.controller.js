const companyService = require('../services/company.service');
const { sendSuccess } = require('../utils/response.util');
const HTTP_STATUS = require('../utils/httpStatus.util');

class CompanyProfileController {
  async getProfile(req, res, next) {
    try {
      const company = await companyService.getCompanyById(req.companyId);
      return sendSuccess(res, 'Company profile retrieved successfully', company, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const logoPath = req.files && req.files.logo ? req.files.logo[0].path : undefined;
      const coverPath = req.files && req.files.cover_image ? req.files.cover_image[0].path : undefined;

      const profileData = { ...req.body };
      if (logoPath !== undefined) profileData.logo = logoPath;
      if (coverPath !== undefined) profileData.cover_image = coverPath;

      const updated = await companyService.updateCompany(req.companyId, profileData);
      return sendSuccess(res, 'Company profile updated successfully', updated, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CompanyProfileController();
