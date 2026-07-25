import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Tabs, Typography, message } from 'antd';
import { Clock, Building2, Briefcase, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import SkeletonCard from '../../components/common/SkeletonCard';
import Footer from '../../layouts/Footer';
import { customerService } from '../../services/customer.service';
import { formatDate } from '../../utils/formatters';

const { Title, Text } = Typography;

const RecentlyViewedPage = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState({ companies: [], services: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await customerService.getRecentlyViewed();
        if (res.success) {
          setHistory(res.data);
        }
      } catch (err) {
        message.error(err.message || 'Failed to fetch recently viewed history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const CompaniesTab = (
    <Row gutter={[20, 20]}>
      {history.companies.map(item => (
        <Col xs={24} sm={12} lg={8} key={item.history_id}>
          <Card
            hoverable
            bordered={false}
            onClick={() => navigate(`/companies/${item.company_id}`)}
            bodyStyle={{ padding: 20 }}
          >
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                {item.company_name.charAt(0)}
              </div>
              <div>
                <Title level={5} style={{ margin: 0, fontWeight: 700 }}>{item.company_name}</Title>
                <Text type="secondary" style={{ fontSize: 12 }}>{item.city}, {item.state}</Text>
              </div>
            </div>
            <Text type="secondary" style={{ fontSize: 11 }}>Viewed on {formatDate(item.viewed_at)}</Text>
          </Card>
        </Col>
      ))}

      {history.companies.length === 0 && (
        <Col span={24}>
          <Card bordered={false} style={{ textAlign: 'center', padding: '40px 0' }}>
            <Clock size={40} style={{ color: '#94a3b8', marginBottom: 12 }} />
            <Title level={5}>No Recently Viewed Companies</Title>
          </Card>
        </Col>
      )}
    </Row>
  );

  const ServicesTab = (
    <Row gutter={[20, 20]}>
      {history.services.map(item => (
        <Col xs={24} sm={12} lg={8} key={item.history_id}>
          <Card
            hoverable
            bordered={false}
            onClick={() => navigate(`/services/${item.service_id}`)}
            bodyStyle={{ padding: 20 }}
          >
            <Title level={5} style={{ margin: '0 0 4px', fontWeight: 700 }}>{item.service_name}</Title>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
              {item.company_name} ({item.category_name})
            </Text>
            <strong style={{ color: '#16a34a', fontSize: 16 }}>${Number(item.starting_price).toFixed(2)}</strong>
            <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 8 }}>Viewed on {formatDate(item.viewed_at)}</Text>
          </Card>
        </Col>
      ))}

      {history.services.length === 0 && (
        <Col span={24}>
          <Card bordered={false} style={{ textAlign: 'center', padding: '40px 0' }}>
            <Clock size={40} style={{ color: '#94a3b8', marginBottom: 12 }} />
            <Title level={5}>No Recently Viewed Services</Title>
          </Card>
        </Col>
      )}
    </Row>
  );

  const items = [
    { key: 'companies', label: `Viewed Companies (${history.companies.length})`, children: CompaniesTab },
    { key: 'services', label: `Viewed Services (${history.services.length})`, children: ServicesTab }
  ];

  return (
    <div>
      <PageHeader
        title="Recently Viewed History"
        subtitle="Track service provider companies and listings you previously inspected."
      />

      {loading ? (
        <SkeletonCard rows={6} />
      ) : (
        <Tabs defaultActiveKey="companies" items={items} size="large" style={{ background: '#ffffff', padding: 24, borderRadius: 16 }} />
      )}

      <Footer />
    </div>
  );
};

export default RecentlyViewedPage;
