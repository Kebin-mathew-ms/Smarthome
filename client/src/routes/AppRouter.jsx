import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import RoleGuard from '../components/auth/RoleGuard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { ROUTES } from '../constants/routes';
import { ROLES } from '../constants/roles';
import { useAuth } from '../hooks/useAuth';

// Lazy load pages for code-splitting
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('../pages/auth/ForgotPasswordPage'));
const ProfilePage = lazy(() => import('../pages/profile/ProfilePage'));
const NotFoundPage = lazy(() => import('../pages/errors/NotFoundPage'));
const UnauthorizedPage = lazy(() => import('../pages/errors/UnauthorizedPage'));

// Admin Pages
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage'));
const VolunteersPage = lazy(() => import('../pages/admin/VolunteersPage'));
const CategoriesPage = lazy(() => import('../pages/admin/CategoriesPage'));
const SubCategoriesPage = lazy(() => import('../pages/admin/SubCategoriesPage'));
const AdminServicesPage = lazy(() => import('../pages/admin/AdminServicesPage'));
const AdminServiceCustomizationsPage = lazy(() => import('../pages/admin/AdminServiceCustomizationsPage'));
const AdminPackagesPage = lazy(() => import('../pages/admin/AdminPackagesPage'));
const UsersPage = lazy(() => import('../pages/admin/UsersPage'));
const AuditLogsPage = lazy(() => import('../pages/admin/AuditLogsPage'));
const AdminSettingsPage = lazy(() => import('../pages/admin/AdminSettingsPage'));
const AdminBookingsPage = lazy(() => import('../pages/admin/AdminBookingsPage'));

// Customer Marketplace & Booking Pages
const LandingPage = lazy(() => import('../pages/customer/LandingPage'));
const CustomerServiceDetailsPage = lazy(() => import('../pages/customer/CustomerServiceDetailsPage'));
const FavoritesPage = lazy(() => import('../pages/customer/FavoritesPage'));
const FollowingPage = lazy(() => import('../pages/customer/FollowingPage'));
const RecentlyViewedPage = lazy(() => import('../pages/customer/RecentlyViewedPage'));
const SearchResultsPage = lazy(() => import('../pages/customer/SearchResultsPage'));
const AddressManagementPage = lazy(() => import('../pages/customer/AddressManagementPage'));
const BookingWizardPage = lazy(() => import('../pages/booking/BookingWizardPage'));
const BookingHistoryPage = lazy(() => import('../pages/customer/BookingHistoryPage'));
const CustomerBookingDetailsPage = lazy(() => import('../pages/customer/CustomerBookingDetailsPage'));

// Real-Time Work Collaboration & Messaging Page
const ChatPage = lazy(() => import('../pages/chat/ChatPage'));

// Phase 7 Experience, Support & Rewards Pages
const CustomerReviewsPage = lazy(() => import('../pages/customer/CustomerReviewsPage'));
const ComplaintCenterPage = lazy(() => import('../pages/customer/ComplaintCenterPage'));
const ComplaintDetailsPage = lazy(() => import('../pages/customer/ComplaintDetailsPage'));
const WarrantyCenterPage = lazy(() => import('../pages/customer/WarrantyCenterPage'));
const CouponsPage = lazy(() => import('../pages/customer/CouponsPage'));

// Phase 8 & 9 Analytics, Operations & Health Pages
const AnalyticsDashboardPage = lazy(() => import('../pages/admin/AnalyticsDashboardPage'));
const ReportsCenterPage = lazy(() => import('../pages/admin/ReportsCenterPage'));
const SystemHealthPage = lazy(() => import('../pages/admin/SystemHealthPage'));
const AnnouncementsPage = lazy(() => import('../pages/admin/AnnouncementsPage'));
const ActivityLogsPage = lazy(() => import('../pages/admin/ActivityLogsPage'));
const ProductionHealthPage = lazy(() => import('../pages/admin/ProductionHealthPage'));

// Volunteer Portal Pages
const VolunteerLoginPage = lazy(() => import('../pages/auth/VolunteerLoginPage'));
const VolunteerDashboardPage = lazy(() => import('../pages/volunteer/VolunteerDashboardPage'));
const VolunteerBookingsPage = lazy(() => import('../pages/volunteer/VolunteerBookingsPage'));
const VolunteerBookingDetailsPage = lazy(() => import('../pages/volunteer/VolunteerBookingDetailsPage'));
const VolunteerAttendancePage = lazy(() => import('../pages/volunteer/VolunteerAttendancePage'));
const VolunteerWorkLogsPage = lazy(() => import('../pages/volunteer/VolunteerWorkLogsPage'));

const DashboardRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to={ROUTES.LOGIN} replace />;

  switch (user.role) {
    case ROLES.ADMIN:
      return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />;
    case ROLES.VOLUNTEER:
      return <Navigate to={ROUTES.VOLUNTEER_DASHBOARD} replace />;
    case ROLES.USER:
    default:
      return <Navigate to={ROUTES.HOME} replace />;
  }
};

