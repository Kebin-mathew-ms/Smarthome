const express = require('express');
const router = express.Router();

const { authenticate, authorize } = require('../middlewares/auth.middleware');
const volunteerPortalController = require('../controllers/volunteerPortal.controller');

// Public Login Endpoint for Volunteers
router.post('/login', volunteerPortalController.login);

// Protected Volunteer Routes
router.use(authenticate);
router.use(authorize('Volunteer'));

router.get('/dashboard', volunteerPortalController.getDashboard);
router.get('/bookings', volunteerPortalController.getAssignedBookings);
router.get('/bookings/:id', volunteerPortalController.getAssignedBookingById);
router.patch('/bookings/status', volunteerPortalController.updateBookingStatus);

router.post('/check-in', volunteerPortalController.checkIn);
router.post('/check-out', volunteerPortalController.checkOut);
router.get('/attendance', volunteerPortalController.getAttendance);

router.post('/signature', volunteerPortalController.saveCustomerSignature);
router.post('/worklogs', volunteerPortalController.createWorkLog);

module.exports = router;
