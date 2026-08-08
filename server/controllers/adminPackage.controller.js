const servicePackageRepository = require('../repositories/servicePackage.repository');
const auditLogService = require('../services/auditLog.service');
const { sendSuccess } = require('../utils/response.util');
const HTTP_STATUS = require('../utils/httpStatus.util');

class AdminPackageController {
  async getPackages(req, res, next) {
    try {
      const result = await servicePackageRepository.findAll();
      return sendSuccess(res, 'Service packages retrieved successfully', result, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async getPackagesByServiceId(req, res, next) {
    try {
      const result = await servicePackageRepository.findByServiceId(req.params.serviceId);
      return sendSuccess(res, 'Packages retrieved successfully', result, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async createPackage(req, res, next) {
    try {
      const data = {
        service_id: req.body.service_id,
        package_name: req.body.package_name,
        package_description: req.body.package_description,
        price: req.body.price,
        estimated_duration: req.body.estimated_duration,
        status: req.body.status || 'active'
      };

      const packageId = await servicePackageRepository.create(data);

      await auditLogService.log({
        user_id: req.user.id,
        action: 'Service Package Created',
        table_name: 'service_packages',
        record_id: packageId,
        ip_address: req.ip
      });

      const newPackage = await servicePackageRepository.findById(packageId);
      return sendSuccess(res, 'Package created successfully', newPackage, HTTP_STATUS.CREATED);
    } catch (error) {
      next(error);
    }
  }

  async updatePackage(req, res, next) {
    try {
      const pkg = await servicePackageRepository.findById(req.params.id);
      if (!pkg) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: 'Package not found' });
      }

      const data = {
        package_name: req.body.package_name,
        package_description: req.body.package_description,
        price: req.body.price,
        estimated_duration: req.body.estimated_duration,
        status: req.body.status
      };

      const updated = await servicePackageRepository.update(req.params.id, data);

      await auditLogService.log({
        user_id: req.user.id,
        action: 'Service Package Updated',
        table_name: 'service_packages',
        record_id: req.params.id,
        ip_address: req.ip
      });

      return sendSuccess(res, 'Package updated successfully', updated, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async deletePackage(req, res, next) {
    try {
      const deleted = await servicePackageRepository.softDelete(req.params.id);
      await auditLogService.log({
        user_id: req.user.id,
        action: 'Service Package Deleted',
        table_name: 'service_packages',
        record_id: req.params.id,
        ip_address: req.ip
      });
      return sendSuccess(res, 'Package deleted successfully', { deleted }, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminPackageController();
