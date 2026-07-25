import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Progress, Typography, Table, Tag, message } from 'antd';
import { DollarSign, TrendingUp, Building2, Users, Calendar, Star, Ticket, CheckCircle2 } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import SkeletonCard from '../../components/common/SkeletonCard';
import AnnouncementBanner from '../../components/common/AnnouncementBanner';
import Footer from '../../layouts/Footer';
import { analyticsService } from '../../services/analytics.service';

const { Title, Text } = Typography;

const AnalyticsDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await analyticsService.getAdminAnalytics();
        if (res.success) setData(res.data);
      } catch (err) {
        message.error(err.message || 'Failed to load platform analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return (
      <div>
        <PageHeader title="Platform Business Intelligence" subtitle="Loading..." />
        <SkeletonCard rows={8} />
      </div>
    );
  }

  return (
    <div>
      <AnnouncementBanner />
      <PageHeader
        title="Platform Business Intelligence & Analytics"
        subtitle="Executive overview of gross platform revenue, company provider counts, CSAT %, and complaint resolution rates."
      />

      {/* Financial KPIs */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 16, background: '#eff6ff' }}>
            <Statistic
              title={<span style={{ color: '#1e40af', fontWeight: 600 }}>Total Revenue</span>}
              value={data.total_revenue}
              precision={2}
              prefix={<DollarSign size={20} style={{ color: '#2563eb', marginRight: 4 }} />}
              valueStyle={{ color: '#1e3a8a', fontWeight: 800 }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 16, background: '#f0fdf4' }}>
            <Statistic
              title={<span style={{ color: '#166534', fontWeight: 600 }}>Monthly Revenue (30 Days)</span>}
              value={data.monthly_revenue}
              precision={2}
              prefix={<TrendingUp size={20} style={{ color: '#16a34a', marginRight: 4 }} />}
              valueStyle={{ color: '#14532d', fontWeight: 800 }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 16, background: '#fefce8' }}>
            <Statistic
              title={<span style={{ color: '#854d0e', fontWeight: 600 }}>Average Booking Value</span>}
              value={data.avg_booking_value}
              precision={2}
              prefix="$"
              valueStyle={{ color: '#713f12', fontWeight: 800 }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 16, background: '#faf5ff' }}>
            <Statistic
              title={<span style={{ color: '#6b21a8', fontWeight: 600 }}>CSAT Average Rating</span>}
              value={data.avg_company_rating}
              precision={2}
              prefix={<Star size={20} style={{ color: '#eab308', marginRight: 4 }} />}
              suffix="/ 5.0"
              valueStyle={{ color: '#581c87', fontWeight: 800 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Operational Stats & Resolution Progress */}
      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={12}>
          <Card title="Provider Companies & Customer Base" bordered={false} style={{ borderRadius: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>Active Provider Companies</Text>
                <Title level={3} style={{ margin: 0, color: '#2563eb' }}>{data.active_companies} / {data.total_companies}</Title>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>Total Registered Customers</Text>
                <Title level={3} style={{ margin: 0, color: '#16a34a' }}>{data.total_customers}</Title>
              </div>
            </div>
            <Progress percent={data.total_companies ? Math.round((data.active_companies / data.total_companies) * 100) : 0} status="active" />
            <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 8 }}>
              {data.pending_companies} provider applications pending review.
            </Text>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="Support Complaints Resolution Rate" bordered={false} style={{ borderRadius: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>Total Tickets Logged</Text>
                <Title level={3} style={{ margin: 0 }}>{data.total_complaints}</Title>
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>Resolution Efficiency</Text>
                <Title level={3} style={{ margin: 0, color: '#16a34a' }}>{data.complaint_resolution_rate}%</Title>
              </div>
            </div>
            <Progress percent={data.complaint_resolution_rate} strokeColor="#16a34a" />
          </Card>
        </Col>
      </Row>

      <Footer />
    </div>
  );
};

export default AnalyticsDashboardPage;
