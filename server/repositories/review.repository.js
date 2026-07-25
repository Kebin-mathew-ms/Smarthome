const { query } = require('../config/db');

class ReviewRepository {
  async findByBookingId(bookingId) {
    const sql = `SELECT * FROM reviews WHERE booking_id = ? LIMIT 1`;
    const rows = await query(sql, [bookingId]);
    return rows[0] || null;
  }

  async createReview({ booking_id, company_id, service_id, user_id, employee_id = null, rating, review_title, review_description, recommend = true }) {
    const sql = `
      INSERT INTO reviews (booking_id, company_id, service_id, user_id, employee_id, rating, review_title, review_description, recommend)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await query(sql, [booking_id, company_id, service_id, user_id, employee_id || null, rating, review_title, review_description, recommend]);
    const reviewId = result.insertId;

    // Recalculate company summary rating automatically
    await this.recalculateCompanyRating(company_id);

    return reviewId;
  }

  async addMedia(reviewId, { media_type = 'image', file_path, thumbnail = null, caption = null }) {
    const sql = `INSERT INTO review_media (review_id, media_type, file_path, thumbnail, caption) VALUES (?, ?, ?, ?, ?)`;
    return await query(sql, [reviewId, media_type, file_path, thumbnail, caption]);
  }

  async addReply(reviewId, companyId, replyText) {
    const sql = `
      INSERT INTO review_replies (review_id, company_id, reply)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE reply = ?, created_at = CURRENT_TIMESTAMP
    `;
    return await query(sql, [reviewId, companyId, replyText, replyText]);
  }

  async recalculateCompanyRating(companyId) {
    const sql = `
      SELECT COUNT(*) as total, AVG(rating) as avg_rating
      FROM reviews
      WHERE company_id = ?
    `;
    const rows = await query(sql, [companyId]);
    const total = rows[0].total || 0;
    const avgRating = rows[0].avg_rating ? Number(Number(rows[0].avg_rating).toFixed(2)) : 5.00;

    const upsertSql = `
      INSERT INTO company_reviews_summary (company_id, average_rating, total_reviews)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE average_rating = ?, total_reviews = ?
    `;
    await query(upsertSql, [companyId, avgRating, total, avgRating, total]);
  }

  async findReviewsByCompanyId(companyId, { page = 1, limit = 10 }) {
    const offset = (page - 1) * limit;
    const sql = `
      SELECT r.*, u.full_name as user_name, s.service_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN services s ON r.service_id = s.id
      WHERE r.company_id = ?
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const rows = await query(sql, [companyId, Number(limit), Number(offset)]);

    const reviews = [];
    for (const r of rows) {
      const media = await query(`SELECT * FROM review_media WHERE review_id = ?`, [r.id]);
      const replies = await query(`SELECT * FROM review_replies WHERE review_id = ? LIMIT 1`, [r.id]);
      reviews.push({
        ...r,
        media,
        reply: replies[0] ? replies[0].reply : null
      });
    }

    return reviews;
  }

  async findReviewsByUserId(userId) {
    const sql = `
      SELECT r.*, c.company_name, s.service_name
      FROM reviews r
      JOIN companies c ON r.company_id = c.id
      JOIN services s ON r.service_id = s.id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
    `;
    return await query(sql, [userId]);
  }
}

module.exports = new ReviewRepository();
