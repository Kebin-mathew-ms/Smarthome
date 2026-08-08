const express = require('express');
const router = express.Router();

const { authenticate, authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const upload = require('../middlewares/upload.middleware');

const adminDashboardController = require('../controllers/adminDashboard.controller');
const serviceCategoryController = require('../controllers/serviceCategory.controller');
const serviceSubcategoryController = require('../controllers/serviceSubcategory.controller');
const adminUserController = require('../controllers/adminUser.controller');
const auditLogController = require('../controllers/auditLog.controller');
const volunteerController = require('../controllers/volunteer.controller');
const adminServiceController = require('../controllers/adminService.controller');
const adminPackageController = require('../controllers/adminPackage.controller');

const { createCategoryValidation, updateCategoryValidation } = require('../validators/serviceCategory.validator');
const { createSubcategoryValidation, updateSubcategoryValidation } = require('../validators/subCategory.validator');
const { updateUserStatusValidation } = require('../validators/adminUser.validator');

// Protect all admin routes with authentication & Admin role check
router.use(authenticate, authorize('Admin'));

// -------------------------------------------------------------
// Admin Dashboard
// -------------------------------------------------------------
router.get('/dashboard', adminDashboardController.getDashboardStats);

// -------------------------------------------------------------
// Volunteer Management
// -------------------------------------------------------------
router.get('/volunteers', volunteerController.getVolunteers);
router.get('/volunteers/:id', volunteerController.getVolunteerById);
router.post(
  '/volunteers',
  upload.single('profile_photo'),
  volunteerController.createVolunteer
);
router.put(
  '/volunteers/:id',
  upload.single('profile_photo'),
  volunteerController.updateVolunteer
);
router.patch('/volunteers/status', volunteerController.updateVolunteerStatus);
router.delete('/volunteers/:id', volunteerController.deleteVolunteer);

// -------------------------------------------------------------
// Service Catalog Management
// -------------------------------------------------------------
router.get('/services', adminServiceController.getServices);
router.get('/services/:id', adminServiceController.getServiceById);
router.post(
  '/services',
  upload.single('thumbnail'),
  adminServiceController.createService
);
router.put(
  '/services/:id',
  upload.single('thumbnail'),
  adminServiceController.updateService
);
router.patch('/services/status', adminServiceController.updateServiceStatus);
router.delete('/services/:id', adminServiceController.deleteService);

// -------------------------------------------------------------
// Package Management
// -------------------------------------------------------------
router.get('/packages', adminPackageController.getPackages);
router.get('/services/:serviceId/packages', adminPackageController.getPackagesByServiceId);
router.post('/packages', adminPackageController.createPackage);
router.put('/packages/:id', adminPackageController.updatePackage);
router.delete('/packages/:id', adminPackageController.deletePackage);

// -------------------------------------------------------------
// Service Category Management
// -------------------------------------------------------------
router.get('/categories', serviceCategoryController.getCategories);
router.post(
  '/categories',
  upload.single('icon'),
  createCategoryValidation,
  validate,
  serviceCategoryController.createCategory
);
router.put(
  '/categories/:id',
  upload.single('icon'),
  updateCategoryValidation,
  validate,
  serviceCategoryController.updateCategory
);
router.delete('/categories/:id', serviceCategoryController.deleteCategory);

// -------------------------------------------------------------
// Service Subcategory Management
// -------------------------------------------------------------
router.get('/subcategories', serviceSubcategoryController.getSubcategories);
router.get('/subcategories/:id', serviceSubcategoryController.getSubcategoryById);
router.post(
  '/subcategories',
  upload.single('icon'),
  createSubcategoryValidation,
  validate,
  serviceSubcategoryController.createSubcategory
);
router.put(
  '/subcategories/:id',
  upload.single('icon'),
  updateSubcategoryValidation,
  validate,
  serviceSubcategoryController.updateSubcategory
);
router.delete('/subcategories/:id', serviceSubcategoryController.deleteSubcategory);

// -------------------------------------------------------------
// User Management
// -------------------------------------------------------------
router.get('/users', adminUserController.getUsers);
router.get('/users/:id', adminUserController.getUserById);
router.patch('/users/status', updateUserStatusValidation, validate, adminUserController.updateUserStatus);

// -------------------------------------------------------------
// Audit Logs
// -------------------------------------------------------------
router.get('/audit-logs', auditLogController.getAuditLogs);

module.exports = router;
