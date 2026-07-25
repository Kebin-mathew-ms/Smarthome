const { body } = require('express-validator');

const createEmployeeValidation = [
  body('employee_name')
    .trim()
    .notEmpty()
    .withMessage('Employee name is required')
    .isLength({ min: 2, max: 150 }),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Invalid phone number format'),
  body('designation')
    .trim()
    .notEmpty()
    .withMessage('Designation is required')
];

const updateEmployeeValidation = [
  body('employee_name').trim().notEmpty(),
  body('email').trim().notEmpty().isEmail(),
  body('phone').trim().notEmpty(),
  body('designation').trim().notEmpty()
];

module.exports = {
  createEmployeeValidation,
  updateEmployeeValidation
};
