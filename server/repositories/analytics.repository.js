const { query } = require('../config/db');

class AnalyticsRepository {
  async getAdminAnalytics() {
    // 1. Financial Metrics
    const revRow = await query(`
      SELECT 
        SUM(total_amount) as total_revenue,
        SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN total_amount ELSE 0 END) as monthly_revenue,
        SUM(CASE WHEN DATE(created_at) = CURDATE() THEN total_amount ELSE 0 END) as today_revenue,
        AVG(total_amount) as avg_booking_value
      FROM bookings
      WHERE booking_status = 'Completed'
    `);

    // 2. Companies Breakdown
    const compRow = await query(`
      SELECT 
        COUNT(*) as total_companies,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_companies,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_companies,
        SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive_companies
      FROM companies
    `);

    // 3. Customers Breakdown
    const custRow = await query(`
      SELECT 
        COUNT(*) as total_customers,
        SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as new_customers
      FROM users
      WHERE role = 'Customer'
    `);

    // 4. Bookings Breakdown
    const bkRow = await query(`
      SELECT 
        COUNT(*) as total_bookings,
        SUM(CASE WHEN booking_status = 'Completed' THEN 1 ELSE 0 END) as completed_bookings,
        SUM(CASE WHEN booking_status = 'Cancelled' THEN 1 ELSE 0 END) as cancelled_bookings,
        SUM(CASE WHEN booking_status = 'Pending' THEN 1 ELSE 0 END) as pending_bookings
      FROM bookings
    `);

    // 5. CSAT & Rating Breakdown
    const ratingRow = await query(`
      SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews
      FROM reviews
    `);

    // 6. Complaints Resolution Breakdown
    const complaintRow = await query(`
      SELECT 
        COUNT(*) as total_complaints,
        SUM(CASE WHEN status IN ('Resolved', 'Closed') THEN 1 ELSE 0 END) as resolved_complaints
      FROM complaints
    `);

    const totalComplaints = complaintRow[0].total_complaints || 0;
    const resolvedComplaints = complaintRow[0].resolved_complaints || 0;
    const resolutionRate = totalComplaints > 0 ? Number(((resolvedComplaints / totalComplaints) * 100).toFixed(2)) : 100;

    return {
      total_revenue: Number(revRow[0].total_revenue || 0),
      monthly_revenue: Number(revRow[0].monthly_revenue || 0),
      today_revenue: Number(revRow[0].today_revenue || 0),
      avg_booking_value: Number(revRow[0].avg_booking_value || 0),
      total_companies: compRow[0].total_companies || 0,
      active_companies: compRow[0].active_companies || 0,
      pending_companies: compRow[0].pending_companies || 0,
      total_customers: custRow[0].total_customers || 0,
      new_customers: custRow[0].new_customers || 0,
      total_bookings: bkRow[0].total_bookings || 0,
      completed_bookings: bkRow[0].completed_bookings || 0,
      cancelled_bookings: bkRow[0].cancelled_bookings || 0,
      pending_bookings: bkRow[0].pending_bookings || 0,
      avg_company_rating: ratingRow[0].avg_rating ? Number(Number(ratingRow[0].avg_rating).toFixed(2)) : 5.00,
      total_complaints: totalComplaints,
      complaint_resolution_rate: resolutionRate
    };
  }

  async getCompanyAnalytics(companyId) {
    const revRow = await query(`
      SELECT 
        SUM(total_amount) as total_revenue,
        COUNT(*) as total_bookings,
        SUM(CASE WHEN booking_status = 'Completed' THEN 1 ELSE 0 END) as completed_bookings,
        SUM(CASE WHEN booking_status = 'Cancelled' THEN 1 ELSE 0 END) as cancelled_bookings
      FROM bookings
      WHERE company_id = ?
    `, [companyId]);

    const topServices = await query(`
      SELECT s.service_name, COUNT(b.id) as total_bookings, SUM(b.total_amount) as revenue
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      WHERE b.company_id = ?
      GROUP BY s.id, s.service_name
      ORDER BY total_bookings DESC
      LIMIT 5
    `, [companyId]);

    const ratingRow = await query(`
      SELECT average_rating, total_reviews
      FROM company_reviews_summary
      WHERE company_id = ?
      LIMIT 1
    `, [companyId]);

    return {
      total_revenue: Number(revRow[0].total_revenue || 0),
      total_bookings: revRow[0].total_bookings || 0,
      completed_bookings: revRow[0].completed_bookings || 0,
      cancelled_bookings: revRow[0].cancelled_bookings || 0,
      top_services: topServices,
      average_rating: ratingRow[0] ? Number(ratingRow[0].average_rating) : 5.00,
      total_reviews: ratingRow[0] ? ratingRow[0].total_reviews : 0
    };
  }

  async getBookingReport({ startDate, endDate, companyId, status }) {
    let sql = `
      SELECT b.booking_number, b.scheduled_date, b.scheduled_time, b.booking_status, b.payment_status, b.total_amount, u.full_name as customer_name, c.company_name, s.service_name
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN companies c ON b.company_id = c.id
      JOIN services s ON b.service_id = s.id
      WHERE 1=1
    `;
    const params = [];

    if (startDate) { sql += ` AND DATE(b.created_at) >= ?`; params.push(startDate); }
    if (endDate) { sql += ` AND DATE(b.created_at) <= ?`; params.push(endDate); }
    if (companyId) { sql += ` AND b.company_id = ?`; params.push(companyId); }
    if (status) { sql += ` AND b.booking_status = ?`; params.push(status); }

    sql += ` ORDER BY b.created_at DESC LIMIT 500`;
    return await query(sql, params);
  }
}

module.exports = new AnalyticsRepository();
