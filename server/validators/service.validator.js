const { body } = require('express-validator');

const createServiceValidation = [
  body('category_id')
    .notEmpty()
    .withMessage('Category is required')
    .isInt(),
  body('subcategory_id')
    .notEmpty()
    .withMessage('Subcategory is required')
    .isInt(),
  body('service_name')
    .trim()
    .notEmpty()
    .withMessage('Service name is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Service name must be between 2 and 200 characters'),
  body('starting_price')
    .notEmpty()
    .withMessage('Starting price is required')
    .isFloat({ min: 0.01 })
    .withMessage('Starting price must be greater than zero'),
  body('estimated_duration')
    .optional()
    .trim(),
  body('service_type')
    .optional()
    .isIn(['on_site', 'remote', 'consultation'])
    .withMessage('Invalid service type')
];

const updateServiceValidation = [
  body('category_id').notEmpty().isInt(),
  body('subcategory_id').notEmpty().isInt(),
  body('service_name').trim().notEmpty(),
  body('starting_price').notEmpty().isFloat({ min: 0.01 }),
  body('service_type').optional().isIn(['on_site', 'remote', 'consultation'])
];

module.exports = {
  createServiceValidation,
  updateServiceValidation
};
