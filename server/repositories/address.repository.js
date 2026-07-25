const { query } = require('../config/db');

class AddressRepository {
  async findById(id, userId) {
    const sql = `SELECT * FROM addresses WHERE id = ? AND user_id = ? LIMIT 1`;
    const rows = await query(sql, [id, userId]);
    return rows[0] || null;
  }

  async findByUserId(userId) {
    const sql = `SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC`;
    return await query(sql, [userId]);
  }

  async create({ user_id, label = 'Home', contact_person, phone, house_name, street, landmark = null, city, district = null, state, postal_code, latitude = null, longitude = null, is_default = false }) {
    if (is_default) {
      await query(`UPDATE addresses SET is_default = FALSE WHERE user_id = ?`, [user_id]);
    }

    const sql = `
      INSERT INTO addresses (user_id, label, contact_person, phone, house_name, street, landmark, city, district, state, postal_code, latitude, longitude, is_default)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await query(sql, [
      user_id, label, contact_person, phone, house_name, street, landmark, city, district, state, postal_code, latitude, longitude, is_default
    ]);
    return result.insertId;
  }

  async update(id, userId, { label, contact_person, phone, house_name, street, landmark, city, district, state, postal_code, latitude, longitude, is_default }) {
    if (is_default) {
      await query(`UPDATE addresses SET is_default = FALSE WHERE user_id = ?`, [userId]);
    }

    const sql = `
      UPDATE addresses
      SET label = ?, contact_person = ?, phone = ?, house_name = ?, street = ?, landmark = ?, city = ?, district = ?, state = ?, postal_code = ?, latitude = ?, longitude = ?, is_default = ?
      WHERE id = ? AND user_id = ?
    `;
    await query(sql, [
      label, contact_person, phone, house_name, street, landmark, city, district, state, postal_code, latitude, longitude, is_default, id, userId
    ]);
    return this.findById(id, userId);
  }

  async delete(id, userId) {
    const sql = `DELETE FROM addresses WHERE id = ? AND user_id = ?`;
    const result = await query(sql, [id, userId]);
    return result.affectedRows > 0;
  }

  async setDefault(id, userId) {
    await query(`UPDATE addresses SET is_default = FALSE WHERE user_id = ?`, [userId]);
    await query(`UPDATE addresses SET is_default = TRUE WHERE id = ? AND user_id = ?`, [id, userId]);
    return this.findById(id, userId);
  }
}

module.exports = new AddressRepository();
