const galleryRepository = require('../repositories/gallery.repository');
const auditLogService = require('./auditLog.service');
const GalleryItem = require('../models/gallery.model');

class CompanyGalleryService {
  async getGallery(companyId) {
    const rows = await galleryRepository.findByCompanyId(companyId);
    return rows.map(r => new GalleryItem(r));
  }

  async addImage(companyId, userId, ipAddress, imagePath, caption = null, displayOrder = 0) {
    const item = await galleryRepository.create({
      company_id: companyId,
      image_path: imagePath,
      caption,
      display_order: displayOrder
    });

    await auditLogService.log({
      user_id: userId,
      action: 'Gallery Updated',
      table_name: 'company_gallery',
      record_id: item.id,
      ip_address: ipAddress
    });

    return item;
  }

  async deleteImage(imageId, companyId, userId, ipAddress) {
    const item = await galleryRepository.findById(imageId, companyId);
    if (!item) {
      const error = new Error('Gallery image not found or unauthorized access.');
      error.statusCode = 404;
      throw error;
    }

    const deleted = await galleryRepository.delete(imageId, companyId);

    await auditLogService.log({
      user_id: userId,
      action: 'Gallery Updated',
      table_name: 'company_gallery',
      record_id: imageId,
      ip_address: ipAddress
    });

    return deleted;
  }
}

module.exports = new CompanyGalleryService();
