const userRepository = require('../repositories/user.repository');
const User = require('../models/user.model');

class UserService {
  async getAllUsers(query) {
    const result = await userRepository.findAll(query);
    return {
      ...result,
      items: result.items.map(User.toResponse)
    };
  }

  async getUserById(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }
    return {
      ...User.toResponse(user),
      bookingCount: 0 // Placeholder for future bookings module
    };
  }

  async updateUserStatus(id, status) {
    const user = await userRepository.findById(id);
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    const updated = await userRepository.updateStatus(id, status);
    return User.toResponse(updated);
  }

  async deleteUser(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }
    return await userRepository.softDelete(id);
  }
}

module.exports = new UserService();
