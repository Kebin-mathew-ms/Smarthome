import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Input, Typography, Button, Tag, Space, Tabs, Statistic, message } from 'antd';
import {
  Search,
  Layers,
  ShieldCheck,
  Wrench,
  ArrowRight,
  Award,
  Clock,
  User,
  Users,
  Shield,
  Activity,
  BarChart3,
  LogIn,
  MapPin,
  Calendar,
  FileText,
  Check,
  CalendarCheck
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import Footer from '../../layouts/Footer';
import SkeletonCard from '../../components/common/SkeletonCard';
import { customerService } from '../../services/customer.service';
import { ROUTES } from '../../constants/routes';
import { ROLES } from '../../constants/roles';
import { useAuth } from '../../hooks/useAuth';

const { Title, Text } = Typography;

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('user');

  useEffect(() => {
    const fetchLanding = async () => {
      setLoading(true);
      try {
        const res = await customerService.getLandingData();
        if (res && res.success) {
          setData(res.data);
        }
      } catch (err) {
        // Quietly fail or log - don't disrupt landing page rendering
        console.warn('Failed to load marketplace landing data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLanding();
  }, []);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/search?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleGoToLogin = (roleTab) => {
    const target = roleTab || activeTab;
    if (target === 'volunteer') {
      navigate(ROUTES.VOLUNTEER_LOGIN);
    } else {
      navigate(`${ROUTES.LOGIN}?tab=${target}`);
    }
  };

  const tabContentMap = {
    user: {
      badge: 'Customer & Homeowner Hub',
      badgeColor: 'blue',
      icon: <User size={24} style={{ color: '#2563eb' }} />,
      title: 'For Users & Homeowners',
      subtitle: 'Browse services, choose maintenance packages, place requests, track field volunteers, and manage warranties.',
      metrics: [
        { label: 'Service Categories', value: '15+', subText: 'Electrical, Plumbing, HVAC & More', icon: <Layers size={20} style={{ color: '#2563eb' }} /> },
        { label: 'Real-Time Dispatch', value: 'Instant', subText: 'Automated volunteer assignment', icon: <Clock size={20} style={{ color: '#16a34a' }} /> },
        { label: 'Satisfaction Rate', value: '98.5%', subText: 'Verified customer reviews', icon: <Award size={20} style={{ color: '#d97706' }} /> },
        { label: 'Warranty Support', value: 'Active', subText: 'Guaranteed service quality', icon: <ShieldCheck size={20} style={{ color: '#9333ea' }} /> }
      ],
      features: [
        'Search & filter home care services across multiple categories',
        'Multi-step booking wizard with saved address management',
        'Live GPS check-in status & real-time volunteer work progress',
        'In-app chat collaboration & work update photo gallery',
        'Complaint filing, warranty claims & coupon discounts'
      ],
      loginBtnText: 'Go to User Login',
      loginBtnColor: '#2563eb'
    },
    volunteer: {
      badge: 'Staff & Volunteer Portal',
      badgeColor: 'green',
      icon: <Wrench size={24} style={{ color: '#059669' }} />,
      title: 'For Volunteers & Service Technicians',
      subtitle: 'Dedicated portal for community volunteers to manage daily job assignments, check in with GPS, log work, and record signatures.',
      metrics: [
        { label: 'Assigned Tasks', value: 'Real-Time', subText: 'Direct dispatch from platform admins', icon: <Wrench size={20} style={{ color: '#059669' }} /> },
        { label: 'GPS Check-In', value: 'Verified', subText: 'Geo-verified arrival and departure', icon: <MapPin size={20} style={{ color: '#2563eb' }} /> },
        { label: 'Digital Work Logs', value: 'Captured', subText: 'Work summary & customer sign-off', icon: <FileText size={20} style={{ color: '#d97706' }} /> },
        { label: 'Attendance Tracking', value: 'Automated', subText: 'Hours, check-ins & ratings', icon: <Calendar size={20} style={{ color: '#9333ea' }} /> }
      ],
      features: [
        'View assigned home care tasks & service details',
        'GPS-based location Check-In & Check-Out verification',
        'Record work progress, upload updates & submit work logs',
        'Capture digital customer signatures upon job completion',
        'Monitor attendance history and task performance metrics'
      ],
      loginBtnText: 'Go to Volunteer Login',
      loginBtnColor: '#059669'
    },
    admin: {
      badge: 'Platform Operations & Control',
      badgeColor: 'purple',
      icon: <Shield size={24} style={{ color: '#7c3aed' }} />,
      title: 'For System Administrators',
      subtitle: 'Complete administrative hub to manage users, dispatch volunteers, control service catalog, audit logs, and system health.',
      metrics: [
        { label: 'System Uptime', value: '99.9%', subText: 'Real-time production health monitoring', icon: <Activity size={20} style={{ color: '#7c3aed' }} /> },
        { label: 'Central Control', value: 'Unified', subText: 'Users, Volunteers & Bookings management', icon: <Users size={20} style={{ color: '#2563eb' }} /> },
        { label: 'Audit Logs', value: '100% Tracked', subText: 'Complete activity & security history', icon: <FileText size={20} style={{ color: '#16a34a' }} /> },
        { label: 'Analytics & Reports', value: 'Dynamic', subText: 'Financial, service & user metrics', icon: <BarChart3 size={20} style={{ color: '#d97706' }} /> }
      ],
      features: [
        'Dispatch staff volunteers to pending customer bookings',
        'Manage categories, subcategories, packages & service prices',
        'User & Volunteer account administration & access control',
        'Inspect system audit logs, security events & health alerts',
        'Broadcast system announcements & run database diagnostic tools'
      ],
      loginBtnText: 'Go to Admin Login',
      loginBtnColor: '#7c3aed'
    }
  };

  const currentTabInfo = tabContentMap[activeTab];

  return (
    <div style={{ width: '100%' }}>
      {/* Main Hero Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderRadius: 20,
          padding: '56px 32px',
          color: '#ffffff',
          marginBottom: 36,
          boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.3)'
        }}
      >
        <div style={{ maxWidth: 880, margin: '0 auto', textAlign: 'center' }}>
          <Tag color="blue" style={{ fontSize: 13, padding: '4px 14px', borderRadius: 999, marginBottom: 16 }}>
            Direct Smart Home Care & Maintenance Platform
          </Tag>
          <Title level={1} style={{ color: '#ffffff', fontSize: 40, fontWeight: 800, margin: '0 0 16px', tracking: '-0.02em' }}>
            Instant Home Services, Assigned Directly to Vetted Volunteers
          </Title>
          <Text style={{ color: '#94a3b8', fontSize: 17, display: 'block', marginBottom: 28, lineHeight: 1.6 }}>
            Browse categories, select the service package you need, and book. Our admins will coordinate a vetted staff volunteer to complete the job.
          </Text>

          {/* Quick Search Bar */}
          <div style={{ background: '#ffffff', padding: 8, borderRadius: 16, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', display: 'flex', gap: 8, maxWidth: 720, margin: '0 auto 24px' }}>
            <Input
              size="large"
              variant="borderless"
              prefix={<Search size={20} style={{ color: '#94a3b8', marginRight: 8 }} />}
              placeholder="Search home care services, plumbing, electrical..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onPressEnter={handleSearch}
              style={{ fontSize: 16 }}
            />
            <Button type="primary" size="large" onClick={handleSearch} style={{ height: 48, padding: '0 28px', borderRadius: 12, fontWeight: 700 }}>
              Search Services
            </Button>
          </div>

          {/* Primary CTA Buttons */}
          <Space size="middle" wrap style={{ justifyContent: 'center' }}>
            {user ? (
              <>
                <Button
                  type="primary"
                  size="large"
                  icon={<CalendarCheck size={18} />}
                  onClick={() => navigate(ROUTES.BOOKINGS)}
                  style={{
                    height: 48,
                    padding: '0 32px',
                    borderRadius: 12,
                    fontWeight: 700,
                    background: '#2563eb',
                    borderColor: '#2563eb'
                  }}
                >
                  My Bookings
                </Button>
                <Button
                  size="large"
                  onClick={() => {
                    const el = document.getElementById('categories-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  style={{
                    height: 48,
                    padding: '0 24px',
                    borderRadius: 12,
                    fontWeight: 600,
                    color: '#ffffff',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    background: 'rgba(255, 255, 255, 0.1)'
                  }}
                >
                  Explore All Services ↓
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="primary"
                  size="large"
                  icon={<LogIn size={18} />}
                  onClick={() => handleGoToLogin(activeTab)}
                  style={{
                    height: 48,
                    padding: '0 32px',
                    borderRadius: 12,
                    fontWeight: 700,
                    background: '#2563eb',
                    borderColor: '#2563eb'
                  }}
                >
                  Go to Login
                </Button>
                <Button
                  size="large"
                  onClick={() => {
                    const el = document.getElementById('system-tabs-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  style={{
                    height: 48,
                    padding: '0 24px',
                    borderRadius: 12,
                    fontWeight: 600,
                    color: '#ffffff',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    background: 'rgba(255, 255, 255, 0.1)'
                  }}
                >
                  Explore 3 System Roles ↓
                </Button>
              </>
            )}
          </Space>
        </div>
      </div>

      {/* Popular Categories Section */}
      <div id="categories-section" style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <Title level={3} style={{ margin: 0, fontWeight: 700 }}>Explore Service Categories</Title>
            <Text type="secondary">Find specialized trades and choose your required service package</Text>
          </div>
          <Link to={ROUTES.CATEGORIES}>
            <Button type="link" style={{ fontWeight: 600, color: '#2563eb' }}>
              View All Categories <ArrowRight size={16} style={{ marginLeft: 4 }} />
            </Button>
          </Link>
        </div>

        <Row gutter={[16, 16]}>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Col xs={24} sm={12} md={6} key={i}>
                <SkeletonCard />
              </Col>
            ))
          ) : (
            data?.categories?.slice(0, 4).map(cat => (
              <Col xs={24} sm={12} md={6} key={cat.id}>
                <Card
                  hoverable
                  variant="borderless"
                  onClick={() => navigate(`/search?category=${cat.id}`)}
                  styles={{ body: { padding: 24, textAlign: 'center' } }}
                  style={{ borderRadius: 16, border: '1px solid #e2e8f0' }}
                >
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: '#eff6ff', color: '#2563eb', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                    <Layers size={28} />
                  </div>
                  <Title level={5} style={{ margin: '0 0 4px', fontWeight: 700 }}>{cat.category_name}</Title>
                  <Text type="secondary" style={{ fontSize: 13 }}>{cat.description || 'Professional home service offerings'}</Text>
                </Card>
              </Col>
            ))
          )}
        </Row>
      </div>

      {/* Popular Services Showcase */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0, fontWeight: 700 }}>Popular Service Offerings</Title>
          <Text type="secondary">Frequently requested home care services</Text>
        </div>

        <Row gutter={[20, 20]}>
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Col xs={24} sm={12} lg={8} key={i}>
                <SkeletonCard />
              </Col>
            ))
          ) : (
            data?.popularServices?.map(serv => (
              <Col xs={24} sm={12} lg={8} key={serv.id}>
                <Card
                  hoverable
                  variant="borderless"
                  onClick={() => navigate(`/services/${serv.id}`)}
                  styles={{ body: { padding: 20 } }}
                  style={{ borderRadius: 16, border: '1px solid #e2e8f0' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <Tag color="blue">{serv.category_name}</Tag>
                    <strong style={{ color: '#16a34a', fontSize: 16 }}>${Number(serv.starting_price).toFixed(2)}</strong>
                  </div>

                  <Title level={5} style={{ margin: '0 0 8px', fontWeight: 700 }}>{serv.service_name}</Title>
                  <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 16 }}>
                    {serv.short_description}
                  </Text>

                  <Button type="primary" block style={{ borderRadius: 8, background: '#2563eb', fontWeight: 600 }}>
                    View Service Details & Book
                  </Button>
                </Card>
              </Col>
            ))
          )}
        </Row>
      </div>

      {/* 3-Tab System Overview & Data Section */}
      <div id="system-tabs-section" style={{ marginBottom: 48 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={2} style={{ margin: '0 0 8px', fontWeight: 800 }}>
            How the System Works Across 3 Roles
          </Title>
          <Text type="secondary" style={{ fontSize: 15 }}>
            Switch between the tabs below to explore what the system offers for <strong>Users</strong>, <strong>Volunteers Needed</strong>, and <strong>Admins</strong>.
          </Text>
        </div>

        {/* The Three Role Tabs */}
        <Card variant="borderless" style={{ background: '#ffffff', borderRadius: 20, border: '1px solid #e2e8f0', padding: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            type="card"
            centered
            size="large"
            items={[
              {
                key: 'user',
                label: (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 16px', fontWeight: 600 }}>
                    <User size={18} /> Users (Customers)
                  </span>
                )
              },
              {
                key: 'volunteer',
                label: (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 16px', fontWeight: 600 }}>
                    <Wrench size={18} /> Volunteers Needed
                  </span>
                )
              },
              {
                key: 'admin',
                label: (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 16px', fontWeight: 600 }}>
                    <Shield size={18} /> Admin Portal
                  </span>
                )
              }
            ]}
          />

          {/* Active Tab System Data Content */}
          <div style={{ background: '#f8fafc', borderRadius: 16, padding: 28, marginTop: 12, border: '1px solid #f1f5f9' }}>
            <Row gutter={[24, 24]} align="middle">
              <Col xs={24} lg={14}>
                <Tag color={currentTabInfo.badgeColor} style={{ fontSize: 13, padding: '4px 12px', borderRadius: 999, marginBottom: 12 }}>
                  {currentTabInfo.badge}
                </Tag>
                <Title level={3} style={{ margin: '0 0 12px', fontWeight: 800 }}>
                  {currentTabInfo.title}
                </Title>
                <Text style={{ color: '#475569', fontSize: 15, display: 'block', marginBottom: 20, lineHeight: 1.6 }}>
                  {currentTabInfo.subtitle}
                </Text>

                {/* Role Features List */}
                <div style={{ marginBottom: 24 }}>
                  <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 12, color: '#1e293b' }}>
                    Key System Capabilities for {activeTab === 'user' ? 'Users' : activeTab === 'volunteer' ? 'Volunteers' : 'Admins'}:
                  </Text>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {currentTabInfo.features.map((feat, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <div style={{ background: '#eff6ff', color: currentTabInfo.loginBtnColor, borderRadius: '50%', padding: 3, marginTop: 2, display: 'flex' }}>
                          <Check size={14} />
                        </div>
                        <Text style={{ color: '#334155', fontSize: 14 }}>{feat}</Text>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Role Login / Navigation CTA Button */}
                {!user ? (
                  <Space size="middle">
                    <Button
                      type="primary"
                      size="large"
                      icon={<LogIn size={18} />}
                      onClick={() => handleGoToLogin(activeTab)}
                      style={{
                        height: 44,
                        padding: '0 28px',
                        borderRadius: 12,
                        fontWeight: 700,
                        background: currentTabInfo.loginBtnColor,
                        borderColor: currentTabInfo.loginBtnColor
                      }}
                    >
                      {currentTabInfo.loginBtnText}
                    </Button>
                    {activeTab === 'user' && (
                      <Link to={ROUTES.REGISTER}>
                        <Button size="large" style={{ height: 44, borderRadius: 12, fontWeight: 600 }}>
                          Register Account
                        </Button>
                      </Link>
                    )}
                  </Space>
                ) : (
                  <Button
                    type="primary"
                    size="large"
                    onClick={() => {
                      if (activeTab === 'admin') navigate(ROUTES.ADMIN_DASHBOARD);
                      else if (activeTab === 'volunteer') navigate(ROUTES.VOLUNTEER_DASHBOARD);
                      else navigate(ROUTES.BOOKINGS);
                    }}
                    style={{
                      height: 44,
                      padding: '0 28px',
                      borderRadius: 12,
                      fontWeight: 700,
                      background: currentTabInfo.loginBtnColor,
                      borderColor: currentTabInfo.loginBtnColor
                    }}
                  >
                    Go to {activeTab === 'admin' ? 'Admin Dashboard' : activeTab === 'volunteer' ? 'Volunteer Dashboard' : 'My Bookings'}
                  </Button>
                )}
              </Col>

              {/* Data & Metric Cards Grid */}
              <Col xs={24} lg={10}>
                <Row gutter={[12, 12]}>
                  {currentTabInfo.metrics.map((metric, idx) => (
                    <Col xs={12} key={idx}>
                      <Card
                        variant="borderless"
                        styles={{ body: { padding: 16 } }}
                        style={{
                          background: '#ffffff',
                          borderRadius: 14,
                          border: '1px solid #e2e8f0',
                          height: '100%'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>{metric.label}</span>
                          {metric.icon}
                        </div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
                          {metric.value}
                        </div>
                        <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
                          {metric.subText}
                        </Text>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Col>
            </Row>
          </div>
        </Card>
      </div>

      {/* Global System Stats Bar */}
      <Card variant="borderless" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', padding: 24, borderRadius: 20, marginBottom: 48, color: '#ffffff' }}>
        <Row gutter={[24, 24]} justify="space-around" align="middle" style={{ textAlign: 'center' }}>
          <Col xs={12} sm={6}>
            <Statistic title={<span style={{ color: '#94a3b8' }}>Service Offerings</span>} value="15+" valueStyle={{ color: '#ffffff', fontWeight: 800, fontSize: 32 }} />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic title={<span style={{ color: '#94a3b8' }}>Staff Volunteers</span>} value="50+" valueStyle={{ color: '#ffffff', fontWeight: 800, fontSize: 32 }} />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic title={<span style={{ color: '#94a3b8' }}>Bookings Managed</span>} value="1,250+" valueStyle={{ color: '#ffffff', fontWeight: 800, fontSize: 32 }} />
          </Col>
          <Col xs={12} sm={6}>
            <Statistic title={<span style={{ color: '#94a3b8' }}>System Uptime</span>} value="99.9%" valueStyle={{ color: '#ffffff', fontWeight: 800, fontSize: 32 }} />
          </Col>
        </Row>
      </Card>

      {/* Why Choose Us */}
      <Card variant="borderless" style={{ background: '#ffffff', padding: 24, borderRadius: 16, marginBottom: 48, border: '1px solid #e2e8f0' }}>
        <Title level={3} style={{ textAlign: 'center', margin: '0 0 32px', fontWeight: 700 }}>Why Choose Smart Home Care?</Title>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8} style={{ textAlign: 'center' }}>
            <ShieldCheck size={36} style={{ color: '#2563eb', marginBottom: 12 }} />
            <Title level={5} style={{ margin: '0 0 8px' }}>Direct Dispatching</Title>
            <Text type="secondary">No middle companies. Platform Admins dispatch volunteers directly to your door.</Text>
          </Col>

          <Col xs={24} md={8} style={{ textAlign: 'center' }}>
            <Award size={36} style={{ color: '#16a34a', marginBottom: 12 }} />
            <Title level={5} style={{ margin: '0 0 8px' }}>Dedicated Volunteers</Title>
            <Text type="secondary">Trained community helpers provide top quality repairs, cleaning and setup.</Text>
          </Col>

          <Col xs={24} md={8} style={{ textAlign: 'center' }}>
            <Clock size={36} style={{ color: '#9333ea', marginBottom: 12 }} />
            <Title level={5} style={{ margin: '0 0 8px' }}>Real-Time Tracker</Title>
            <Text type="secondary">Monitor check-in status, progress, chat logs, and provide feedback directly.</Text>
          </Col>
        </Row>
      </Card>

      <Footer />
    </div>
  );
};

export default LandingPage;
