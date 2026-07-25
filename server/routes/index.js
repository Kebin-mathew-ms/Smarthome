const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const adminRoutes = require('./admin.routes');
const companyPortalRoutes = require('./company.portal.routes');
const companyRoutes = require('./company.routes');
const categoryRoutes = require('./serviceCategory.routes');
const userRoutes = require('./user.routes');
const customerRoutes = require('./customer.routes');
const bookingRoutes = require('./booking.routes');
const chatRoutes = require('./chat.routes');
const experienceRoutes = require('./experience.routes');
const analyticsRoutes = require('./analytics.routes');
const productionRoutes = require('./production.routes');
const employeePortalRoutes = require('./employeePortal.routes');

router.use('/', authRoutes);
router.use('/', customerRoutes);
router.use('/', bookingRoutes);
router.use('/', chatRoutes);
router.use('/', experienceRoutes);
router.use('/', analyticsRoutes);
router.use('/production', productionRoutes);
router.use('/employee', employeePortalRoutes);
router.use('/admin', adminRoutes);
router.use('/company', companyPortalRoutes);
router.use('/companies', companyRoutes);
router.use('/categories', categoryRoutes);
router.use('/users', userRoutes);

module.exports = router;
