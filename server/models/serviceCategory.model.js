class ServiceCategory {
  constructor({ id, category_name, icon, description, status, created_at, updated_at }) {
    this.id = id;
    this.category_name = category_name;
    this.icon = icon;
    this.description = description;
    this.status = status || 'active';
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  static toResponse(category) {
    if (!category) return null;
    const { deleted_at, ...categoryData } = category;
    return categoryData;
  }
}

module.exports = ServiceCategory;
