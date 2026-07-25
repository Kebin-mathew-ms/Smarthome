const { body } = require('express-validator');

const createCompanyValidation = [
  body('company_name')
    .trim()
    .notEmpty()
    .withMessage('Company name is required')
    .isLength({ min: 2, max: 150 })
    .withMessage('Company name must be between 2 and 150 characters'),
  body('company_email')
    .trim()
    .notEmpty()
    .withMessage('Company email is required')
    .isEmail()
    .withMessage('Invalid company email format')
    .normalizeEmail(),
  body('company_phone')
    .trim()
    .notEmpty()
    .withMessage('Company phone is required')
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Invalid phone number format'),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required'),
  body('city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  body('postal_code')
    .trim()
    .notEmpty()
    .withMessage('Postal code is required'),
  body('status')
    .optional()
    .isIn(['active', 'pending', 'inactive'])
    .withMessage('Invalid status')
];

const updateCompanyValidation = [
  body('company_name')
    .trim()
    .notEmpty()
    .withMessage('Company name is required'),
  body('company_email')
    .trim()
    .notEmpty()
    .isEmail()
    .withMessage('Invalid company email format'),
  body('company_phone')
    .trim()
    .notEmpty()
    .withMessage('Company phone is required'),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required'),
  body('city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  body('postal_code')
    .trim()
    .notEmpty()
    .withMessage('Postal code is required'),
  body('status')
    .optional()
    .isIn(['active', 'pending', 'inactive'])
    .withMessage('Invalid status')
];

module.exports = {
  createCompanyValidation,
  updateCompanyValidation
};
