import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Input, Typography, Button, Rate, Tag, Space, message } from 'antd';
import { Search, Building2, Layers, Star, ShieldCheck, Wrench, ArrowRight, CheckCircle2, Award, Clock } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import Footer from '../../layouts/Footer';
import SkeletonCard from '../../components/common/SkeletonCard';
import StatusBadge from '../../components/common/StatusBadge';
import { customerService } from '../../services/customer.service';
import { ROUTES } from '../../constants/routes';

const { Title, Text, Paragraph } = Typography;

const LandingPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchLanding = async () => {
      setLoading(true);
      try {
        const res = await customerService.getLandingData();
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        message.error(err.message || 'Failed to load marketplace landing');
      } finally {
        setLoading(false);
      }
    };
    fetchLanding();
  }, []);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/companies?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate(ROUTES.COMPANIES);
    }
  };

  return (
    <div>
      {/* Hero Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderRadius: 20,
          padding: '64px 32px',
          color: '#ffffff',
          marginBottom: 40,
          boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.3)'
        }}
      >
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <Tag color="blue" style={{ fontSize: 13, padding: '4px 12px', borderRadius: 999, marginBottom: 16 }}>
            Multi-Company Smart Home Care Marketplace
          </Tag>
          <Title level={1} style={{ color: '#ffffff', fontSize: 42, fontWeight: 800, margin: '0 0 16px', tracking: '-0.02em' }}>
            Find Certified Service Companies for Every Home Care Need
          </Title>
          <Text style={{ color: '#94a3b8', fontSize: 18, display: 'block', marginBottom: 32 }}>
            Browse top-rated companies, explore their complete service offerings, compare provider ratings, and request expert maintenance.
          </Text>

          <div style={{ background: '#ffffff', padding: 8, borderRadius: 16, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', display: 'flex', gap: 8 }}>
            <Input
              size="large"
              variant="borderless"
              prefix={<Search size={20} style={{ color: '#94a3b8', marginRight: 8 }} />}
              placeholder="Search companies, city, district or service categories..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onPressEnter={handleSearch}
              style={{ fontSize: 16 }}
            />
            <Button type="primary" size="large" onClick={handleSearch} style={{ height: 48, padding: '0 32px', borderRadius: 12, fontWeight: 700 }}>
              Search Providers
            </Button>
          </div>
        </div>
      </div>

      {/* Popular Categories */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <Title level={3} style={{ margin: 0, fontWeight: 700 }}>Explore Service Categories</Title>
            <Text type="secondary">Find specialized companies by trade</Text>
          </div>
          <Link to={ROUTES.CATEGORIES}>
            <Button type="link" style={{ fontWeight: 600, color: '#2563eb' }}>
              View All Categories <ArrowRight size={16} style={{ marginLeft: 4 }} />
            </Button>
          </Link>
        </div>

        <Row gutter={[16, 16]}>
          {data?.categories?.slice(0, 4).map(cat => (
            <Col xs={24} sm={12} md={6} key={cat.id}>
              <Card
                hoverable
                variant="borderless"
                onClick={() => navigate(`/companies?category=${cat.id}`)}
                styles={{ body: { padding: 24, textAlign: 'center' } }}
              >
                <div style={{ width: 56, height: 56, borderRadius: 16, background: '#eff6ff', color: '#2563eb', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <Layers size={28} />
                </div>
                <Title level={5} style={{ margin: '0 0 4px', fontWeight: 700 }}>{cat.category_name}</Title>
                <Text type="secondary" style={{ fontSize: 13 }}>{cat.description || 'Professional provider companies'}</Text>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Featured Companies */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <Title level={3} style={{ margin: 0, fontWeight: 700 }}>Featured Service Companies</Title>
            <Text type="secondary">Top-rated certified service provider companies ready to assist you</Text>
          </div>
          <Link to={ROUTES.COMPANIES}>
            <Button type="link" style={{ fontWeight: 600, color: '#2563eb' }}>
              Browse All Companies <ArrowRight size={16} style={{ marginLeft: 4 }} />
            </Button>
          </Link>
        </div>

        <Row gutter={[20, 20]}>
          {data?.featuredCompanies?.map(comp => (
            <Col xs={24} sm={12} lg={8} key={comp.id}>
              <Card
                hoverable
                variant="borderless"
                onClick={() => navigate(`/companies/${comp.id}`)}
                styles={{ body: { padding: 20 } }}
              >
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 12, background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Building2 size={26} />
                  </div>
                  <div>
                    <Title level={5} style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>
                      {comp.company_name}
                    </Title>
                    <Text type="secondary" style={{ fontSize: 12 }}>{comp.city}, {comp.state}</Text>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Star size={16} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                    <strong style={{ fontSize: 14 }}>{Number(comp.average_rating).toFixed(1)}</strong>
                    <Text type="secondary" style={{ fontSize: 12 }}>({comp.total_reviews} reviews)</Text>
                  </div>

                  {comp.emergency_service && (
                    <Tag color="volcano" style={{ fontSize: 11 }}>24/7 Emergency</Tag>
                  )}
                </div>

                <Button type="primary" block style={{ borderRadius: 8, fontWeight: 600 }}>
                  View Company & Services
                </Button>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Popular Services Showcase */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0, fontWeight: 700 }}>Popular Service Offerings</Title>
          <Text type="secondary">Frequently requested home care services across companies</Text>
        </div>

        <Row gutter={[20, 20]}>
          {data?.popularServices?.map(serv => (
            <Col xs={24} sm={12} lg={8} key={serv.id}>
              <Card
                hoverable
                variant="borderless"
                onClick={() => navigate(`/services/${serv.id}`)}
                styles={{ body: { padding: 20 } }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <Tag color="blue">{serv.category_name}</Tag>
                  <strong style={{ color: '#16a34a', fontSize: 16 }}>${Number(serv.starting_price).toFixed(2)}</strong>
                </div>

                <Title level={5} style={{ margin: '0 0 8px', fontWeight: 700 }}>{serv.service_name}</Title>
                <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 16 }}>
                  Provided by <strong>{serv.company_name}</strong> ({serv.city})
                </Text>

                <Button type="default" block style={{ borderRadius: 8 }}>
                  View Service Details
                </Button>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Why Choose Us */}
      <Card variant="borderless" style={{ background: '#f8fafc', padding: 24, borderRadius: 16, marginBottom: 48 }}>
        <Title level={3} style={{ textAlign: 'center', margin: '0 0 32px', fontWeight: 700 }}>Why Choose Smart Home Care Marketplace?</Title>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8} style={{ textAlign: 'center' }}>
            <ShieldCheck size={36} style={{ color: '#2563eb', marginBottom: 12 }} />
            <Title level={5} style={{ margin: '0 0 8px' }}>Verified Companies</Title>
            <Text type="secondary">All service companies are thoroughly vetted, licensed and compliance checked.</Text>
          </Col>

          <Col xs={24} md={8} style={{ textAlign: 'center' }}>
            <Award size={36} style={{ color: '#16a34a', marginBottom: 12 }} />
            <Title level={5} style={{ margin: '0 0 8px' }}>Transparent Ratings</Title>
            <Text type="secondary">Real customer reviews and ratings help you compare top service providers in your city.</Text>
          </Col>

          <Col xs={24} md={8} style={{ textAlign: 'center' }}>
            <Clock size={36} style={{ color: '#9333ea', marginBottom: 12 }} />
            <Title level={5} style={{ margin: '0 0 8px' }}>24/7 Availability</Title>
            <Text type="secondary">Access emergency plumbing, electrical, and heating repair services anytime.</Text>
          </Col>
        </Row>
      </Card>

      <Footer />
    </div>
  );
};

export default LandingPage;
