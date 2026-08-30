export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  DASHBOARD: '/dashboard',

  // Admin Routes
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_VOLUNTEERS: '/admin/volunteers',
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_SUBCATEGORIES: '/admin/subcategories',
  ADMIN_SERVICES: '/admin/services',
  ADMIN_SERVICE_CUSTOMIZATIONS: '/admin/services/:serviceId/customizations',
  ADMIN_PACKAGES: '/admin/packages',
  ADMIN_USERS: '/admin/users',
  ADMIN_AUDIT_LOGS: '/admin/audit-logs',
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_BOOKINGS: '/admin/bookings',

  // Volunteer Portal Routes
  VOLUNTEER_LOGIN: '/volunteer/login',
  VOLUNTEER_DASHBOARD: '/volunteer/dashboard',
  VOLUNTEER_BOOKINGS: '/volunteer/bookings',
  VOLUNTEER_BOOKING_DETAILS: '/volunteer/bookings/:id',
  VOLUNTEER_ATTENDANCE: '/volunteer/attendance',
  VOLUNTEER_WORKLOGS: '/volunteer/worklogs',

  // Customer Marketplace & Booking Routes
  CATEGORIES: '/categories',
  SERVICE_DETAILS: '/services/:id',
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
