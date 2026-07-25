const jwt = require('jsonwebtoken');

const generateToken = (payload) => {
  const secret = process.env.JWT_SECRET || 'default_jwt_secret_key_change';
  const expiresIn = process.env.JWT_EXPIRE || '7d';
  return jwt.sign(payload, secret, { expiresIn });
};

const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET || 'default_jwt_secret_key_change';
  return jwt.verify(token, secret);
};

module.exports = {
  generateToken,
  verifyToken
};
