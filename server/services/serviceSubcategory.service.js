const serviceSubcategoryRepository = require('../repositories/serviceSubcategory.repository');
const serviceCategoryRepository = require('../repositories/serviceCategory.repository');
const ServiceSubcategory = require('../models/serviceSubcategory.model');

class ServiceSubcategoryService {
  async createSubcategory(data) {
    const category = await serviceCategoryRepository.findById(data.category_id);
    if (!category) {
      const error = new Error('Parent service category does not exist.');
      error.statusCode = 404;
      throw error;
    }

    const existing = await serviceSubcategoryRepository.findByNameAndCategory(data.subcategory_name, data.category_id);
    if (existing) {
      const error = new Error('Subcategory with this name already exists in selected category.');
      error.statusCode = 409;
      throw error;
    }

    const subcategory = await serviceSubcategoryRepository.create(data);
    return ServiceSubcategory.toResponse(subcategory);
  }

  async getSubcategories(query) {
    const result = await serviceSubcategoryRepository.findAll(query);
    return {
      ...result,
      items: result.items.map(ServiceSubcategory.toResponse)
    };
  }

  async getSubcategoryById(id) {
    const sub = await serviceSubcategoryRepository.findById(id);
    if (!sub) {
      const error = new Error('Service subcategory not found.');
      error.statusCode = 404;
      throw error;
    }
    return ServiceSubcategory.toResponse(sub);
  }

  async updateSubcategory(id, data) {
    const sub = await serviceSubcategoryRepository.findById(id);
    if (!sub) {
      const error = new Error('Service subcategory not found.');
      error.statusCode = 404;
      throw error;
    }

    const updated = await serviceSubcategoryRepository.update(id, data);
    return ServiceSubcategory.toResponse(updated);
  }

  async deleteSubcategory(id) {
    const sub = await serviceSubcategoryRepository.findById(id);
    if (!sub) {
      const error = new Error('Service subcategory not found.');
      error.statusCode = 404;
      throw error;
    }

    return await serviceSubcategoryRepository.softDelete(id);
  }
}

module.exports = new ServiceSubcategoryService();
