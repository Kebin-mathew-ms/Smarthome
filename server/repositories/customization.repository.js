const { query } = require('../config/db');

class CustomizationRepository {
  async getCustomizations(serviceId, packageId = null) {
    // 1. Fetch groups
    const groupsSql = `
      SELECT * FROM customization_groups 
      WHERE service_id = ? AND is_active = TRUE
      ORDER BY display_order ASC, id ASC
    `;
    const groups = await query(groupsSql, [serviceId]);
    if (groups.length === 0) return [];

    // 2. Fetch options
    const groupIds = groups.map(g => g.id);
    const optionsSql = `
      SELECT * FROM customization_options 
      WHERE group_id IN (${groupIds.map(() => '?').join(', ')}) AND is_active = TRUE
      ORDER BY display_order ASC, id ASC
    `;
    const options = await query(optionsSql, groupIds);

    // 3. Fetch overrides if packageId is provided
    let overrides = [];
    if (packageId) {
      const overridesSql = `
        SELECT * FROM package_option_configs 
        WHERE package_id = ? AND is_active = TRUE
      `;
      overrides = await query(overridesSql, [packageId]);
    }

    // 4. Map options to groups and apply overrides
    const optionsMap = {};
    for (const opt of options) {
      const override = overrides.find(o => o.option_id === opt.id);
      const price = override ? Number(override.additional_price) : Number(opt.price);
      const is_included = override ? Boolean(override.is_included) : false;
      const is_active = override ? Boolean(override.is_active) : Boolean(opt.is_active);

      if (is_active) {
        if (!optionsMap[opt.group_id]) {
          optionsMap[opt.group_id] = [];
        }
        optionsMap[opt.group_id].push({
          id: opt.id,
          group_id: opt.group_id,
          option_name: opt.option_name,
          description: opt.description,
          price,
          is_included,
          min_quantity: opt.min_quantity,
          max_quantity: opt.max_quantity,
          display_order: opt.display_order,
          is_active
        });
      }
    }

    // Attach options to groups
    return groups.map(g => ({
      ...g,
      options: optionsMap[g.id] || []
    })).filter(g => g.options.length > 0);
  }

  // Admin Group CRUD
  async findGroupById(id) {
    const rows = await query('SELECT * FROM customization_groups WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  }

  async createGroup({ service_id, group_name, group_description = null, selection_type = 'single', display_order = 0, is_active = true }) {
    const sql = `
      INSERT INTO customization_groups (service_id, group_name, group_description, selection_type, display_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const result = await query(sql, [service_id, group_name, group_description, selection_type, display_order, is_active]);
    return this.findGroupById(result.insertId);
  }

  async updateGroup(id, { group_name, group_description, selection_type, display_order, is_active }) {
    const sql = `
      UPDATE customization_groups
      SET group_name = ?, group_description = ?, selection_type = ?, display_order = ?, is_active = ?
      WHERE id = ?
    `;
    await query(sql, [group_name, group_description, selection_type, display_order, is_active, id]);
    return this.findGroupById(id);
  }

  async deleteGroup(id) {
    const result = await query('DELETE FROM customization_groups WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  // Admin Option CRUD
  async findOptionById(id) {
    const rows = await query('SELECT * FROM customization_options WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  }

  async createOption({ group_id, option_name, description = null, price = 0.00, min_quantity = 0, max_quantity = null, display_order = 0, is_active = true }) {
    const sql = `
      INSERT INTO customization_options (group_id, option_name, description, price, min_quantity, max_quantity, display_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await query(sql, [group_id, option_name, description, price, min_quantity, max_quantity, display_order, is_active]);
    return this.findOptionById(result.insertId);
  }

  async updateOption(id, { option_name, description, price, min_quantity, max_quantity, display_order, is_active }) {
    const sql = `
      UPDATE customization_options
      SET option_name = ?, description = ?, price = ?, min_quantity = ?, max_quantity = ?, display_order = ?, is_active = ?
      WHERE id = ?
    `;
    await query(sql, [option_name, description, price, min_quantity, max_quantity, display_order, is_active, id]);
    return this.findOptionById(id);
  }

  async deleteOption(id) {
    const result = await query('DELETE FROM customization_options WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  // Admin Package Config Overrides
  async getPackageOverrides(packageId) {
    const sql = `
      SELECT o.*, opt.option_name, opt.group_id, g.group_name 
      FROM package_option_configs o
      JOIN customization_options opt ON o.option_id = opt.id
      JOIN customization_groups g ON opt.group_id = g.id
      WHERE o.package_id = ?
    `;
    return await query(sql, [packageId]);
  }

  async savePackageConfig({ package_id, option_id, is_included = false, additional_price = 0.00, is_active = true }) {
    const sql = `
      INSERT INTO package_option_configs (package_id, option_id, is_included, additional_price, is_active)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        is_included = VALUES(is_included),
        additional_price = VALUES(additional_price),
        is_active = VALUES(is_active)
    `;
    await query(sql, [package_id, option_id, is_included, additional_price, is_active]);
    const rows = await query('SELECT * FROM package_option_configs WHERE package_id = ? AND option_id = ? LIMIT 1', [package_id, option_id]);
    return rows[0] || null;
  }

  async deletePackageConfig(packageId, optionId) {
    const result = await query('DELETE FROM package_option_configs WHERE package_id = ? AND option_id = ?', [packageId, optionId]);
    return result.affectedRows > 0;
  }
}

module.exports = new CustomizationRepository();
