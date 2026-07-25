import React from 'react';
import { Row, Col, Typography, Card, Statistic, Tag, Button, Space } from 'antd';
import { Building2, Layers, Users, ShieldCheck, ArrowUpRight, Activity } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import PageHeader from '../../components/common/PageHeader';
import { ROLES } from '../../constants/roles';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

const { Title, Text } = Typography;

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.first_name || 'User'}!`}
        subtitle="Overview of your Smart Home Care & Maintenance Service System platform."
        extra={
          <Tag color="blue" style={{ fontSize: 13, padding: '4px 12px' }}>
            System Status: Active
          </Tag>
        }
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" styles={{ body: { padding: 20 } }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text type="secondary" style={{ fontSize: 13 }}>Total Companies</Text>
                <Title level={3} style={{ margin: '4px 0 0', fontWeight: 700 }}>
                  24
                </Title>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={22} />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" styles={{ body: { padding: 20 } }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text type="secondary" style={{ fontSize: 13 }}>Service Categories</Text>
                <Title level={3} style={{ margin: '4px 0 0', fontWeight: 700 }}>
                  12
                </Title>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Layers size={22} />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" styles={{ body: { padding: 20 } }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text type="secondary" style={{ fontSize: 13 }}>Registered Users</Text>
                <Title level={3} style={{ margin: '4px 0 0', fontWeight: 700 }}>
                  158
                </Title>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#faf5ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={22} />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" styles={{ body: { padding: 20 } }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text type="secondary" style={{ fontSize: 13 }}>Security & RBAC</Text>
                <Title level={3} style={{ margin: '4px 0 0', fontWeight: 700 }}>
                  100%
                </Title>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={22} />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={14}>
          <Card title="Role Access Details" variant="borderless">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ padding: 16, borderRadius: 8, background: 'rgba(37, 99, 235, 0.05)', border: '1px solid rgba(37, 99, 235, 0.1)' }}>
                <Text strong style={{ fontSize: 15 }}>Logged in Role: {user?.role}</Text>
                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 14 }}>
                  {user?.role === ROLES.ADMIN && 'Full administrative rights. You can create/edit companies, categories, and manage users.'}
                  {user?.role === ROLES.COMPANY && 'Company portal access. You can manage your company profile and services.'}
                  {user?.role === ROLES.USER && 'Homeowner customer account. You can view available services and request home maintenance.'}
                </p>
              </div>

              {user?.role === ROLES.ADMIN && (
                <Space wrap>
                  <Button type="primary" icon={<Building2 size={16} />} onClick={() => navigate(ROUTES.COMPANIES)}>
                    Manage Companies
                  </Button>
                  <Button icon={<Layers size={16} />} onClick={() => navigate(ROUTES.CATEGORIES)}>
                    Manage Categories
                  </Button>
                </Space>
              )}
            </div>
          </Card>
        </Col>

        <Col xs={24} md={10}>
          <Card title="System Activity Log" variant="borderless">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14 }}>
                <Activity size={18} style={{ color: '#10b981' }} />
                <span>JWT Authentication System Ready</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14 }}>
                <Activity size={18} style={{ color: '#10b981' }} />
                <span>MySQL Connection Pool Active</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14 }}>
                <Activity size={18} style={{ color: '#10b981' }} />
                <span>Express Validator & Helmet Enforced</span>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
