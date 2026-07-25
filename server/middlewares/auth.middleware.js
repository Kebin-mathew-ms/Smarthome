const { verifyToken } = require('../utils/jwt.util');
const { sendError } = require('../utils/response.util');
const HTTP_STATUS = require('../utils/httpStatus.util');
const userRepository = require('../repositories/user.repository');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Authentication required. No token provided.', ['Missing or invalid Authorization header'], HTTP_STATUS.UNAUTHORIZED);
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return sendError(res, 'Invalid or expired token.', [err.message], HTTP_STATUS.UNAUTHORIZED);
    }

    const user = await userRepository.findById(decoded.id);
    if (!user) {
      return sendError(res, 'User account no longer exists.', ['User not found'], HTTP_STATUS.UNAUTHORIZED);
    }

    if (user.status !== 'active') {
      return sendError(res, 'User account is inactive or suspended.', ['Account not active'], HTTP_STATUS.FORBIDDEN);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Unauthorized access.', ['User context missing'], HTTP_STATUS.UNAUTHORIZED);
    }

    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        `Access forbidden. Role '${req.user.role}' is not authorized to perform this action. Required: ${roles.join(', ')}`,
        ['Forbidden resource access'],
        HTTP_STATUS.FORBIDDEN
      );
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize
};
