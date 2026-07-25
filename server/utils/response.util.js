const HTTP_STATUS = require('./httpStatus.util');

const sendSuccess = (res, message = 'Success', data = {}, statusCode = HTTP_STATUS.OK) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

const sendError = (res, message = 'An error occurred', errors = [], statusCode = HTTP_STATUS.BAD_REQUEST) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors: Array.isArray(errors) ? errors : [errors]
  });
};

module.exports = {
  sendSuccess,
  sendError
};
