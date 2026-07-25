const { body } = require('express-validator');

const createSubcategoryValidation = [
  body('category_id')
    .notEmpty()
    .withMessage('Category ID is required')
    .isInt()
    .withMessage('Category ID must be an integer'),
  body('subcategory_name')
    .trim()
    .notEmpty()
    .withMessage('Subcategory name is required')
    .isLength({ min: 2, max: 150 })
    .withMessage('Subcategory name must be between 2 and 150 characters'),
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

const updateSubcategoryValidation = [
  body('category_id')
    .notEmpty()
    .withMessage('Category ID is required')
    .isInt(),
  body('subcategory_name')
    .trim()
    .notEmpty()
    .withMessage('Subcategory name is required')
    .isLength({ min: 2, max: 150 }),
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
  createSubcategoryValidation,
  updateSubcategoryValidation
};
