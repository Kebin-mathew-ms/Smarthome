const { query } = require('../config/db');

class RecentlyViewedRepository {
  async recordView(userId, companyId = null, serviceId = null) {
    if (!userId) return;

    let checkSql = 'SELECT id FROM recently_viewed WHERE user_id = ?';
    const params = [userId];
    if (companyId) {
      checkSql += ' AND company_id = ?';
      params.push(companyId);
    } else if (serviceId) {
      checkSql += ' AND service_id = ?';
      params.push(serviceId);
    }

    const existing = await query(checkSql, params);
    if (existing[0]) {
      const updateSql = `UPDATE recently_viewed SET viewed_at = NOW() WHERE id = ?`;
      await query(updateSql, [existing[0].id]);
      return existing[0].id;
    }

    const insertSql = `INSERT INTO recently_viewed (user_id, company_id, service_id) VALUES (?, ?, ?)`;
    const result = await query(insertSql, [userId, companyId || null, serviceId || null]);
    return result.insertId;
  }

  async findUserHistory(userId) {
    const companiesSql = `
      SELECT rv.id as history_id, rv.viewed_at, c.id as company_id, c.company_name, c.logo, c.city, c.state
      FROM recently_viewed rv
      JOIN companies c ON rv.company_id = c.id
      WHERE rv.user_id = ? AND rv.company_id IS NOT NULL AND c.deleted_at IS NULL
      ORDER BY rv.viewed_at DESC
      LIMIT 10
    `;
    const companies = await query(companiesSql, [userId]);

    const servicesSql = `
      SELECT rv.id as history_id, rv.viewed_at, s.id as service_id, s.service_name, s.starting_price, s.thumbnail, c.category_name, comp.company_name
      FROM recently_viewed rv
      JOIN services s ON rv.service_id = s.id
      JOIN service_categories c ON s.category_id = c.id
      JOIN companies comp ON s.company_id = comp.id
      WHERE rv.user_id = ? AND rv.service_id IS NOT NULL AND s.deleted_at IS NULL
      ORDER BY rv.viewed_at DESC
      LIMIT 10
    `;
    const services = await query(servicesSql, [userId]);

    return {
      companies,
      services
    };
  }
}

module.exports = new RecentlyViewedRepository();
