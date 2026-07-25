const serviceRepository = require('../repositories/service.repository');
const employeeRepository = require('../repositories/employee.repository');
const companyRepository = require('../repositories/company.repository');
const { query } = require('../config/db');

class CompanyDashboardService {
  async getDashboardStats(companyId) {
    const serviceCounts = await serviceRepository.countByCompanyId(companyId);
    const totalEmployees = await employeeRepository.countByCompanyId(companyId);
    
    // Fetch Review summary if exists
    const reviewSql = `SELECT average_rating, total_reviews FROM company_reviews_summary WHERE company_id = ? LIMIT 1`;
    const reviewRows = await query(reviewSql, [companyId]);
    const reviewSummary = reviewRows[0] || { average_rating: 5.00, total_reviews: 0 };

    const companyInfo = await companyRepository.findById(companyId);

    return {
      totalServices: serviceCounts.total || 0,
      activeServices: serviceCounts.active || 0,
      inactiveServices: serviceCounts.inactive || 0,
      totalEmployees,
      upcomingBookings: 0,
      completedBookings: 0,
      averageRating: Number(reviewSummary.average_rating),
      totalReviews: reviewSummary.total_reviews,
      companyName: companyInfo ? companyInfo.company_name : 'Service Provider'
    };
  }
}

module.exports = new CompanyDashboardService();
