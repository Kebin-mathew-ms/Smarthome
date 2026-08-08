const express = require('express');
const router = express.Router();

const { authenticate } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

const reviewController = require('../controllers/review.controller');
const complaintController = require('../controllers/complaint.controller');
const warrantyController = require('../controllers/warranty.controller');
const couponController = require('../controllers/coupon.controller');
const userNotificationController = require('../controllers/userNotification.controller');

// -------------------------------------------------------------
// Reviews & Ratings Endpoints
// -------------------------------------------------------------
router.get('/reviews', authenticate, reviewController.getCompanyReviews);
router.get('/reviews/my', authenticate, reviewController.getUserReviews);
router.post('/reviews', authenticate, upload.array('review_media', 5), reviewController.createReview);
router.post('/reviews/:id/reply', authenticate, reviewController.addReply);

// -------------------------------------------------------------
// Support Complaints & Tickets Endpoints
// -------------------------------------------------------------
router.get('/complaints', authenticate, complaintController.getComplaints);
router.get('/complaints/:id', authenticate, complaintController.getComplaintById);
router.post('/complaints', authenticate, upload.array('complaint_attachments', 5), complaintController.createComplaint);
router.post('/complaints/:id/message', authenticate, upload.array('complaint_attachments', 5), complaintController.addMessage);
router.patch('/complaints/:id/status', authenticate, complaintController.updateStatus);

// -------------------------------------------------------------
// Warranty Management Endpoints
// -------------------------------------------------------------
router.get('/warranties', authenticate, warrantyController.getWarranties);
router.get('/warranties/booking/:bookingId', authenticate, warrantyController.getWarrantyByBookingId);
router.post('/warranties', authenticate, warrantyController.issueWarranty);

// -------------------------------------------------------------
// Coupons & Reward Points Endpoints
// -------------------------------------------------------------
router.get('/coupons', authenticate, couponController.getActiveCoupons);
router.get('/coupons/rewards', authenticate, couponController.getUserRewardPoints);
router.post('/coupon/apply', authenticate, couponController.validateAndApplyCoupon);
router.post('/admin/coupons', authenticate, couponController.createCoupon);

// -------------------------------------------------------------
// Notifications Endpoints
// -------------------------------------------------------------
router.get('/notifications', authenticate, userNotificationController.getUserNotifications);
router.patch('/notifications/read', authenticate, userNotificationController.markRead);
router.patch('/notifications/read-all', authenticate, userNotificationController.markAllRead);
router.delete('/notifications/:id', authenticate, userNotificationController.deleteNotification);

module.exports = router;
