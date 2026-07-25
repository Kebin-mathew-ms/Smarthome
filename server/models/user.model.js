class User {
  constructor({ id, first_name, last_name, email, phone, role, status, created_at, updated_at }) {
    this.id = id;
    this.first_name = first_name;
    this.last_name = last_name;
    this.email = email;
    this.phone = phone;
    this.role = role || 'User';
    this.status = status || 'active';
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  static toResponse(user) {
    if (!user) return null;
    const { password, deleted_at, ...userWithoutSecrets } = user;
    return userWithoutSecrets;
  }
}

module.exports = User;
