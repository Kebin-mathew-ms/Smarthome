const express = require('express');
const router = express.Router();

const { authenticate, authorize } = require('../middlewares/auth.middleware');
const analyticsController = require('../controllers/analytics.controller');
const announcementController = require('../controllers/announcement.controller');
const systemHealthController = require('../controllers/systemHealth.controller');

// Public or User Announcements
router.get('/announcements/active', announcementController.getActiveAnnouncements);

// Analytics & Reports (Require authentication & authorization)
router.get('/admin/analytics', authenticate, authorize('Admin'), analyticsController.getAdminAnalytics);
router.get('/reports/bookings', authenticate, authorize('Admin'), analyticsController.getBookingReport);

// System Announcements Management
router.get('/announcements', authenticate, authorize('Admin'), announcementController.getAllAnnouncements);
router.post('/announcements', authenticate, authorize('Admin'), announcementController.createAnnouncement);
router.put('/announcements/:id', authenticate, authorize('Admin'), announcementController.updateAnnouncement);
router.delete('/announcements/:id', authenticate, authorize('Admin'), announcementController.deleteAnnouncement);

// System Telemetry & Logs
router.get('/system/health', authenticate, authorize('Admin'), systemHealthController.getSystemHealth);
router.get('/activity-logs', authenticate, authorize('Admin'), analyticsController.getActivityLogs);

module.exports = router;
