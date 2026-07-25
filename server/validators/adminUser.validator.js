const { body } = require('express-validator');

const updateUserStatusValidation = [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isInt()
    .withMessage('User ID must be an integer'),
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['active', 'inactive', 'suspended'])
    .withMessage('Invalid status. Allowed: active, inactive, suspended')
];

module.exports = {
  updateUserStatusValidation
};
