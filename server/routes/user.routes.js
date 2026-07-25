const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

router.use(authenticate);

router.get('/', authorize('Admin'), userController.getUsers);
router.get('/:id', authorize('Admin'), userController.getUserById);
router.delete('/:id', authorize('Admin'), userController.deleteUser);

module.exports = router;
