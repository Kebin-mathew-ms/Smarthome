const serviceRepository = require('../repositories/service.repository');
const servicePackageRepository = require('../repositories/servicePackage.repository');
const auditLogService = require('./auditLog.service');
const Service = require('../models/service.model');
const ServicePackage = require('../models/servicePackage.model');

class CompanyServiceService {
  async createService(companyId, userId, ipAddress, data, files = {}) {
    const existing = await serviceRepository.findByName(data.service_name, companyId);
    if (existing) {
      const error = new Error('A service with this name already exists in your company catalog.');
      error.statusCode = 409;
      throw error;
    }

    const thumbnailPath = files.thumbnail ? files.thumbnail[0].path : null;

    const serviceId = await serviceRepository.create({
      company_id: companyId,
      category_id: data.category_id,
      subcategory_id: data.subcategory_id,
      service_name: data.service_name,
      short_description: data.short_description || null,
      full_description: data.full_description || null,
      starting_price: data.starting_price,
      estimated_duration: data.estimated_duration || null,
      service_type: data.service_type || 'on_site',
      thumbnail: thumbnailPath,
      status: data.status || 'active'
    });

    // Save Features
    let featuresArray = [];
    if (data.features) {
      featuresArray = typeof data.features === 'string' ? JSON.parse(data.features) : data.features;
    }
    if (Array.isArray(featuresArray) && featuresArray.length) {
      await serviceRepository.setFeatures(serviceId, featuresArray);
    }

    // Save Images
    if (files.gallery && files.gallery.length) {
      for (let i = 0; i < files.gallery.length; i++) {
        await serviceRepository.addImage(serviceId, files.gallery[i].path, i);
      }
    }

    // Write Audit Log
    await auditLogService.log({
      user_id: userId,
      action: 'Service Created',
      table_name: 'services',
      record_id: serviceId,
      ip_address: ipAddress
    });

    return await serviceRepository.findById(serviceId, companyId);
  }

  async getServices(companyId, query) {
    const result = await serviceRepository.findAll(companyId, query);
    return {
      ...result,
      items: result.items.map(Service.toResponse)
    };
  }

  async getServiceById(serviceId, companyId) {
    const service = await serviceRepository.findById(serviceId, companyId);
    if (!service) {
      const error = new Error('Service not found or unauthorized access.');
      error.statusCode = 404;
      throw error;
    }
    const packages = await servicePackageRepository.findByServiceId(serviceId);
    return {
      ...Service.toResponse(service),
      packages: packages.map(ServicePackage.toResponse)
    };
  }

  async updateService(serviceId, companyId, userId, ipAddress, data, files = {}) {
    const service = await serviceRepository.findById(serviceId, companyId);
    if (!service) {
      const error = new Error('Service not found or unauthorized access.');
      error.statusCode = 404;
      throw error;
    }

    const thumbnailPath = files.thumbnail ? files.thumbnail[0].path : undefined;

    const updated = await serviceRepository.update(serviceId, companyId, {
      category_id: data.category_id,
      subcategory_id: data.subcategory_id,
      service_name: data.service_name,
      short_description: data.short_description,
      full_description: data.full_description,
      starting_price: data.starting_price,
      estimated_duration: data.estimated_duration,
      service_type: data.service_type,
      thumbnail: thumbnailPath,
      status: data.status
    });

    if (data.features !== undefined) {
      const featuresArray = typeof data.features === 'string' ? JSON.parse(data.features) : data.features;
      await serviceRepository.setFeatures(serviceId, Array.isArray(featuresArray) ? featuresArray : []);
    }

    if (files.gallery && files.gallery.length) {
      for (let i = 0; i < files.gallery.length; i++) {
        await serviceRepository.addImage(serviceId, files.gallery[i].path, i);
      }
    }

    await auditLogService.log({
      user_id: userId,
      action: 'Service Updated',
      table_name: 'services',
      record_id: serviceId,
      ip_address: ipAddress
    });

    return await serviceRepository.findById(serviceId, companyId);
  }

