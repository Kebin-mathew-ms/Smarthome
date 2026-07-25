import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Rate, message } from 'antd';
import { Briefcase, CheckCircle, XCircle, Users, CalendarCheck, Clock, Star, Plus, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import AppButton from '../../components/common/AppButton';
import SkeletonCard from '../../components/common/SkeletonCard';
import { companyPortalService } from '../../services/companyPortal.service';
import { ROUTES } from '../../constants/routes';

const { Title, Text } = Typography;

const CompanyDashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await companyPortalService.getDashboardStats();
        if (res.success) {
          setStats(res.data);
        }
      } catch (err) {
        message.error(err.message || 'Failed to load company dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div>
        <PageHeader title="Company Workspace" subtitle="Loading..." />
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}><SkeletonCard rows={2} /></Col>
          <Col xs={24} sm={12} lg={6}><SkeletonCard rows={2} /></Col>
          <Col xs={24} sm={12} lg={6}><SkeletonCard rows={2} /></Col>
          <Col xs={24} sm={12} lg={6}><SkeletonCard rows={2} /></Col>
        </Row>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Services', value: stats?.totalServices || 0, icon: <Briefcase size={22} />, color: '#2563eb', bg: '#eff6ff' },
    { title: 'Active Services', value: stats?.activeServices || 0, icon: <CheckCircle size={22} />, color: '#16a34a', bg: '#f0fdf4' },
    { title: 'Inactive Services', value: stats?.inactiveServices || 0, icon: <XCircle size={22} />, color: '#dc2626', bg: '#fef2f2' },
    { title: 'Total Employees', value: stats?.totalEmployees || 0, icon: <Users size={22} />, color: '#9333ea', bg: '#faf5ff' },
    { title: 'Upcoming Bookings', value: stats?.upcomingBookings || 0, icon: <Clock size={22} />, color: '#d97706', bg: '#fffbeb' },
    { title: 'Completed Bookings', value: stats?.completedBookings || 0, icon: <CalendarCheck size={22} />, color: '#0d9488', bg: '#f0fdfa' }
  ];

  return (
    <div>
      <PageHeader
        title={`${stats?.companyName || 'Company Portal'}`}
        subtitle="Manage catalog services, staff, gallery portfolio and active operations."
        extra={
          <AppButton type="primary" icon={<Plus size={16} />} onClick={() => navigate(ROUTES.COMPANY_ADD_SERVICE)}>
            Add New Service
          </AppButton>
        }
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {statCards.map((card, idx) => (
          <Col xs={24} sm={12} lg={4} key={idx}>
            <Card bordered={false} bodyStyle={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text type="secondary" style={{ fontSize: 11 }}>{card.title}</Text>
                  <Title level={4} style={{ margin: '2px 0 0', fontWeight: 700 }}>
                    {card.value}
                  </Title>
                </div>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: card.bg, color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {card.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="Customer Rating & Feedback" bordered={false}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ textAlign: 'center', padding: '12px 24px', background: '#fffbeb', borderRadius: 12, border: '1px solid #fef3c7' }}>
                <Title level={2} style={{ margin: 0, color: '#b45309' }}>
                  {stats?.averageRating ? stats.averageRating.toFixed(1) : '5.0'}
                </Title>
                <Rate disabled defaultValue={stats?.averageRating || 5} style={{ fontSize: 14 }} />
                <Text type="secondary" style={{ display: 'block', fontSize: 12, marginTop: 4 }}>
                  Based on {stats?.totalReviews || 0} reviews
                </Text>
              </div>

              <div>
                <Text strong style={{ display: 'block', marginBottom: 4 }}>Service Provider Standing</Text>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  Your company rating reflects customer satisfaction across completed home care and maintenance services.
                </Text>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="Quick Management Actions" bordered={false}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <AppButton type="primary" icon={<Briefcase size={16} />} onClick={() => navigate(ROUTES.COMPANY_SERVICES)}>
                Manage Services
              </AppButton>
              <AppButton icon={<Users size={16} />} onClick={() => navigate(ROUTES.COMPANY_EMPLOYEES)}>
                Manage Staff
              </AppButton>
              <AppButton icon={<Eye size={16} />} onClick={() => navigate(ROUTES.COMPANY_PROFILE)}>
                View Profile
              </AppButton>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CompanyDashboardPage;
