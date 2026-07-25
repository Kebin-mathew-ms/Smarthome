const userRepository = require('../repositories/user.repository');
const { hashPassword, comparePassword } = require('../utils/password.util');
const { generateToken } = require('../utils/jwt.util');
const User = require('../models/user.model');

class AuthService {
  async register(userData) {
    const existingUser = await userRepository.findByEmail(userData.email);
    if (existingUser) {
      const error = new Error('Email address is already registered.');
      error.statusCode = 409;
      throw error;
    }

    const hashedPassword = await hashPassword(userData.password);
    const newUser = await userRepository.create({
      ...userData,
      password: hashedPassword
    });

    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role
    });

    return {
      user: User.toResponse(newUser),
      token
    };
  }

  async login(email, password) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    if (user.status !== 'active') {
      const error = new Error('Your account is currently inactive or suspended. Please contact support.');
      error.statusCode = 403;
      throw error;
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    return {
      user: User.toResponse(user),
      token
    };
  }

  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error('User profile not found.');
      error.statusCode = 404;
      throw error;
    }
    return User.toResponse(user);
  }

  async updateProfile(userId, updateData) {
    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error('User profile not found.');
      error.statusCode = 404;
      throw error;
    }

    const updatedUser = await userRepository.update(userId, updateData);
    return User.toResponse(updatedUser);
  }
}

module.exports = new AuthService();
