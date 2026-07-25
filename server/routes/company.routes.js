const express = require('express');
const router = express.Router();
const companyController = require('../controllers/company.controller');
const { createCompanyValidation, updateCompanyValidation } = require('../validators/company.validator');
const validate = require('../middlewares/validate.middleware');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

router.use(authenticate);

router.get('/', companyController.getCompanies);
router.get('/:id', companyController.getCompanyById);

router.post(
  '/',
  authorize('Admin'),
  upload.single('logo'),
  createCompanyValidation,
  validate,
  companyController.createCompany
);

router.put(
  '/:id',
  authorize('Admin', 'Company'),
  upload.single('logo'),
  updateCompanyValidation,
  validate,
  companyController.updateCompany
);

router.delete(
  '/:id',
  authorize('Admin'),
  companyController.deleteCompany
);

module.exports = router;
