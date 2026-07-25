const serviceCategoryRepository = require('../repositories/serviceCategory.repository');
const ServiceCategory = require('../models/serviceCategory.model');

class ServiceCategoryService {
  async createCategory(categoryData) {
    const existing = await serviceCategoryRepository.findByName(categoryData.category_name);
    if (existing) {
      const error = new Error('Service category with this name already exists.');
      error.statusCode = 409;
      throw error;
    }

    const category = await serviceCategoryRepository.create(categoryData);
    return ServiceCategory.toResponse(category);
  }

  async getCategories(query) {
    const result = await serviceCategoryRepository.findAll(query);
    return {
      ...result,
      items: result.items.map(ServiceCategory.toResponse)
    };
  }

  async getCategoryById(id) {
    const category = await serviceCategoryRepository.findById(id);
    if (!category) {
      const error = new Error('Service category not found.');
      error.statusCode = 404;
      throw error;
    }
    return ServiceCategory.toResponse(category);
  }

  async updateCategory(id, categoryData) {
    const category = await serviceCategoryRepository.findById(id);
    if (!category) {
      const error = new Error('Service category not found.');
      error.statusCode = 404;
      throw error;
    }

    const updated = await serviceCategoryRepository.update(id, categoryData);
    return ServiceCategory.toResponse(updated);
  }

  async deleteCategory(id) {
    const category = await serviceCategoryRepository.findById(id);
    if (!category) {
      const error = new Error('Service category not found.');
      error.statusCode = 404;
      throw error;
    }

    return await serviceCategoryRepository.softDelete(id);
  }
}

module.exports = new ServiceCategoryService();
