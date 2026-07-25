class Service {
  constructor({ id, company_id, category_id, subcategory_id, category_name, subcategory_name, service_name, short_description, full_description, starting_price, estimated_duration, service_type, thumbnail, status, created_at, updated_at, images = [], features = [], packages = [] }) {
    this.id = id;
    this.company_id = company_id;
    this.category_id = category_id;
    this.subcategory_id = subcategory_id;
    this.category_name = category_name || null;
    this.subcategory_name = subcategory_name || null;
    this.service_name = service_name;
    this.short_description = short_description;
    this.full_description = full_description;
    this.starting_price = Number(starting_price);
    this.estimated_duration = estimated_duration;
    this.service_type = service_type || 'on_site';
    this.thumbnail = thumbnail;
    this.status = status || 'active';
    this.created_at = created_at;
    this.updated_at = updated_at;
    this.images = images;
    this.features = features;
    this.packages = packages;
  }

  static toResponse(service) {
    if (!service) return null;
    const { deleted_at, ...clean } = service;
    return clean;
  }
}

module.exports = Service;
