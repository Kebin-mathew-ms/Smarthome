const express = require('express');
const router = express.Router();

const { authenticate, authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const upload = require('../middlewares/upload.middleware');

const adminDashboardController = require('../controllers/adminDashboard.controller');
const adminCompanyController = require('../controllers/adminCompany.controller');
const serviceCategoryController = require('../controllers/serviceCategory.controller');
const serviceSubcategoryController = require('../controllers/serviceSubcategory.controller');
const adminUserController = require('../controllers/adminUser.controller');
const auditLogController = require('../controllers/auditLog.controller');

const { createCompanyValidation, updateCompanyValidation } = require('../validators/company.validator');
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
// Company Management
// -------------------------------------------------------------
router.get('/companies', adminCompanyController.getCompanies);
router.get('/companies/:id', adminCompanyController.getCompanyById);
router.post(
  '/companies',
  upload.single('logo'),
  createCompanyValidation,
  validate,
  adminCompanyController.createCompany
);
router.put(
  '/companies/:id',
  upload.single('logo'),
  updateCompanyValidation,
  validate,
  adminCompanyController.updateCompany
);
router.patch('/companies/status', adminCompanyController.updateCompanyStatus);
router.patch('/companies/reset-password', adminCompanyController.resetCompanyPassword);
router.delete('/companies/:id', adminCompanyController.deleteCompany);

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