const AppRouter = () => {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen tip="Loading application..." />}>
      <Routes>
        {/* Public Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
          <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
          <Route path={ROUTES.VOLUNTEER_LOGIN} element={<VolunteerLoginPage />} />
        </Route>

        {/* Marketplace & Portal Layout Wrapper */}
        <Route element={<DashboardLayout />}>
          {/* Smart Role-Based Dashboard Redirect */}
          <Route
            path={ROUTES.DASHBOARD}
            element={
              <ProtectedRoute>
                <DashboardRedirect />
              </ProtectedRoute>
            }
          />

          {/* Public Marketplace Routes */}
          <Route path={ROUTES.HOME} element={<LandingPage />} />
          <Route path={ROUTES.SERVICE_DETAILS} element={<CustomerServiceDetailsPage />} />
          <Route path={ROUTES.CATEGORIES} element={<CategoriesPage />} />
          <Route path={ROUTES.SEARCH} element={<SearchResultsPage />} />
          <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />

          {/* Customer Authenticated Routes */}
          <Route
            path={ROUTES.ADDRESSES}
            element={
              <ProtectedRoute>
                <AddressManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.BOOKING_WIZARD}
            element={
              <ProtectedRoute>
                <BookingWizardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.BOOKINGS}
            element={
              <ProtectedRoute>
                <BookingHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.BOOKING_DETAILS}
            element={
              <ProtectedRoute>
                <CustomerBookingDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.CHAT}
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.REVIEWS}
            element={
              <ProtectedRoute>
                <CustomerReviewsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.COMPLAINTS}
            element={
              <ProtectedRoute>
                <ComplaintCenterPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.COMPLAINT_DETAILS}
            element={
              <ProtectedRoute>
                <ComplaintDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.WARRANTY}
            element={
              <ProtectedRoute>
                <WarrantyCenterPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.COUPONS}
            element={
              <ProtectedRoute>
                <CouponsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.FAVORITES}
            element={
              <ProtectedRoute>
                <FavoritesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.FOLLOWING}
            element={
              <ProtectedRoute>
                <FollowingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.RECENTLY_VIEWED}
            element={
              <ProtectedRoute>
                <RecentlyViewedPage />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.PROFILE}
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Volunteer Only Routes */}
          <Route
            path={ROUTES.VOLUNTEER_DASHBOARD}
            element={
              <ProtectedRoute>
                <RoleGuard roles={[ROLES.VOLUNTEER]}>
                  <VolunteerDashboardPage />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.VOLUNTEER_BOOKINGS}
            element={
              <ProtectedRoute>
                <RoleGuard roles={[ROLES.VOLUNTEER]}>
                  <VolunteerBookingsPage />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.VOLUNTEER_BOOKING_DETAILS}
            element={
              <ProtectedRoute>
                <RoleGuard roles={[ROLES.VOLUNTEER]}>
                  <VolunteerBookingDetailsPage />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.VOLUNTEER_ATTENDANCE}
            element={
              <ProtectedRoute>
                <RoleGuard roles={[ROLES.VOLUNTEER]}>
                  <VolunteerAttendancePage />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.VOLUNTEER_WORKLOGS}
            element={
              <ProtectedRoute>
                <RoleGuard roles={[ROLES.VOLUNTEER]}>
                  <VolunteerWorkLogsPage />
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          {/* Admin Only Routes */}
          <Route
            path={ROUTES.ADMIN_DASHBOARD}
            element={
              <ProtectedRoute>
                <RoleGuard roles={[ROLES.ADMIN]}>
                  <AdminDashboardPage />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ANALYTICS}
            element={
              <ProtectedRoute>
                <RoleGuard roles={[ROLES.ADMIN]}>
                  <AnalyticsDashboardPage />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.REPORTS}
            element={
              <ProtectedRoute>
                <RoleGuard roles={[ROLES.ADMIN]}>
                  <ReportsCenterPage />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.SYSTEM_HEALTH}
            element={
              <ProtectedRoute>
                <RoleGuard roles={[ROLES.ADMIN]}>
                  <SystemHealthPage />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.BACKUP}
            element={
              <ProtectedRoute>
                <RoleGuard roles={[ROLES.ADMIN]}>
                  <ProductionHealthPage />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ANNOUNCEMENTS}
            element={
              <ProtectedRoute>
                <RoleGuard roles={[ROLES.ADMIN]}>
                  <AnnouncementsPage />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_VOLUNTEERS}
            element={
              <ProtectedRoute>
                <RoleGuard roles={[ROLES.ADMIN]}>
                  <VolunteersPage />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_BOOKINGS}
            element={
              <ProtectedRoute>
                <RoleGuard roles={[ROLES.ADMIN]}>
                  <AdminBookingsPage />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_CATEGORIES}
            element={
              <ProtectedRoute>
                <RoleGuard roles={[ROLES.ADMIN]}>
                  <CategoriesPage />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_SUBCATEGORIES}
            element={
              <ProtectedRoute>
                <RoleGuard roles={[ROLES.ADMIN]}>
                  <SubCategoriesPage />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_SERVICES}
            element={
              <ProtectedRoute>
                <RoleGuard roles={[ROLES.ADMIN]}>
                  <AdminServicesPage />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_SERVICE_CUSTOMIZATIONS}
            element={
              <ProtectedRoute>
                <RoleGuard roles={[ROLES.ADMIN]}>
                  <AdminServiceCustomizationsPage />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_PACKAGES}
            element={
              <ProtectedRoute>
                <RoleGuard roles={[ROLES.ADMIN]}>
                  <AdminPackagesPage />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_USERS}
            element={
              <ProtectedRoute>
                <RoleGuard roles={[ROLES.ADMIN]}>
                  <UsersPage />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_AUDIT_LOGS}
            element={
              <ProtectedRoute>
                <RoleGuard roles={[ROLES.ADMIN]}>
                  <ActivityLogsPage />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_SETTINGS}
            element={
              <ProtectedRoute>
                <RoleGuard roles={[ROLES.ADMIN]}>
                  <AdminSettingsPage />
                </RoleGuard>
              </ProtectedRoute>
            }
          />
        </Route>

        {/* 404 Catch-All */}
        <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;
