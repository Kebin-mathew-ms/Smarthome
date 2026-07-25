const { validationResult } = require('express-validator');
const { sendError } = require('../utils/response.util');
const HTTP_STATUS = require('../utils/httpStatus.util');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => `${err.path}: ${err.msg}`);
    return sendError(res, 'Validation failed', formattedErrors, HTTP_STATUS.BAD_REQUEST);
  }
  next();
};

module.exports = validate;
