export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  DASHBOARD: '/dashboard',

  // Admin Routes
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_COMPANIES: '/admin/companies',
  ADMIN_ADD_COMPANY: '/admin/companies/new',
  ADMIN_EDIT_COMPANY: '/admin/companies/:id/edit',
  ADMIN_COMPANY_DETAILS: '/admin/companies/:id',
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_SUBCATEGORIES: '/admin/subcategories',
  ADMIN_USERS: '/admin/users',
  ADMIN_AUDIT_LOGS: '/admin/audit-logs',
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_BOOKINGS: '/admin/bookings',

  // Company Portal Routes
  COMPANY_DASHBOARD: '/company/dashboard',
  COMPANY_PROFILE: '/company/profile',
  COMPANY_SERVICES: '/company/services',
  COMPANY_ADD_SERVICE: '/company/services/new',
  COMPANY_EDIT_SERVICE: '/company/services/:id/edit',
  COMPANY_SERVICE_DETAILS: '/company/services/:id',
  COMPANY_PACKAGES: '/company/packages',
  COMPANY_EMPLOYEES: '/company/employees',
  COMPANY_EMPLOYEE_DETAILS: '/company/employees/:id',
  COMPANY_GALLERY: '/company/gallery',
  COMPANY_BOOKINGS: '/company/bookings',
  COMPANY_ANALYTICS: '/company/analytics',

  // Employee (Field Technician) Portal Routes
  EMPLOYEE_LOGIN: '/employee/login',
  EMPLOYEE_DASHBOARD: '/employee/dashboard',
  EMPLOYEE_BOOKINGS: '/employee/bookings',
  EMPLOYEE_BOOKING_DETAILS: '/employee/bookings/:id',
  EMPLOYEE_ATTENDANCE: '/employee/attendance',
  EMPLOYEE_WORKLOGS: '/employee/worklogs',

  // Customer Marketplace & Booking Routes
  COMPANIES: '/companies',
  COMPANY_DETAILS: '/companies/:id',
  SERVICE_DETAILS: '/services/:id',
  CATEGORIES: '/categories',
  FAVORITES: '/favorites',
  FOLLOWING: '/following',
  RECENTLY_VIEWED: '/recently-viewed',
  SEARCH: '/search',

  // Booking & Address Routes
  ADDRESSES: '/addresses',
  BOOKING_WIZARD: '/book/:serviceId',
  BOOKINGS: '/my-bookings',
  BOOKING_DETAILS: '/bookings/:id',

  // Real-Time Chat & Work Collaboration Route
  CHAT: '/chat/:bookingId',

  // Experience, Support & Rewards Routes
  REVIEWS: '/reviews',
  COMPLAINTS: '/complaints',
  COMPLAINT_DETAILS: '/complaints/:id',
  WARRANTY: '/warranties',
  COUPONS: '/coupons',

  // Analytics & Operations Routes
  ANALYTICS: '/admin/analytics',
  REPORTS: '/reports',
  SYSTEM_HEALTH: '/admin/health',
  ANNOUNCEMENTS: '/admin/announcements',
  BACKUP: '/admin/backup',

  PROFILE: '/profile',
  UNAUTHORIZED: '/unauthorized',
  NOT_FOUND: '*'
};
