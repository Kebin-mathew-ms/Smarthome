const express = require('express');
const router = express.Router();

const { authenticate, authorize } = require('../middlewares/auth.middleware');
const healthController = require('../controllers/health.controller');
const backupController = require('../controllers/backup.controller');

// Structured Health Checks
router.get('/health', healthController.getGeneralHealth);
router.get('/health/database', healthController.getDatabaseHealth);
router.get('/health/socket', healthController.getSocketHealth);
router.get('/health/storage', healthController.getStorageHealth);

// Backup Endpoint (Admin Only)
router.get('/backup', authenticate, authorize('Admin'), backupController.generateBackup);
router.post('/backup', authenticate, authorize('Admin'), backupController.generateBackup);

module.exports = router;
