const { query } = require('../config/db');

class FavoriteRepository {
  async addFavorite(userId, companyId = null, serviceId = null) {
    // Check if already favorited
    let checkSql = 'SELECT id FROM favorites WHERE user_id = ?';
    const params = [userId];
    if (companyId) {
      checkSql += ' AND company_id = ?';
      params.push(companyId);
    } else if (serviceId) {
      checkSql += ' AND service_id = ?';
      params.push(serviceId);
    }

    const existing = await query(checkSql, params);
    if (existing[0]) return existing[0].id;

    const sql = `INSERT INTO favorites (user_id, company_id, service_id) VALUES (?, ?, ?)`;
    const result = await query(sql, [userId, companyId || null, serviceId || null]);
    return result.insertId;
  }

  async removeFavorite(favoriteId, userId) {
    const sql = `DELETE FROM favorites WHERE id = ? AND user_id = ?`;
    const result = await query(sql, [favoriteId, userId]);
    return result.affectedRows > 0;
  }

  async findUserFavorites(userId) {
    const companiesSql = `
      SELECT f.id as favorite_id, f.created_at as favorited_at, c.id as company_id, c.company_name, c.logo, c.city, c.state
      FROM favorites f
      JOIN companies c ON f.company_id = c.id
      WHERE f.user_id = ? AND f.company_id IS NOT NULL AND c.deleted_at IS NULL
      ORDER BY f.created_at DESC
    `;
    const favoritedCompanies = await query(companiesSql, [userId]);

    const servicesSql = `
      SELECT f.id as favorite_id, f.created_at as favorited_at, s.id as service_id, s.service_name, s.starting_price, s.thumbnail, c.category_name, comp.company_name
      FROM favorites f
      JOIN services s ON f.service_id = s.id
      JOIN service_categories c ON s.category_id = c.id
      LEFT JOIN companies comp ON s.company_id = comp.id
      WHERE f.user_id = ? AND f.service_id IS NOT NULL AND s.deleted_at IS NULL
      ORDER BY f.created_at DESC
    `;
    const favoritedServices = await query(servicesSql, [userId]);

    return {
      companies: favoritedCompanies,
      services: favoritedServices
    };
  }
}

module.exports = new FavoriteRepository();
