import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building2, Layers, ShieldCheck, Users, Activity, Settings, User, Wrench, Briefcase, Image as ImageIcon, Heart, UserCheck, Clock, Home, MapPin, Calendar, Star, Ticket, Gift, TrendingUp, BarChart2, Server, Megaphone, CheckSquare, FileText } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { ROUTES } from '../constants/routes';
import { ROLES } from '../constants/roles';

const { Sider } = Layout;

const Sidebar = ({ collapsed, onCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { isDarkMode } = useTheme();

  let menuItems = [];

  if (user?.role === ROLES.ADMIN) {
    menuItems = [
      { key: ROUTES.ADMIN_DASHBOARD, icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
      { key: ROUTES.ANALYTICS, icon: <TrendingUp size={18} />, label: 'Business Intelligence' },
      { key: ROUTES.REPORTS, icon: <BarChart2 size={18} />, label: 'Reports & Exports' },
      { key: ROUTES.SYSTEM_HEALTH, icon: <Server size={18} />, label: 'System Health Telemetry' },
      { key: ROUTES.ANNOUNCEMENTS, icon: <Megaphone size={18} />, label: 'Announcements' },
      { key: ROUTES.ADMIN_COMPANIES, icon: <Building2 size={18} />, label: 'Companies' },
      { key: ROUTES.ADMIN_BOOKINGS, icon: <Calendar size={18} />, label: 'Platform Bookings' },
      { key: ROUTES.COMPLAINTS, icon: <Ticket size={18} />, label: 'Support Complaints' },
      { key: ROUTES.ADMIN_CATEGORIES, icon: <Layers size={18} />, label: 'Service Categories' },
      { key: ROUTES.ADMIN_SUBCATEGORIES, icon: <ShieldCheck size={18} />, label: 'Subcategories' },
      { key: ROUTES.ADMIN_USERS, icon: <Users size={18} />, label: 'User Control' },
      { key: ROUTES.ADMIN_AUDIT_LOGS, icon: <Activity size={18} />, label: 'Audit Logs' },
      { key: ROUTES.ADMIN_SETTINGS, icon: <Settings size={18} />, label: 'Settings' },
      { key: ROUTES.PROFILE, icon: <User size={18} />, label: 'My Profile' }
    ];
  } else if (user?.role === ROLES.COMPANY) {
    menuItems = [
      { key: ROUTES.COMPANY_DASHBOARD, icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
      { key: ROUTES.COMPANY_ANALYTICS, icon: <TrendingUp size={18} />, label: 'Provider Performance' },
      { key: ROUTES.REPORTS, icon: <BarChart2 size={18} />, label: 'Company Reports' },
      { key: ROUTES.COMPANY_BOOKINGS, icon: <Calendar size={18} />, label: 'Booking Dispatch' },
      { key: ROUTES.COMPLAINTS, icon: <Ticket size={18} />, label: 'Support Tickets' },
      { key: ROUTES.REVIEWS, icon: <Star size={18} />, label: 'Customer Reviews' },
      { key: ROUTES.WARRANTY, icon: <ShieldCheck size={18} />, label: 'Warranties Issued' },
      { key: ROUTES.COMPANY_SERVICES, icon: <Briefcase size={18} />, label: 'Services Catalog' },
      { key: ROUTES.COMPANY_PACKAGES, icon: <Layers size={18} />, label: 'Service Packages' },
      { key: ROUTES.COMPANY_EMPLOYEES, icon: <Users size={18} />, label: 'Staff & Technicians' },
      { key: ROUTES.COMPANY_GALLERY, icon: <ImageIcon size={18} />, label: 'Portfolio Gallery' },
      { key: ROUTES.COMPANY_PROFILE, icon: <Building2 size={18} />, label: 'Company Profile' },
      { key: ROUTES.PROFILE, icon: <User size={18} />, label: 'User Account' }
    ];
  } else if (user?.role === ROLES.EMPLOYEE) {
    // Technician Menu
    menuItems = [
      { key: ROUTES.EMPLOYEE_DASHBOARD, icon: <LayoutDashboard size={18} />, label: 'Field Dashboard' },
      { key: ROUTES.EMPLOYEE_BOOKINGS, icon: <Briefcase size={18} />, label: 'My Assigned Jobs' },
      { key: ROUTES.EMPLOYEE_ATTENDANCE, icon: <CheckSquare size={18} />, label: 'Attendance History' },
      { key: ROUTES.EMPLOYEE_WORKLOGS, icon: <FileText size={18} />, label: 'Work Logs' },
      { key: ROUTES.PROFILE, icon: <User size={18} />, label: 'My Account' }
    ];
  } else {
    // Customer / Guest Menu
    menuItems = [
      { key: ROUTES.HOME, icon: <Home size={18} />, label: 'Home Marketplace' },
      { key: ROUTES.COMPANIES, icon: <Building2 size={18} />, label: 'Browse Companies' },
      { key: ROUTES.BOOKINGS, icon: <Calendar size={18} />, label: 'My Bookings' },
      { key: ROUTES.ADDRESSES, icon: <MapPin size={18} />, label: 'Saved Addresses' },
      { key: ROUTES.REVIEWS, icon: <Star size={18} />, label: 'My Reviews' },
      { key: ROUTES.COMPLAINTS, icon: <Ticket size={18} />, label: 'Support Tickets' },
      { key: ROUTES.WARRANTY, icon: <ShieldCheck size={18} />, label: 'Warranties' },
      { key: ROUTES.COUPONS, icon: <Gift size={18} />, label: 'Coupons & Rewards' },
      { key: ROUTES.FAVORITES, icon: <Heart size={18} />, label: 'Saved Favorites' },
      { key: ROUTES.FOLLOWING, icon: <UserCheck size={18} />, label: 'Following' },
      { key: ROUTES.RECENTLY_VIEWED, icon: <Clock size={18} />, label: 'Recently Viewed' },
      { key: ROUTES.PROFILE, icon: <User size={18} />, label: 'My Profile' }
    ];
  }

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      breakpoint="lg"
      theme={isDarkMode ? 'dark' : 'light'}
      style={{
        borderRight: `1px solid ${isDarkMode ? '#1e293b' : '#e2e8f0'}`,
        height: '100vh',
        position: 'sticky',
        top: 0,
        left: 0,
        zIndex: 100
      }}
    >
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? '0' : '0 20px',
          gap: 12,
          borderBottom: `1px solid ${isDarkMode ? '#1e293b' : '#e2e8f0'}`
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            color: '#fff'
          }}
        >
          <Wrench size={20} />
        </div>
        {!collapsed && (
          <span
            style={{
              fontWeight: 700,
              fontSize: 16,
              letterSpacing: '-0.01em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {user?.role === ROLES.EMPLOYEE ? 'Technician Portal' : user?.role === ROLES.COMPANY ? 'Provider Portal' : user?.role === ROLES.ADMIN ? 'HomeCare Admin' : 'Smart Home Care'}
          </span>
        )}
      </div>

      <Menu
        theme={isDarkMode ? 'dark' : 'light'}
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
        style={{ borderRight: 0, padding: '12px 8px' }}
      />
    </Sider>
  );
};

export default Sidebar;
