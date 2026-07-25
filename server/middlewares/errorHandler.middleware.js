const logger = require('../config/logger');
const HTTP_STATUS = require('../utils/httpStatus.util');
const { sendError } = require('../utils/response.util');

const errorHandler = (err, req, res, next) => {
  logger.error(`Error ${err.status || HTTP_STATUS.INTERNAL_SERVER_ERROR}: ${err.message} - Stack: ${err.stack}`);

  const statusCode = err.statusCode || err.status || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = err.message || 'Internal Server Error';
  const errors = err.errors || [message];

  return sendError(res, message, errors, statusCode);
};

module.exports = errorHandler;
