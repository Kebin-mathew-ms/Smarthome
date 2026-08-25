import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Tag, Table, App as AntApp } from 'antd';
import { Users, Briefcase, CalendarCheck, Layers, ShieldCheck, UserPlus, CheckCircle2, Clock } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import SkeletonCard from '../../components/common/SkeletonCard';
import StatusBadge from '../../components/common/StatusBadge';
import { adminService } from '../../services/admin.service';
import { formatDate } from '../../utils/formatters';

const { Title, Text } = Typography;

const AdminDashboardPage = () => {
  const { message } = AntApp.useApp();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      setLoading(true);
      try {
        const res = await adminService.getDashboardStats();
        if (res.success) {
          setStats(res.data);
        }
      } catch (err) {
        message.error(err.message || 'Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div>
        <PageHeader title="Admin Command Center" subtitle="Loading metrics..." />
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
    { title: 'Total Homeowners', value: stats?.totalCustomers || 0, icon: <Users size={22} />, color: '#9333ea', bg: '#faf5ff' },
    { title: 'Total Volunteers', value: stats?.totalVolunteers || 0, icon: <ShieldCheck size={22} />, color: '#2563eb', bg: '#eff6ff' },
    { title: 'Total Bookings', value: stats?.totalBookings || 0, icon: <CalendarCheck size={22} />, color: '#16a34a', bg: '#f0fdf4' },
    { title: 'Total Services', value: stats?.totalServices || 0, icon: <Briefcase size={22} />, color: '#d97706', bg: '#fffbeb' },
    { title: 'Categories', value: stats?.totalCategories || 0, icon: <Layers size={22} />, color: '#0284c7', bg: '#f0f9ff' },
    { title: 'Subcategories', value: stats?.totalSubcategories || 0, icon: <CheckCircle2 size={22} />, color: '#0d9488', bg: '#f0fdfa' },
    { title: "Today's Registrations", value: stats?.todayRegistrations || 0, icon: <UserPlus size={22} />, color: '#ea580c', bg: '#fff7ed' },
    { title: 'Pending Bookings', value: stats?.recentBookings?.filter(b => b.status === 'pending').length || 0, icon: <Clock size={22} />, color: '#dc2626', bg: '#fef2f2' },
  ];

  const recentBookingColumns = [
    { title: 'Customer', dataIndex: 'customer_name', key: 'customer_name', render: text => <strong style={{ color: '#2563eb' }}>{text}</strong> },
    { title: 'Service', dataIndex: 'service_name', key: 'service_name' },
    { title: 'Status', dataIndex: 'status', key: 'status', render: status => <StatusBadge status={status} /> },
    { title: 'Date', dataIndex: 'created_at', key: 'created_at', render: date => formatDate(date) }
  ];

  const recentUserColumns = [
    { title: 'Name', key: 'name', render: (_, r) => `${r.first_name} ${r.last_name}` },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Role', dataIndex: 'role', key: 'role', render: r => <Tag color="blue">{r}</Tag> },
    { title: 'Status', dataIndex: 'status', key: 'status', render: s => <StatusBadge status={s} /> }
  ];

  return (
    <div>
      <PageHeader
        title="Admin Command Center"
        subtitle="Platform-wide monitoring, booking management and analytics."
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {statCards.map((card, idx) => (
          <Col xs={24} sm={12} md={6} key={idx}>
            <Card variant="borderless" styles={{ body: { padding: 20 } }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>{card.title}</Text>
                  <Title level={3} style={{ margin: '4px 0 0', fontWeight: 700 }}>
                    {card.value}
                  </Title>
                </div>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: card.bg, color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {card.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24}>
          <Card title="Recent Bookings" variant="borderless">
            <Table
              columns={recentBookingColumns}
              dataSource={stats?.recentBookings || []}
              rowKey="id"
              pagination={false}
              size="small"
              locale={{ emptyText: 'No bookings yet' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card title="Recent Platform Users" variant="borderless">
            <Table
              columns={recentUserColumns}
              dataSource={stats?.recentUsers || []}
              rowKey="id"
              pagination={false}
              size="small"
              locale={{ emptyText: 'No users yet' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboardPage;
