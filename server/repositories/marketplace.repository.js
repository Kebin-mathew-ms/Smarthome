const { query } = require('../config/db');

class MarketplaceRepository {
  async findAllCompanies({ page = 1, limit = 10, search, category_id, subcategory_id, rating, city, district, verified, emergency, openNow, sort = 'newest' }) {
    const offset = (page - 1) * limit;
    const params = [];
    let whereClause = 'WHERE c.deleted_at IS NULL AND c.status = "active"';

    if (search) {
      whereClause += ' AND (c.company_name LIKE ? OR c.description LIKE ? OR c.city LIKE ? OR c.district LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }
    if (city) {
      whereClause += ' AND c.city LIKE ?';
      params.push(`%${city}%`);
    }
    if (district) {
      whereClause += ' AND c.district LIKE ?';
      params.push(`%${district}%`);
    }
    if (emergency) {
      whereClause += ' AND cs.emergency_service = 1';
    }

    // Sorting Clause
    let orderClause = 'ORDER BY c.created_at DESC';
    if (sort === 'oldest') orderClause = 'ORDER BY c.created_at ASC';
    else if (sort === 'alphabetical') orderClause = 'ORDER BY c.company_name ASC';
    else if (sort === 'rating') orderClause = 'ORDER BY cr.average_rating DESC, c.created_at DESC';

    const countSql = `
      SELECT COUNT(DISTINCT c.id) as total
      FROM companies c
      LEFT JOIN company_settings cs ON c.id = cs.company_id
      LEFT JOIN company_reviews_summary cr ON c.id = cr.company_id
      ${whereClause}
    `;
    const countRows = await query(countSql, params);
    const total = countRows[0].total;

    const dataSql = `
      SELECT c.*, cs.working_hours, cs.working_days, cs.service_radius, cs.minimum_booking_amount, cs.emergency_service, cs.website,
             COALESCE(cr.average_rating, 5.00) as average_rating, COALESCE(cr.total_reviews, 0) as total_reviews,
             MIN(s.starting_price) as starting_price
      FROM companies c
      LEFT JOIN company_settings cs ON c.id = cs.company_id
      LEFT JOIN company_reviews_summary cr ON c.id = cr.company_id
      LEFT JOIN services s ON c.id = s.company_id AND s.deleted_at IS NULL AND s.status = 'active'
      ${whereClause}
      GROUP BY c.id
      ${orderClause}
      LIMIT ? OFFSET ?
    `;
    params.push(Number(limit), Number(offset));
    const rows = await query(dataSql, params);

    return {
      items: rows,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit)
    };
  }

  async findCompanyById(companyId) {
    const sql = `
      SELECT c.*, cs.working_hours, cs.working_days, cs.service_radius, cs.minimum_booking_amount, cs.about_us, cs.mission, cs.vision, cs.emergency_service, cs.website, cs.google_maps_location, cs.social_media_json,
             COALESCE(cr.average_rating, 5.00) as average_rating, COALESCE(cr.total_reviews, 0) as total_reviews
      FROM companies c
      LEFT JOIN company_settings cs ON c.id = cs.company_id
      LEFT JOIN company_reviews_summary cr ON c.id = cr.company_id
      WHERE c.id = ? AND c.deleted_at IS NULL
      LIMIT 1
    `;
    const rows = await query(sql, [companyId]);
    if (!rows[0]) return null;

    const gallery = await query(`SELECT * FROM company_gallery WHERE company_id = ? ORDER BY display_order ASC`, [companyId]);
    const employees = await query(`SELECT id, employee_name, designation, profile_photo FROM company_employees WHERE company_id = ? AND status = 'active' AND deleted_at IS NULL`, [companyId]);

    return {
      ...rows[0],
      gallery,
      employees
    };
  }

  async findServicesByCompanyId(companyId) {
    const sql = `
      SELECT s.*, c.category_name, sub.subcategory_name
      FROM services s
      JOIN service_categories c ON s.category_id = c.id
      JOIN service_subcategories sub ON s.subcategory_id = sub.id
      WHERE s.company_id = ? AND s.deleted_at IS NULL AND s.status = 'active'
      ORDER BY s.created_at DESC
    `;
    return await query(sql, [companyId]);
  }

