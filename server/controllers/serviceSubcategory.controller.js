const serviceSubcategoryService = require('../services/serviceSubcategory.service');
const auditLogService = require('../services/auditLog.service');
const { sendSuccess } = require('../utils/response.util');
const HTTP_STATUS = require('../utils/httpStatus.util');

class ServiceSubcategoryController {
  async getSubcategories(req, res, next) {
    try {
      const result = await serviceSubcategoryService.getSubcategories(req.query);
      return sendSuccess(res, 'Subcategories retrieved successfully', result, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async getSubcategoryById(req, res, next) {
    try {
      const sub = await serviceSubcategoryService.getSubcategoryById(req.params.id);
      return sendSuccess(res, 'Subcategory retrieved successfully', sub, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async createSubcategory(req, res, next) {
    try {
      const iconPath = req.file ? req.file.path : (req.body.icon || null);
      const subcategory = await serviceSubcategoryService.createSubcategory({
        ...req.body,
        icon: iconPath
      });

      await auditLogService.log({
        user_id: req.user.id,
        action: 'Subcategory Created',
        table_name: 'service_subcategories',
        record_id: subcategory.id,
        ip_address: req.ip
      });

      return sendSuccess(res, 'Service subcategory created successfully', subcategory, HTTP_STATUS.CREATED);
    } catch (error) {
      next(error);
    }
  }

  async updateSubcategory(req, res, next) {
    try {
      const iconPath = req.file ? req.file.path : undefined;
      const data = { ...req.body };
      if (iconPath !== undefined) {
        data.icon = iconPath;
      }
      const updated = await serviceSubcategoryService.updateSubcategory(req.params.id, data);

      await auditLogService.log({
        user_id: req.user.id,
        action: 'Subcategory Updated',
        table_name: 'service_subcategories',
        record_id: req.params.id,
        ip_address: req.ip
      });

      return sendSuccess(res, 'Service subcategory updated successfully', updated, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async deleteSubcategory(req, res, next) {
    try {
      await serviceSubcategoryService.deleteSubcategory(req.params.id);

      await auditLogService.log({
        user_id: req.user.id,
        action: 'Subcategory Deleted',
        table_name: 'service_subcategories',
        record_id: req.params.id,
        ip_address: req.ip
      });

      return sendSuccess(res, 'Service subcategory deleted successfully', {}, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ServiceSubcategoryController();
