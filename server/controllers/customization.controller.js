const customizationRepository = require('../repositories/customization.repository');
const { sendSuccess } = require('../utils/response.util');
const HTTP_STATUS = require('../utils/httpStatus.util');

class CustomizationController {
  async getServiceCustomizations(req, res, next) {
    try {
      const { serviceId } = req.params;
      const { package_id } = req.query;
      const customizations = await customizationRepository.getCustomizations(serviceId, package_id);
      return sendSuccess(res, 'Customizations retrieved successfully', customizations, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  // Group Admin Operations
  async createGroup(req, res, next) {
    try {
      const { serviceId } = req.params;
      const group = await customizationRepository.createGroup({
        service_id: Number(serviceId),
        ...req.body
      });
      return sendSuccess(res, 'Customization group created successfully', group, HTTP_STATUS.CREATED);
    } catch (error) {
      next(error);
    }
  }

  async updateGroup(req, res, next) {
    try {
      const { groupId } = req.params;
      const group = await customizationRepository.updateGroup(Number(groupId), req.body);
      return sendSuccess(res, 'Customization group updated successfully', group, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async deleteGroup(req, res, next) {
    try {
      const { groupId } = req.params;
      const deleted = await customizationRepository.deleteGroup(Number(groupId));
      if (!deleted) {
        const error = new Error('Customization group not found.');
        error.statusCode = 404;
        throw error;
      }
      return sendSuccess(res, 'Customization group deleted successfully', null, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  // Option Admin Operations
  async createOption(req, res, next) {
    try {
      const option = await customizationRepository.createOption(req.body);
      return sendSuccess(res, 'Customization option created successfully', option, HTTP_STATUS.CREATED);
    } catch (error) {
      next(error);
    }
  }

  async updateOption(req, res, next) {
    try {
      const { optionId } = req.params;
      const option = await customizationRepository.updateOption(Number(optionId), req.body);
      return sendSuccess(res, 'Customization option updated successfully', option, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async deleteOption(req, res, next) {
    try {
      const { optionId } = req.params;
      const deleted = await customizationRepository.deleteOption(Number(optionId));
      if (!deleted) {
        const error = new Error('Customization option not found.');
        error.statusCode = 404;
        throw error;
      }
      return sendSuccess(res, 'Customization option deleted successfully', null, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  // Package Config Operations
  async getPackageOverrides(req, res, next) {
    try {
      const { packageId } = req.params;
      const overrides = await customizationRepository.getPackageOverrides(Number(packageId));
      return sendSuccess(res, 'Package overrides retrieved successfully', overrides, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async savePackageConfig(req, res, next) {
    try {
      const config = await customizationRepository.savePackageConfig(req.body);
      return sendSuccess(res, 'Package customization config saved successfully', config, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async deletePackageConfig(req, res, next) {
    try {
      const { packageId, optionId } = req.params;
      const deleted = await customizationRepository.deletePackageConfig(Number(packageId), Number(optionId));
      if (!deleted) {
        const error = new Error('Package configuration override not found.');
        error.statusCode = 404;
        throw error;
      }
      return sendSuccess(res, 'Package configuration override deleted successfully', null, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CustomizationController();
