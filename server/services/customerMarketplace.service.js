const marketplaceRepository = require('../repositories/marketplace.repository');
const serviceCategoryRepository = require('../repositories/serviceCategory.repository');

class CustomerMarketplaceService {
  async getCompanies(query) {
    return await marketplaceRepository.findAllCompanies(query);
  }

  async getCompanyDetails(companyId) {
    const company = await marketplaceRepository.findCompanyById(companyId);
    if (!company) {
      const error = new Error('Company profile not found.');
      error.statusCode = 404;
      throw error;
    }

    // CRITICAL REQUIREMENT: Fetch ALL services provided by this company to render on same page
    const services = await marketplaceRepository.findServicesByCompanyId(companyId);

    return {
      company,
      services
    };
  }

  async getServiceDetails(serviceId) {
    const service = await marketplaceRepository.findServiceById(serviceId);
    if (!service) {
      const error = new Error('Service listing not found.');
      error.statusCode = 404;
      throw error;
    }
    return service;
  }

  async getCompanyServices(companyId) {
    return await marketplaceRepository.findServicesByCompanyId(companyId);
  }

  async getLandingData() {
    const categoriesResult = await serviceCategoryRepository.findAll({ page: 1, limit: 8 });
    const featuredCompanies = await marketplaceRepository.findFeaturedCompanies(6);
    const popularServices = await marketplaceRepository.findPopularServices(6);

    return {
      categories: categoriesResult.items,
      featuredCompanies,
      popularServices
    };
  }

  async searchMarketplace(term, categoryId) {
    return await marketplaceRepository.searchMarketplace(term || '', categoryId);
  }
}

module.exports = new CustomerMarketplaceService();
