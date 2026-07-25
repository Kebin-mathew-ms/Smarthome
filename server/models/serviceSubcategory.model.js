class ServiceSubcategory {
  constructor({ id, category_id, subcategory_name, icon, description, status, created_at, updated_at }) {
    this.id = id;
    this.category_id = category_id;
    this.subcategory_name = subcategory_name;
    this.icon = icon;
    this.description = description;
    this.status = status || 'active';
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  static toResponse(sub) {
    if (!sub) return null;
    const { deleted_at, ...clean } = sub;
    return clean;
  }
}

module.exports = ServiceSubcategory;
