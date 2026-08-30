const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const adminRoutes = require('./admin.routes');
const categoryRoutes = require('./serviceCategory.routes');
const userRoutes = require('./user.routes');
const customerRoutes = require('./customer.routes');
const bookingRoutes = require('./booking.routes');
const chatRoutes = require('./chat.routes');
const experienceRoutes = require('./experience.routes');
const analyticsRoutes = require('./analytics.routes');
const productionRoutes = require('./production.routes');
const volunteerPortalRoutes = require('./volunteerPortal.routes');
const customizationRoutes = require('./customization.routes');

router.use('/', authRoutes);
router.use('/', customerRoutes);
router.use('/', bookingRoutes);
router.use('/', chatRoutes);
router.use('/', experienceRoutes);
router.use('/', analyticsRoutes);
router.use('/', customizationRoutes);
router.use('/production', productionRoutes);
router.use('/volunteer', volunteerPortalRoutes);
router.use('/admin', adminRoutes);
router.use('/categories', categoryRoutes);
router.use('/users', userRoutes);

module.exports = router;
