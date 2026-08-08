const { query } = require('../config/db');
const userRepository = require('../repositories/user.repository');
const serviceCategoryRepository = require('../repositories/serviceCategory.repository');
const serviceSubcategoryRepository = require('../repositories/serviceSubcategory.repository');

class AdminDashboardService {
  async getDashboardStats() {
    const totalCustomersRows = await query("SELECT COUNT(*) as total FROM users WHERE role = 'User'");
    const totalCustomers = totalCustomersRows[0] ? totalCustomersRows[0].total : 0;

    const totalVolunteersRows = await query("SELECT COUNT(*) as total FROM volunteers WHERE deleted_at IS NULL");
    const totalVolunteers = totalVolunteersRows[0] ? totalVolunteersRows[0].total : 0;

    const totalBookingsRows = await query("SELECT COUNT(*) as total FROM bookings");
    const totalBookings = totalBookingsRows[0] ? totalBookingsRows[0].total : 0;

    const totalServicesRows = await query("SELECT COUNT(*) as total FROM services WHERE deleted_at IS NULL");
    const totalServices = totalServicesRows[0] ? totalServicesRows[0].total : 0;

    const todayRegistrations = await userRepository.countTodayRegistrations();
    
    const categoriesResult = await serviceCategoryRepository.findAll({ page: 1, limit: 1 });
    const subcategoriesResult = await serviceSubcategoryRepository.findAll({ page: 1, limit: 1 });

    const recentUsers = await userRepository.getRecentUsers(5);

    const recentBookings = await query(`
      SELECT b.*, u.full_name as customer_name, s.service_name
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN services s ON b.service_id = s.id
      ORDER BY b.created_at DESC
      LIMIT 5
    `);

    return {
      totalBookings,
      totalVolunteers,
      totalServices,
      totalCustomers,
      totalCategories: categoriesResult.total,
      totalSubcategories: subcategoriesResult.total,
      todayRegistrations,
      recentBookings,
      recentUsers
    };
  }
}

module.exports = new AdminDashboardService();
