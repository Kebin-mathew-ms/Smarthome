const { body } = require('express-validator');

const createCategoryValidation = [
  body('category_name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Category name must be between 2 and 100 characters'),
  body('icon')
    .optional()
    .trim(),
  body('description')
    .optional()
    .trim(),
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Invalid status')
];

const updateCategoryValidation = [
  body('category_name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ min: 2, max: 100 }),
  body('icon')
    .optional()
    .trim(),
  body('description')
    .optional()
    .trim(),
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Invalid status')
];

module.exports = {
  createCategoryValidation,
  updateCategoryValidation
};
