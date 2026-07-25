const express = require('express');
const router = express.Router();

const { authenticate, authorize } = require('../middlewares/auth.middleware');
const requireCompanyContext = require('../middlewares/companyContext.middleware');
const validate = require('../middlewares/validate.middleware');

const addressController = require('../controllers/address.controller');
const bookingController = require('../controllers/booking.controller');
const companyBookingController = require('../controllers/companyBooking.controller');
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
// Company Provider Dispatch Booking Endpoints (Require Auth + Company Role)
// -------------------------------------------------------------
router.get('/company/bookings', authenticate, authorize('Company'), requireCompanyContext, companyBookingController.getCompanyBookings);
router.patch('/company/bookings/status', authenticate, authorize('Company'), requireCompanyContext, companyBookingController.updateBookingStatus);
router.patch('/company/bookings/assign', authenticate, authorize('Company'), requireCompanyContext, companyBookingController.assignEmployees);

// -------------------------------------------------------------
// Admin Platform Booking Endpoints (Require Auth + Admin Role)
// -------------------------------------------------------------
router.get('/admin/bookings', authenticate, authorize('Admin'), adminBookingController.getAllBookings);
router.get('/admin/bookings/export', authenticate, authorize('Admin'), adminBookingController.exportBookingsCSV);

// -------------------------------------------------------------
// Payments & Invoices Endpoints
// -------------------------------------------------------------
router.post('/payments/create-order', authenticate, paymentController.createOrder);
router.post('/payments/verify', authenticate, paymentController.verifyPayment);
router.get('/invoice/:bookingId', authenticate, invoiceController.getInvoiceByBookingId);

module.exports = router;
