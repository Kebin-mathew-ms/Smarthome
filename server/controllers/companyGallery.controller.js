const companyGalleryService = require('../services/companyGallery.service');
const { sendSuccess } = require('../utils/response.util');
const HTTP_STATUS = require('../utils/httpStatus.util');

class CompanyGalleryController {
  async getGallery(req, res, next) {
    try {
      const items = await companyGalleryService.getGallery(req.companyId);
      return sendSuccess(res, 'Gallery portfolio retrieved successfully', items, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async addImage(req, res, next) {
    try {
      if (!req.file) {
        const error = new Error('No image file uploaded.');
        error.statusCode = 400;
        throw error;
      }

      const item = await companyGalleryService.addImage(
        req.companyId,
        req.user.id,
        req.ip,
        req.file.path,
        req.body.caption || null,
        req.body.display_order ? Number(req.body.display_order) : 0
      );

      return sendSuccess(res, 'Gallery image added successfully', item, HTTP_STATUS.CREATED);
    } catch (error) {
      next(error);
    }
  }

  async deleteImage(req, res, next) {
    try {
      await companyGalleryService.deleteImage(req.params.id, req.companyId, req.user.id, req.ip);
      return sendSuccess(res, 'Gallery image deleted successfully', {}, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CompanyGalleryController();
