import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Button, Tag, Space, Typography, message } from 'antd';
import { Briefcase, Calendar, CheckCircle2, Clock, MapPin, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import SkeletonCard from '../../components/common/SkeletonCard';
import StatusBadge from '../../components/common/StatusBadge';
import Footer from '../../layouts/Footer';
import { employeeService } from '../../services/employee.service';

const { Title, Text } = Typography;

const EmployeeDashboardPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await employeeService.getDashboard();
      if (res.success) setData(res.data);
    } catch (err) {
      message.error(err.message || 'Failed to load technician dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading || !data) {
    return (
      <div>
        <PageHeader title="Field Technician Dashboard" subtitle="Loading..." />
        <SkeletonCard rows={6} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Welcome, ${data.employee.employee_name}`}
        subtitle={`Designation: ${data.employee.designation} | Provider: ${data.employee.company_name}`}
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 16, background: '#eff6ff' }}>
            <Statistic title={<span style={{ color: '#1e40af' }}>Today's Jobs</span>} value={data.metrics.todayJobsCount} valueStyle={{ color: '#1e3a8a', fontWeight: 800 }} />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 16, background: '#f0fdf4' }}>
            <Statistic title={<span style={{ color: '#166534' }}>Active Jobs</span>} value={data.metrics.activeCount} valueStyle={{ color: '#14532d', fontWeight: 800 }} />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 16, background: '#fefce8' }}>
            <Statistic title={<span style={{ color: '#854d0e' }}>Completed Jobs</span>} value={data.metrics.completedCount} valueStyle={{ color: '#713f12', fontWeight: 800 }} />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 16, background: '#faf5ff' }}>
            <Statistic title={<span style={{ color: '#6b21a8' }}>Total Assigned</span>} value={data.metrics.totalAssigned} valueStyle={{ color: '#581c87', fontWeight: 800 }} />
          </Card>
        </Col>
      </Row>

      <Title level={4}>Today's Field Assignments</Title>

      <Row gutter={[16, 16]}>
        {data.todayJobs.map(job => (
          <Col xs={24} sm={12} key={job.id}>
            <Card
              hoverable
              onClick={() => navigate(`/employee/bookings/${job.id}`)}
              style={{ borderRadius: 16, border: '1px solid #e2e8f0' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <strong style={{ color: '#2563eb' }}>#{job.booking_number}</strong>
                <StatusBadge status={job.booking_status} />
              </div>

              <Title level={5} style={{ margin: '4px 0' }}>{job.service_name}</Title>
              <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 12 }}>
                Customer: {job.customer_name} ({job.customer_phone})
              </Text>

              <div style={{ padding: 10, background: '#f8fafc', borderRadius: 8, fontSize: 12 }}>
                <Clock size={14} style={{ marginRight: 6, color: '#64748b' }} /> {job.scheduled_time}
              </div>
            </Card>
          </Col>
        ))}

        {data.todayJobs.length === 0 && (
          <Col span={24}>
            <Card bordered={false} style={{ textAlign: 'center', padding: '30px 0' }}>
              <Text type="secondary">No field assignments scheduled for today.</Text>
            </Card>
          </Col>
        )}
      </Row>

      <Footer />
    </div>
  );
};

export default EmployeeDashboardPage;
