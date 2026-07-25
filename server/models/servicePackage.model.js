class ServicePackage {
  constructor({ id, service_id, service_name, package_name, package_description, price, estimated_duration, status, created_at, updated_at }) {
    this.id = id;
    this.service_id = service_id;
    this.service_name = service_name || null;
    this.package_name = package_name;
    this.package_description = package_description;
    this.price = Number(price);
    this.estimated_duration = estimated_duration;
    this.status = status || 'active';
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  static toResponse(pkg) {
    if (!pkg) return null;
    const { deleted_at, ...clean } = pkg;
    return clean;
  }
}

module.exports = ServicePackage;
