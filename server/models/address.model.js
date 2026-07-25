class Address {
  constructor({ id, user_id, label, contact_person, phone, house_name, street, landmark, city, district, state, postal_code, latitude, longitude, is_default, created_at, updated_at }) {
    this.id = id;
    this.user_id = user_id;
    this.label = label || 'Home';
    this.contact_person = contact_person;
    this.phone = phone;
    this.house_name = house_name;
    this.street = street;
    this.landmark = landmark || null;
    this.city = city;
    this.district = district || null;
    this.state = state;
    this.postal_code = postal_code;
    this.latitude = latitude ? Number(latitude) : null;
    this.longitude = longitude ? Number(longitude) : null;
    this.is_default = Boolean(is_default);
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}

module.exports = Address;
