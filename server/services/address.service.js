const addressRepository = require('../repositories/address.repository');
const Address = require('../models/address.model');

class AddressService {
  async getAddresses(userId) {
    const list = await addressRepository.findByUserId(userId);
    return list.map(a => new Address(a));
  }

  async getAddressById(id, userId) {
    const addr = await addressRepository.findById(id, userId);
    if (!addr) {
      const error = new Error('Address not found or unauthorized access.');
      error.statusCode = 404;
      throw error;
    }
    return new Address(addr);
  }

  async createAddress(userId, data) {
    const id = await addressRepository.create({
      user_id: userId,
      label: data.label || 'Home',
      contact_person: data.contact_person,
      phone: data.phone,
      house_name: data.house_name,
      street: data.street,
      landmark: data.landmark || null,
      city: data.city,
      district: data.district || null,
      state: data.state,
      postal_code: data.postal_code,
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      is_default: Boolean(data.is_default)
    });
    return await this.getAddressById(id, userId);
  }

  async updateAddress(id, userId, data) {
    await this.getAddressById(id, userId);
    const updated = await addressRepository.update(id, userId, data);
    return new Address(updated);
  }

  async deleteAddress(id, userId) {
    await this.getAddressById(id, userId);
    return await addressRepository.delete(id, userId);
  }

  async setDefaultAddress(id, userId) {
    await this.getAddressById(id, userId);
    const updated = await addressRepository.setDefault(id, userId);
    return new Address(updated);
  }
}

module.exports = new AddressService();