  async updateServiceStatus(serviceId, companyId, status) {
    const service = await serviceRepository.findById(serviceId, companyId);
    if (!service) {
      const error = new Error('Service not found or unauthorized access.');
      error.statusCode = 404;
      throw error;
    }
    return await serviceRepository.updateStatus(serviceId, companyId, status);
  }

  async deleteService(serviceId, companyId, userId, ipAddress) {
    const service = await serviceRepository.findById(serviceId, companyId);
    if (!service) {
      const error = new Error('Service not found or unauthorized access.');
      error.statusCode = 404;
      throw error;
    }

    const deleted = await serviceRepository.softDelete(serviceId, companyId);

    await auditLogService.log({
      user_id: userId,
      action: 'Service Deleted',
      table_name: 'services',
      record_id: serviceId,
      ip_address: ipAddress
    });

    return deleted;
  }

  async duplicateService(serviceId, companyId, userId, ipAddress) {
    const original = await serviceRepository.findById(serviceId, companyId);
    if (!original) {
      const error = new Error('Service not found or unauthorized access.');
      error.statusCode = 404;
      throw error;
    }

    const newName = `Copy of ${original.service_name}`;
    const newServiceId = await serviceRepository.create({
      company_id: companyId,
      category_id: original.category_id,
      subcategory_id: original.subcategory_id,
      service_name: newName,
      short_description: original.short_description,
      full_description: original.full_description,
      starting_price: original.starting_price,
      estimated_duration: original.estimated_duration,
      service_type: original.service_type,
      thumbnail: original.thumbnail,
      status: 'active'
    });

    // Copy features
    if (original.features && original.features.length) {
      await serviceRepository.setFeatures(newServiceId, original.features.map(f => f.feature_name));
    }

    // Copy packages
    const pkgs = await servicePackageRepository.findByServiceId(serviceId);
    for (const p of pkgs) {
      await servicePackageRepository.create({
        service_id: newServiceId,
        package_name: p.package_name,
        package_description: p.package_description,
        price: p.price,
        estimated_duration: p.estimated_duration,
        status: p.status
      });
    }

    await auditLogService.log({
      user_id: userId,
      action: 'Service Duplicated',
      table_name: 'services',
      record_id: newServiceId,
      ip_address: ipAddress
    });

    return await serviceRepository.findById(newServiceId, companyId);
  }

  // Service Packages Operations
  async getPackages(companyId) {
    const pkgs = await servicePackageRepository.findByCompanyId(companyId);
    return pkgs.map(ServicePackage.toResponse);
  }

  async createPackage(companyId, userId, ipAddress, data) {
    const service = await serviceRepository.findById(data.service_id, companyId);
    if (!service) {
      const error = new Error('Target service not found in your company catalog.');
      error.statusCode = 404;
      throw error;
    }

    const packageId = await servicePackageRepository.create({
      service_id: data.service_id,
      package_name: data.package_name,
      package_description: data.package_description || null,
      price: data.price,
      estimated_duration: data.estimated_duration || null,
      status: data.status || 'active'
    });

    await auditLogService.log({
      user_id: userId,
      action: 'Package Created',
      table_name: 'service_packages',
      record_id: packageId,
      ip_address: ipAddress
    });

    return await servicePackageRepository.findById(packageId, companyId);
  }

  async updatePackage(packageId, companyId, userId, ipAddress, data) {
    const pkg = await servicePackageRepository.findById(packageId, companyId);
    if (!pkg) {
      const error = new Error('Package not found or unauthorized access.');
      error.statusCode = 404;
      throw error;
    }

    const updated = await servicePackageRepository.update(packageId, companyId, data);

    await auditLogService.log({
      user_id: userId,
      action: 'Package Updated',
      table_name: 'service_packages',
      record_id: packageId,
      ip_address: ipAddress
    });

    return updated;
  }

  async deletePackage(packageId, companyId, userId, ipAddress) {
    const pkg = await servicePackageRepository.findById(packageId, companyId);
    if (!pkg) {
      const error = new Error('Package not found or unauthorized access.');
      error.statusCode = 404;
      throw error;
    }

    return await servicePackageRepository.softDelete(packageId, companyId);
  }
}

module.exports = new CompanyServiceService();
