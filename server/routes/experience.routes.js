const express = require('express');
const router = express.Router();

const { authenticate } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

const reviewController = require('../controllers/review.controller');
const complaintController = require('../controllers/complaint.controller');
const warrantyController = require('../controllers/warranty.controller');
const couponController = require('../controllers/coupon.controller');
const userNotificationController = require('../controllers/userNotification.controller');

router.use(authenticate);

// -------------------------------------------------------------
// Reviews & Ratings Endpoints
// -------------------------------------------------------------
router.get('/reviews', reviewController.getCompanyReviews);
router.get('/reviews/my', reviewController.getUserReviews);
router.post('/reviews', upload.array('review_media', 5), reviewController.createReview);
router.post('/reviews/:id/reply', reviewController.addReply);

// -------------------------------------------------------------
// Support Complaints & Tickets Endpoints
// -------------------------------------------------------------
router.get('/complaints', complaintController.getComplaints);
router.get('/complaints/:id', complaintController.getComplaintById);
router.post('/complaints', upload.array('complaint_attachments', 5), complaintController.createComplaint);
router.post('/complaints/:id/message', upload.array('complaint_attachments', 5), complaintController.addMessage);
router.patch('/complaints/:id/status', complaintController.updateStatus);

// -------------------------------------------------------------
// Warranty Management Endpoints
// -------------------------------------------------------------
router.get('/warranties', warrantyController.getWarranties);
router.get('/warranties/booking/:bookingId', warrantyController.getWarrantyByBookingId);
router.post('/warranties', warrantyController.issueWarranty);

// -------------------------------------------------------------
// Coupons & Reward Points Endpoints
// -------------------------------------------------------------
router.get('/coupons', couponController.getActiveCoupons);
router.get('/coupons/rewards', couponController.getUserRewardPoints);
router.post('/coupon/apply', couponController.validateAndApplyCoupon);
router.post('/admin/coupons', couponController.createCoupon);

// -------------------------------------------------------------
// Notifications Endpoints
// -------------------------------------------------------------
router.get('/notifications', userNotificationController.getUserNotifications);
router.patch('/notifications/read', userNotificationController.markRead);
router.patch('/notifications/read-all', userNotificationController.markAllRead);
router.delete('/notifications/:id', userNotificationController.deleteNotification);

module.exports = router;
