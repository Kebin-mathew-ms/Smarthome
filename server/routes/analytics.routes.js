const express = require('express');
const router = express.Router();

const { authenticate, authorize } = require('../middlewares/auth.middleware');
const analyticsController = require('../controllers/analytics.controller');
const announcementController = require('../controllers/announcement.controller');
const systemHealthController = require('../controllers/systemHealth.controller');

// Public or User Announcements
router.get('/announcements/active', announcementController.getActiveAnnouncements);

// Protected Routes
router.use(authenticate);

// Analytics & Reports
router.get('/admin/analytics', authorize('Admin'), analyticsController.getAdminAnalytics);
router.get('/company/analytics', authorize('Company'), analyticsController.getCompanyAnalytics);
router.get('/reports/bookings', authorize('Admin', 'Company'), analyticsController.getBookingReport);

// System Announcements Management
router.get('/announcements', authorize('Admin'), announcementController.getAllAnnouncements);
router.post('/announcements', authorize('Admin'), announcementController.createAnnouncement);
router.put('/announcements/:id', authorize('Admin'), announcementController.updateAnnouncement);
router.delete('/announcements/:id', authorize('Admin'), announcementController.deleteAnnouncement);

// System Telemetry & Logs
router.get('/system/health', authorize('Admin'), systemHealthController.getSystemHealth);
router.get('/activity-logs', authorize('Admin'), analyticsController.getActivityLogs);

module.exports = router;
