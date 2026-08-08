const serviceRepository = require('../repositories/service.repository');
const auditLogService = require('../services/auditLog.service');
const { sendSuccess } = require('../utils/response.util');
const HTTP_STATUS = require('../utils/httpStatus.util');

class AdminServiceController {
  async getServices(req, res, next) {
    try {
      const result = await serviceRepository.findAll(req.query);
      return sendSuccess(res, 'Services retrieved successfully', result, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async getServiceById(req, res, next) {
    try {
      const service = await serviceRepository.findById(req.params.id);
      if (!service) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: 'Service not found' });
      }
      return sendSuccess(res, 'Service retrieved successfully', service, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async createService(req, res, next) {
    try {
      const thumbnailFile = req.file ? req.file : null;
      const thumbnailPath = thumbnailFile ? `/uploads/${thumbnailFile.filename}` : null;

      const data = {
        category_id: req.body.category_id,
        subcategory_id: req.body.subcategory_id,
        service_name: req.body.service_name,
        short_description: req.body.short_description,
        full_description: req.body.full_description,
        starting_price: req.body.starting_price,
        estimated_duration: req.body.estimated_duration,
        service_type: req.body.service_type || 'on_site',
        thumbnail: thumbnailPath,
        status: req.body.status || 'active'
      };

      const serviceId = await serviceRepository.create(data);

      if (req.body.features) {
        const featuresArray = typeof req.body.features === 'string' ? JSON.parse(req.body.features) : req.body.features;
        if (Array.isArray(featuresArray)) {
          await serviceRepository.setFeatures(serviceId, featuresArray);
        }
      }

      await auditLogService.log({
        user_id: req.user.id,
        action: 'Service Created',
        table_name: 'services',
        record_id: serviceId,
        ip_address: req.ip
      });

      const newService = await serviceRepository.findById(serviceId);
      return sendSuccess(res, 'Service created successfully', newService, HTTP_STATUS.CREATED);
    } catch (error) {
      next(error);
    }
  }

  async updateService(req, res, next) {
    try {
      const service = await serviceRepository.findById(req.params.id);
      if (!service) {
        return res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: 'Service not found' });
      }

      const thumbnailFile = req.file ? req.file : null;
      const thumbnailPath = thumbnailFile ? `/uploads/${thumbnailFile.filename}` : undefined;

      const data = {
        category_id: req.body.category_id,
        subcategory_id: req.body.subcategory_id,
        service_name: req.body.service_name,
        short_description: req.body.short_description,
        full_description: req.body.full_description,
        starting_price: req.body.starting_price,
        estimated_duration: req.body.estimated_duration,
        service_type: req.body.service_type,
        thumbnail: thumbnailPath,
        status: req.body.status
      };

      const updated = await serviceRepository.update(req.params.id, data);

      if (req.body.features !== undefined) {
        const featuresArray = typeof req.body.features === 'string' ? JSON.parse(req.body.features) : req.body.features;
        if (Array.isArray(featuresArray)) {
          await serviceRepository.setFeatures(req.params.id, featuresArray);
        }
      }

      await auditLogService.log({
        user_id: req.user.id,
        action: 'Service Updated',
        table_name: 'services',
        record_id: req.params.id,
        ip_address: req.ip
      });

      const updatedService = await serviceRepository.findById(req.params.id);
      return sendSuccess(res, 'Service updated successfully', updatedService, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async updateServiceStatus(req, res, next) {
    try {
      const { serviceId, status } = req.body;
      const updated = await serviceRepository.updateStatus(serviceId, status);
      return sendSuccess(res, `Service status updated to ${status}`, updated, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async deleteService(req, res, next) {
    try {
      const deleted = await serviceRepository.softDelete(req.params.id);
      await auditLogService.log({
        user_id: req.user.id,
        action: 'Service Deleted',
        table_name: 'services',
        record_id: req.params.id,
        ip_address: req.ip
      });
      return sendSuccess(res, 'Service deleted successfully', { deleted }, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminServiceController();
