const express = require('express');
const router = express.Router();

const { authenticate, authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');

const customizationController = require('../controllers/customization.controller');

// Public/Customer Endpoint: Fetch resolved customizations for a service
router.get('/services/:serviceId/customizations', customizationController.getServiceCustomizations);

// Admin-Only endpoints: Service Customization Group CRUD
router.post(
  '/admin/services/:serviceId/customizations/groups',
  authenticate,
  authorize('Admin'),
  customizationController.createGroup
);

router.put(
  '/admin/services/customizations/groups/:groupId',
  authenticate,
  authorize('Admin'),
  customizationController.updateGroup
);

router.delete(
  '/admin/services/customizations/groups/:groupId',
  authenticate,
  authorize('Admin'),
  customizationController.deleteGroup
);

// Admin-Only endpoints: Option CRUD
router.post(
  '/admin/services/customizations/options',
  authenticate,
  authorize('Admin'),
  customizationController.createOption
);

router.put(
  '/admin/services/customizations/options/:optionId',
  authenticate,
  authorize('Admin'),
  customizationController.updateOption
);

router.delete(
  '/admin/services/customizations/options/:optionId',
  authenticate,
  authorize('Admin'),
  customizationController.deleteOption
);

// Admin-Only endpoints: Package Specific Overrides
router.get(
  '/admin/packages/:packageId/customizations',
  authenticate,
  authorize('Admin'),
  customizationController.getPackageOverrides
);

router.post(
  '/admin/packages/customizations',
  authenticate,
  authorize('Admin'),
  customizationController.savePackageConfig
);

router.delete(
  '/admin/packages/:packageId/customizations/:optionId',
  authenticate,
  authorize('Admin'),
  customizationController.deletePackageConfig
);

module.exports = router;
