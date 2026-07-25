import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Typography, Tag, message } from 'antd';
import { DollarSign, Briefcase, CheckCircle, Star } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import SkeletonCard from '../../components/common/SkeletonCard';
import AnnouncementBanner from '../../components/common/AnnouncementBanner';
import Footer from '../../layouts/Footer';
import { analyticsService } from '../../services/analytics.service';

const { Title, Text } = Typography;

const CompanyAnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyAnalytics = async () => {
      setLoading(true);
      try {
        const res = await analyticsService.getCompanyAnalytics();
        if (res.success) setData(res.data);
      } catch (err) {
        message.error(err.message || 'Failed to load company analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchCompanyAnalytics();
  }, []);

  if (loading || !data) {
    return (
      <div>
        <PageHeader title="Provider Business Performance" subtitle="Loading..." />
        <SkeletonCard rows={6} />
      </div>
    );
  }

  const columns = [
    {
      title: 'Top Service Offering',
      dataIndex: 'service_name',
      key: 'service_name',
      render: text => <strong>{text}</strong>
    },
    {
      title: 'Total Bookings',
      dataIndex: 'total_bookings',
      key: 'total_bookings'
    },
    {
      title: 'Gross Revenue Generated',
      dataIndex: 'revenue',
      key: 'revenue',
      render: r => <strong style={{ color: '#16a34a' }}>${Number(r || 0).toFixed(2)}</strong>
    }
  ];

  return (
    <div>
      <AnnouncementBanner />
      <PageHeader
        title="Provider Business Performance & Analytics"
        subtitle="Track company revenue, job completion efficiency, and top grossing service packages."
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 16, background: '#eff6ff' }}>
            <Statistic
              title={<span style={{ color: '#1e40af' }}>Total Gross Revenue</span>}
              value={data.total_revenue}
              precision={2}
              prefix="$"
              valueStyle={{ color: '#1e3a8a', fontWeight: 800 }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 16, background: '#f0fdf4' }}>
            <Statistic
              title={<span style={{ color: '#166534' }}>Completed Jobs</span>}
              value={data.completed_bookings}
              suffix={`/ ${data.total_bookings}`}
              valueStyle={{ color: '#14532d', fontWeight: 800 }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 16, background: '#fefce8' }}>
            <Statistic
              title={<span style={{ color: '#854d0e' }}>Average Customer Rating</span>}
              value={data.average_rating}
              precision={2}
              prefix={<Star size={18} style={{ color: '#eab308', marginRight: 4 }} />}
              suffix="/ 5.0"
              valueStyle={{ color: '#713f12', fontWeight: 800 }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 16, background: '#faf5ff' }}>
            <Statistic
              title={<span style={{ color: '#6b21a8' }}>Total Customer Reviews</span>}
              value={data.total_reviews}
              valueStyle={{ color: '#581c87', fontWeight: 800 }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Top Grossing Service Offerings" bordered={false} style={{ borderRadius: 16 }}>
        <Table columns={columns} dataSource={data.top_services} rowKey="service_name" pagination={false} />
      </Card>

      <Footer />
    </div>
  );
};

export default CompanyAnalyticsPage;
