const { query } = require('../config/db');

class CompanySettingRepository {
  async findByCompanyId(company_id) {
    const sql = `
      SELECT * FROM company_settings
      WHERE company_id = ?
      LIMIT 1
    `;
    const rows = await query(sql, [company_id]);
    return rows[0] || null;
  }

  async upsert(company_id, { working_hours, working_days, service_radius, minimum_booking_amount, company_status }) {
    const sql = `
      INSERT INTO company_settings (company_id, working_hours, working_days, service_radius, minimum_booking_amount, company_status)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        working_hours = VALUES(working_hours),
        working_days = VALUES(working_days),
        service_radius = VALUES(service_radius),
        minimum_booking_amount = VALUES(minimum_booking_amount),
        company_status = VALUES(company_status)
    `;
    await query(sql, [
      company_id,
      working_hours || '09:00 - 18:00',
      working_days || 'Monday - Saturday',
      service_radius !== undefined ? service_radius : 25.00,
      minimum_booking_amount !== undefined ? minimum_booking_amount : 0.00,
      company_status || 'pending'
    ]);
    return this.findByCompanyId(company_id);
  }
}

module.exports = new CompanySettingRepository();
