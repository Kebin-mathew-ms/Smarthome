const companyRepository = require('../repositories/company.repository');
const userRepository = require('../repositories/user.repository');
const serviceCategoryRepository = require('../repositories/serviceCategory.repository');
const serviceSubcategoryRepository = require('../repositories/serviceSubcategory.repository');

class AdminDashboardService {
  async getDashboardStats() {
    const companyStats = await companyRepository.getCountsByStatus();
    const totalCustomers = await userRepository.countCustomers();
    const todayRegistrations = await userRepository.countTodayRegistrations();
    
    const categoriesResult = await serviceCategoryRepository.findAll({ page: 1, limit: 1 });
    const subcategoriesResult = await serviceSubcategoryRepository.findAll({ page: 1, limit: 1 });

    const recentCompanies = await companyRepository.getRecent(5);
    const recentUsers = await userRepository.getRecentUsers(5);

    return {
      totalCompanies: companyStats.total,
      activeCompanies: companyStats.active,
      inactiveCompanies: companyStats.inactive,
      pendingCompanies: companyStats.pending,
      blockedCompanies: companyStats.blocked || 0,
      rejectedCompanies: companyStats.rejected || 0,
      totalCustomers,
      totalCategories: categoriesResult.total,
      totalSubcategories: subcategoriesResult.total,
      todayRegistrations,
      recentCompanies,
      recentUsers
    };
  }
}

module.exports = new AdminDashboardService();
