const express = require('express');
const router = express.Router();

const { authenticate, authorize } = require('../middlewares/auth.middleware');
const employeePortalController = require('../controllers/employeePortal.controller');

// Public Login Endpoint for Field Technicians
router.post('/login', employeePortalController.login);

// Protected Employee Routes
router.use(authenticate);
router.use(authorize('Employee'));

router.get('/dashboard', employeePortalController.getDashboard);
router.get('/bookings', employeePortalController.getAssignedBookings);
router.get('/bookings/:id', employeePortalController.getAssignedBookingById);
router.patch('/bookings/status', employeePortalController.updateBookingStatus);

router.post('/check-in', employeePortalController.checkIn);
router.post('/check-out', employeePortalController.checkOut);
router.get('/attendance', employeePortalController.getAttendance);

router.post('/signature', employeePortalController.saveCustomerSignature);
router.post('/worklogs', employeePortalController.createWorkLog);

module.exports = router;
