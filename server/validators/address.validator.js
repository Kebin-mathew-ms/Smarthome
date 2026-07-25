const { body } = require('express-validator');

const createAddressValidation = [
  body('contact_person').trim().notEmpty().withMessage('Contact person name is required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('house_name').trim().notEmpty().withMessage('House / Flat / Building name is required'),
  body('street').trim().notEmpty().withMessage('Street / Area is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('state').trim().notEmpty().withMessage('State is required'),
  body('postal_code').trim().notEmpty().withMessage('Postal code is required')
];

module.exports = {
  createAddressValidation
};
