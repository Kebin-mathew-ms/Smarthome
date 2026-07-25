import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Tag, Progress, Typography, Button, message } from 'antd';
import { Activity, Cpu, HardDrive, RefreshCw, CheckCircle, Server } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import SkeletonCard from '../../components/common/SkeletonCard';
import Footer from '../../layouts/Footer';
import { analyticsService } from '../../services/analytics.service';

const { Title, Text } = Typography;

const SystemHealthPage = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTelemetry = async () => {
    setLoading(true);
    try {
      const res = await analyticsService.getSystemHealth();
      if (res.success) setHealth(res.data);
    } catch (err) {
      message.error(err.message || 'Failed to fetch system telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !health) {
    return (
      <div>
        <PageHeader title="System Telemetry & Health" subtitle="Loading..." />
        <SkeletonCard rows={6} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="System Telemetry & Infrastructure Health"
        subtitle="Real-time monitoring of Node process memory, application uptime, MySQL DB pool status, and Socket.IO engine."
        extra={<Button icon={<RefreshCw size={14} />} onClick={fetchTelemetry}>Refresh Telemetry</Button>}
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 16, background: '#f0fdf4' }}>
            <Statistic
              title={<span style={{ color: '#166534' }}>REST API Status</span>}
              value={health.apiStatus}
              prefix={<CheckCircle size={20} style={{ color: '#16a34a', marginRight: 4 }} />}
              valueStyle={{ color: '#14532d', fontWeight: 800 }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 16, background: '#eff6ff' }}>
            <Statistic
              title={<span style={{ color: '#1e40af' }}>Socket.IO Engine</span>}
              value={health.socketStatus}
              prefix={<Activity size={20} style={{ color: '#2563eb', marginRight: 4 }} />}
              valueStyle={{ color: '#1e3a8a', fontWeight: 800 }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 16, background: '#fefce8' }}>
            <Statistic
              title={<span style={{ color: '#854d0e' }}>MySQL Database Pool</span>}
              value={health.databaseStatus}
              prefix={<Server size={20} style={{ color: '#ca8a04', marginRight: 4 }} />}
              valueStyle={{ color: '#713f12', fontWeight: 800 }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} style={{ borderRadius: 16, background: '#faf5ff' }}>
            <Statistic
              title={<span style={{ color: '#6b21a8' }}>Application Uptime</span>}
              value={health.processUptime}
              valueStyle={{ color: '#581c87', fontWeight: 800, fontSize: 18 }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[20, 20]}>
        <Col xs={24} md={12}>
          <Card title="Node.js Process Memory Telemetry" bordered={false} style={{ borderRadius: 16 }}>
            <div style={{ marginBottom: 12 }}><strong>RSS Memory:</strong> {health.memoryUsage.rss}</div>
            <div style={{ marginBottom: 12 }}><strong>Heap Total:</strong> {health.memoryUsage.heapTotal}</div>
            <div style={{ marginBottom: 12 }}><strong>Heap Used:</strong> {health.memoryUsage.heapUsed}</div>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="Host Server Hardware Telemetry" bordered={false} style={{ borderRadius: 16 }}>
            <div style={{ marginBottom: 12 }}><strong>Platform:</strong> {health.systemOS.platform}</div>
            <div style={{ marginBottom: 12 }}><strong>CPU Cores:</strong> {health.systemOS.cpus} Cores</div>
            <div style={{ marginBottom: 12 }}><strong>Host System Memory:</strong> {health.systemOS.freeMemory} free of {health.systemOS.totalMemory}</div>
          </Card>
        </Col>
      </Row>

      <Footer />
    </div>
  );
};

export default SystemHealthPage;
