const express = require('express');
const router = express.Router();

const { authenticate, authorize } = require('../middlewares/auth.middleware');
const requireCompanyContext = require('../middlewares/companyContext.middleware');
const validate = require('../middlewares/validate.middleware');
const upload = require('../middlewares/upload.middleware');

const companyDashboardController = require('../controllers/companyDashboard.controller');
const companyProfileController = require('../controllers/companyProfile.controller');
const companyServiceController = require('../controllers/companyService.controller');
const companyPackageController = require('../controllers/companyPackage.controller');
const companyEmployeeController = require('../controllers/companyEmployee.controller');
const companyGalleryController = require('../controllers/companyGallery.controller');

const { createServiceValidation, updateServiceValidation } = require('../validators/service.validator');
const { createEmployeeValidation, updateEmployeeValidation } = require('../validators/employee.validator');

// Protect all company portal routes with auth + Company role guard + company context lookup
router.use(authenticate, authorize('Company'), requireCompanyContext);

// -------------------------------------------------------------
// Company Dashboard
// -------------------------------------------------------------
router.get('/dashboard', companyDashboardController.getDashboardStats);

// -------------------------------------------------------------
// Company Profile
// -------------------------------------------------------------
router.get('/profile', companyProfileController.getProfile);
router.put(
  '/profile',
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'cover_image', maxCount: 1 }
  ]),
  companyProfileController.updateProfile
);

// -------------------------------------------------------------
// Service Management
// -------------------------------------------------------------
router.get('/services', companyServiceController.getServices);
router.get('/services/:id', companyServiceController.getServiceById);
router.post(
  '/services',
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'gallery', maxCount: 10 }
  ]),
  createServiceValidation,
  validate,
  companyServiceController.createService
);
router.put(
  '/services/:id',
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'gallery', maxCount: 10 }
  ]),
  updateServiceValidation,
  validate,
  companyServiceController.updateService
);
router.patch('/services/status', companyServiceController.updateServiceStatus);
router.post('/services/:id/duplicate', companyServiceController.duplicateService);
router.delete('/services/:id', companyServiceController.deleteService);

// -------------------------------------------------------------
// Service Packages
// -------------------------------------------------------------
router.get('/packages', companyPackageController.getPackages);
router.post('/packages', companyPackageController.createPackage);
router.put('/packages/:id', companyPackageController.updatePackage);
router.delete('/packages/:id', companyPackageController.deletePackage);

// -------------------------------------------------------------
// Employee Management
// -------------------------------------------------------------
router.get('/employees', companyEmployeeController.getEmployees);
router.get('/employees/:id', companyEmployeeController.getEmployeeById);
router.post(
  '/employees',
  upload.single('profile_photo'),
  createEmployeeValidation,
  validate,
  companyEmployeeController.createEmployee
);
router.put(
  '/employees/:id',
  upload.single('profile_photo'),
  updateEmployeeValidation,
  validate,
  companyEmployeeController.updateEmployee
);
router.patch('/employees/status', companyEmployeeController.updateEmployeeStatus);
router.delete('/employees/:id', companyEmployeeController.deleteEmployee);

// -------------------------------------------------------------
// Gallery Portfolio
// -------------------------------------------------------------
router.get('/gallery', companyGalleryController.getGallery);
router.post('/gallery', upload.single('gallery_image'), companyGalleryController.addImage);
router.delete('/gallery/:id', companyGalleryController.deleteImage);

module.exports = router;
