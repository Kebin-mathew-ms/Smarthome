const { body } = require('express-validator');

const createBookingValidation = [
  body('company_id').notEmpty().isInt().withMessage('Company is required'),
  body('service_id').notEmpty().isInt().withMessage('Service is required'),
  body('address_id').notEmpty().isInt().withMessage('Address is required'),
  body('scheduled_date').notEmpty().isISO8601().withMessage('Valid scheduled date is required'),
  body('scheduled_time').notEmpty().withMessage('Scheduled time slot is required')
];

module.exports = {
  createBookingValidation
};
