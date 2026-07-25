const serviceCategoryService = require('../services/serviceCategory.service');
const auditLogService = require('../services/auditLog.service');
const { sendSuccess } = require('../utils/response.util');
const HTTP_STATUS = require('../utils/httpStatus.util');

class ServiceCategoryController {
  async getCategories(req, res, next) {
    try {
      const result = await serviceCategoryService.getCategories(req.query);
      return sendSuccess(res, 'Categories retrieved successfully', result, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async getCategoryById(req, res, next) {
    try {
      const category = await serviceCategoryService.getCategoryById(req.params.id);
      return sendSuccess(res, 'Category retrieved successfully', category, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async createCategory(req, res, next) {
    try {
      const iconPath = req.file ? req.file.path : (req.body.icon || null);
      const category = await serviceCategoryService.createCategory({
        ...req.body,
        icon: iconPath
      });

      if (req.user) {
        await auditLogService.log({
          user_id: req.user.id,
          action: 'Category Created',
          table_name: 'service_categories',
          record_id: category.id,
          ip_address: req.ip
        });
      }

      return sendSuccess(res, 'Service category created successfully', category, HTTP_STATUS.CREATED);
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(req, res, next) {
    try {
      const iconPath = req.file ? req.file.path : undefined;
      const categoryData = { ...req.body };
      if (iconPath !== undefined) {
        categoryData.icon = iconPath;
      }
      const updated = await serviceCategoryService.updateCategory(req.params.id, categoryData);

      if (req.user) {
        await auditLogService.log({
          user_id: req.user.id,
          action: 'Category Updated',
          table_name: 'service_categories',
          record_id: req.params.id,
          ip_address: req.ip
        });
      }

      return sendSuccess(res, 'Service category updated successfully', updated, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(req, res, next) {
    try {
      await serviceCategoryService.deleteCategory(req.params.id);

      if (req.user) {
        await auditLogService.log({
          user_id: req.user.id,
          action: 'Category Deleted',
          table_name: 'service_categories',
          record_id: req.params.id,
          ip_address: req.ip
        });
      }

      return sendSuccess(res, 'Service category deleted successfully', {}, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ServiceCategoryController();
