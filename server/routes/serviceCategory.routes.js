const express = require('express');
const router = express.Router();
const serviceCategoryController = require('../controllers/serviceCategory.controller');
const { createCategoryValidation, updateCategoryValidation } = require('../validators/serviceCategory.validator');
const validate = require('../middlewares/validate.middleware');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

router.use(authenticate);

router.get('/', serviceCategoryController.getCategories);
router.get('/:id', serviceCategoryController.getCategoryById);

router.post(
  '/',
  authorize('Admin'),
  upload.single('icon'),
  createCategoryValidation,
  validate,
  serviceCategoryController.createCategory
);

router.put(
  '/:id',
  authorize('Admin'),
  upload.single('icon'),
  updateCategoryValidation,
  validate,
  serviceCategoryController.updateCategory
);

router.delete(
  '/:id',
  authorize('Admin'),
  serviceCategoryController.deleteCategory
);

module.exports = router;