  async findServiceById(serviceId) {
    const sql = `
      SELECT s.*, c.category_name, sub.subcategory_name, comp.company_name, comp.company_email, comp.company_phone, comp.logo, comp.city, comp.state,
             COALESCE(cr.average_rating, 5.00) as company_rating, COALESCE(cr.total_reviews, 0) as company_reviews_count
      FROM services s
      JOIN service_categories c ON s.category_id = c.id
      JOIN service_subcategories sub ON s.subcategory_id = sub.id
      LEFT JOIN companies comp ON s.company_id = comp.id
      LEFT JOIN company_reviews_summary cr ON comp.id = cr.company_id
      WHERE s.id = ? AND s.deleted_at IS NULL
      LIMIT 1
    `;
    const rows = await query(sql, [serviceId]);
    if (!rows[0]) return null;

    const images = await query(`SELECT id, image_path, display_order FROM service_images WHERE service_id = ? ORDER BY display_order ASC`, [serviceId]);
    const features = await query(`SELECT id, feature_name FROM service_features WHERE service_id = ?`, [serviceId]);
    const packages = await query(`SELECT * FROM service_packages WHERE service_id = ? AND deleted_at IS NULL AND status = 'active' ORDER BY price ASC`, [serviceId]);
    const faqs = await query(`SELECT id, question, answer FROM service_faqs WHERE service_id = ? ORDER BY display_order ASC`, [serviceId]);
    const availability = await query(`SELECT * FROM service_availability WHERE service_id = ?`, [serviceId]);

    // Related services from same company
    const related = await query(
      `SELECT id, service_name, starting_price, thumbnail, estimated_duration FROM services WHERE company_id = ? AND id != ? AND deleted_at IS NULL AND status = 'active' LIMIT 4`,
      [rows[0].company_id, serviceId]
    );

    return {
      ...rows[0],
      images,
      features,
      packages,
      faqs,
      availability,
      relatedServices: related
    };
  }

  async findFeaturedCompanies(limit = 6) {
    const sql = `
      SELECT c.*, cs.working_hours, cs.emergency_service, COALESCE(cr.average_rating, 5.00) as average_rating, COALESCE(cr.total_reviews, 0) as total_reviews
      FROM companies c
      LEFT JOIN company_settings cs ON c.id = cs.company_id
      LEFT JOIN company_reviews_summary cr ON c.id = cr.company_id
      WHERE c.deleted_at IS NULL AND c.status = 'active'
      ORDER BY cr.average_rating DESC, c.created_at DESC
      LIMIT ?
    `;
    return await query(sql, [Number(limit)]);
  }

  async findPopularServices(limit = 6) {
    const sql = `
      SELECT s.*, c.category_name, comp.company_name, comp.logo, comp.city
      FROM services s
      JOIN service_categories c ON s.category_id = c.id
      LEFT JOIN companies comp ON s.company_id = comp.id
      WHERE s.deleted_at IS NULL AND s.status = 'active'
      ORDER BY s.created_at DESC
      LIMIT ?
    `;
    return await query(sql, [Number(limit)]);
  }

  async searchMarketplace(term, categoryId) {
    const params = [];
    let servicesSql = `
      SELECT s.id, s.service_name, s.starting_price, s.thumbnail, c.category_name
      FROM services s
      JOIN service_categories c ON s.category_id = c.id
      WHERE s.deleted_at IS NULL AND s.status = 'active'
    `;

    if (categoryId) {
      servicesSql += ' AND s.category_id = ?';
      params.push(Number(categoryId));
    }

    if (term) {
      servicesSql += ' AND (s.service_name LIKE ? OR s.short_description LIKE ?)';
      const searchTerm = `%${term}%`;
      params.push(searchTerm, searchTerm);
    }

    servicesSql += ' LIMIT 50';

    const services = await query(servicesSql, params);

    // Categories (for textual search query)
    let categories = [];
    if (term) {
      const searchTerm = `%${term}%`;
      categories = await query(
        `SELECT id, category_name, icon FROM service_categories WHERE category_name LIKE ? AND deleted_at IS NULL LIMIT 5`,
        [searchTerm]
      );
    }

    return {
      companies: [], // Company layer removed completely
      categories,
      services
    };
  }
}

module.exports = new MarketplaceRepository();
