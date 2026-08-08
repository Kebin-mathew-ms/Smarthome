const express = require('express');
const router = express.Router();

const { authenticate, authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');

const addressController = require('../controllers/address.controller');
const bookingController = require('../controllers/booking.controller');
const adminBookingController = require('../controllers/adminBooking.controller');
const paymentController = require('../controllers/payment.controller');
const invoiceController = require('../controllers/invoice.controller');

const { createAddressValidation } = require('../validators/address.validator');
const { createBookingValidation } = require('../validators/booking.validator');

// -------------------------------------------------------------
// Customer Address Book Endpoints (Require Auth)
// -------------------------------------------------------------
router.get('/addresses', authenticate, addressController.getAddresses);
router.get('/addresses/:id', authenticate, addressController.getAddressById);
router.post('/addresses', authenticate, createAddressValidation, validate, addressController.createAddress);
router.put('/addresses/:id', authenticate, createAddressValidation, validate, addressController.updateAddress);
router.delete('/addresses/:id', authenticate, addressController.deleteAddress);
router.patch('/addresses/:id/default', authenticate, addressController.setDefaultAddress);

// -------------------------------------------------------------
// Customer Booking Endpoints (Require Auth)
// -------------------------------------------------------------
router.post('/bookings', authenticate, createBookingValidation, validate, bookingController.createBooking);
router.get('/bookings', authenticate, bookingController.getUserBookings);
router.get('/bookings/:id', authenticate, bookingController.getBookingById);
router.patch('/bookings/cancel', authenticate, bookingController.cancelBooking);
router.patch('/bookings/reschedule', authenticate, bookingController.rescheduleBooking);

// -------------------------------------------------------------
// Admin Platform Booking Endpoints (Require Auth + Admin Role)
// -------------------------------------------------------------
router.get('/admin/bookings', authenticate, authorize('Admin'), adminBookingController.getAllBookings);
router.get('/admin/bookings/export', authenticate, authorize('Admin'), adminBookingController.exportBookingsCSV);
router.patch('/admin/bookings/status', authenticate, authorize('Admin'), adminBookingController.updateBookingStatus);
router.patch('/admin/bookings/assign', authenticate, authorize('Admin'), adminBookingController.assignVolunteers);

// -------------------------------------------------------------
// Payments & Invoices Endpoints
// -------------------------------------------------------------
router.post('/payments/create-order', authenticate, paymentController.createOrder);
router.post('/payments/verify', authenticate, paymentController.verifyPayment);
router.get('/invoice/:bookingId', authenticate, invoiceController.getInvoiceByBookingId);

module.exports = router;
