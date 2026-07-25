import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Typography, Tag, Space, Descriptions, Table, Button, Collapse, message } from 'antd';
import { Briefcase, Building2, Star, Clock, CheckCircle2, ShieldCheck, ArrowLeft, Heart, Layers } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import AppButton from '../../components/common/AppButton';
import AppBreadcrumb from '../../components/common/AppBreadcrumb';
import SkeletonCard from '../../components/common/SkeletonCard';
import StatusBadge from '../../components/common/StatusBadge';
import Footer from '../../layouts/Footer';
import { customerService } from '../../services/customer.service';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routes';

const { Title, Text, Paragraph } = Typography;

const CustomerServiceDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    const fetchService = async () => {
      setLoading(true);
      try {
        const res = await customerService.getServiceById(id);
        if (res.success) {
          setService(res.data);
        }
      } catch (err) {
        message.error(err.message || 'Failed to load service details');
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [id]);

  const handleToggleFavorite = async () => {
    if (!user) {
      message.info('Please sign in to save services to your favorites.');
      navigate(ROUTES.LOGIN);
      return;
    }

    try {
      if (isFavorited) {
        setIsFavorited(false);
        message.success('Service removed from favorites');
      } else {
        await customerService.addFavorite({ serviceId: id });
        setIsFavorited(true);
        message.success('Service saved to favorites');
      }
    } catch (err) {
      message.error(err.message || 'Favorite action failed');
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="Service Details" subtitle="Loading..." />
        <SkeletonCard rows={8} />
      </div>
    );
  }

  if (!service) {
    return (
      <div>
        <PageHeader title="Service Not Found" />
        <Button onClick={() => navigate(ROUTES.COMPANIES)}>Back to Marketplace</Button>
      </div>
    );
  }

  const breadcrumbItems = [
    { title: 'Marketplace', path: ROUTES.COMPANIES },
    { title: service.company_name, path: `/companies/${service.company_id}` },
    { title: service.service_name }
  ];

  return (
    <div>
      <AppBreadcrumb items={breadcrumbItems} />

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          {/* Main Service Overview Card */}
          <Card bordered={false} style={{ marginBottom: 24, borderRadius: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <Space style={{ marginBottom: 8 }}>
                  <Tag color="blue">{service.category_name}</Tag>
                  <Tag color="geekblue">{service.subcategory_name}</Tag>
                </Space>
                <Title level={2} style={{ margin: '4px 0 8px', fontWeight: 800 }}>{service.service_name}</Title>
                <Text type="secondary" style={{ fontSize: 14 }}>{service.short_description}</Text>
              </div>

              <Button
                icon={<Heart size={16} style={{ color: isFavorited ? '#ef4444' : undefined, fill: isFavorited ? '#ef4444' : 'none' }} />}
                onClick={handleToggleFavorite}
              >
                {isFavorited ? 'Saved' : 'Save'}
              </Button>
            </div>

            <div style={{ marginTop: 24, padding: 16, background: '#f8fafc', borderRadius: 12, display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Starting Price</Text>
                <strong style={{ color: '#16a34a', fontSize: 24 }}>${Number(service.starting_price).toFixed(2)}</strong>
              </div>

              <div>
                <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Estimated Duration</Text>
                <strong style={{ fontSize: 16, color: '#0f172a' }}>{service.estimated_duration || 'N/A'}</strong>
              </div>

              <div>
                <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Service Type</Text>
                <Tag color="purple">{service.service_type}</Tag>
              </div>
            </div>

            <div style={{ marginTop: 24 }}>
              <Title level={4} style={{ fontWeight: 700 }}>Service Specification & Scope</Title>
              <Paragraph style={{ fontSize: 15, lineHeight: 1.7 }}>
                {service.full_description || 'Full professional home care service provided by certified company technicians.'}
              </Paragraph>
            </div>

            {service.features && service.features.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <Title level={4} style={{ fontWeight: 700 }}>Included Features & Checklist</Title>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 12 }}>
                  {service.features.map((f, i) => (
                    <Tag key={i} color="blue" style={{ padding: '6px 14px', fontSize: 13, borderRadius: 8 }}>
                      <CheckCircle2 size={14} style={{ marginRight: 6 }} /> {f.feature_name}
                    </Tag>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Service Package Tiers */}
          {service.packages && service.packages.length > 0 && (
            <Card title="Available Package Options" bordered={false} style={{ marginBottom: 24, borderRadius: 16 }}>
              <Row gutter={[16, 16]}>
                {service.packages.map(pkg => (
                  <Col xs={24} sm={12} key={pkg.id}>
                    <Card type="inner" title={<strong style={{ color: '#2563eb' }}>{pkg.package_name}</strong>} extra={<strong style={{ color: '#16a34a', fontSize: 18 }}>${Number(pkg.price).toFixed(2)}</strong>}>
                      <Paragraph type="secondary" style={{ minHeight: 48 }}>{pkg.package_description || 'Standard package option.'}</Paragraph>
                      <Text style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>Duration: {pkg.estimated_duration || 'N/A'}</Text>
                      <Button type="primary" block>Select Package</Button>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          )}

          {/* Service FAQs */}
          {service.faqs && service.faqs.length > 0 && (
            <Card title="Frequently Asked Questions" bordered={false} style={{ marginBottom: 24, borderRadius: 16 }}>
              <Collapse accordion>
                {service.faqs.map(faq => (
                  <Collapse.Panel header={faq.question} key={faq.id}>
                    <Paragraph type="secondary" style={{ margin: 0 }}>{faq.answer}</Paragraph>
                  </Collapse.Panel>
                ))}
              </Collapse>
            </Card>
          )}
        </Col>

        {/* Sidebar Column: Company Card & Actions */}
        <Col xs={24} lg={8}>
          <Card bordered={false} style={{ marginBottom: 24, borderRadius: 16 }}>
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{ width: 64, height: 64, borderRadius: 14, background: '#eff6ff', color: '#2563eb', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 28, marginBottom: 12 }}>
                {service.company_name ? service.company_name.charAt(0) : 'C'}
              </div>

              <Title level={4} style={{ margin: '0 0 4px', fontWeight: 700 }}>{service.company_name}</Title>
              <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 12 }}>{service.city}, {service.state}</Text>

              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginBottom: 16 }}>
                <Star size={16} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                <strong>{Number(service.company_rating).toFixed(1)}</strong>
                <Text type="secondary" style={{ fontSize: 12 }}>({service.company_reviews_count} reviews)</Text>
              </div>

              <Button
                type="default"
                block
                icon={<Building2 size={16} />}
                onClick={() => navigate(`/companies/${service.company_id}`)}
                style={{ marginBottom: 12 }}
              >
                View Full Company Profile
              </Button>

              <Button type="primary" block size="large" style={{ borderRadius: 8, fontWeight: 700 }}>
                Request / Book Service
              </Button>
            </div>
          </Card>

          {/* Related Services from Same Company */}
          {service.relatedServices && service.relatedServices.length > 0 && (
            <Card title={`More from ${service.company_name}`} bordered={false} style={{ borderRadius: 16 }}>
              {service.relatedServices.map(rel => (
                <div key={rel.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div>
                    <Link to={`/services/${rel.id}`} style={{ fontWeight: 600, color: '#0f172a', display: 'block' }}>{rel.service_name}</Link>
                    <Text type="secondary" style={{ fontSize: 12 }}>{rel.estimated_duration || 'Duration N/A'}</Text>
                  </div>
                  <strong style={{ color: '#16a34a' }}>${Number(rel.starting_price).toFixed(2)}</strong>
                </div>
              ))}
            </Card>
          )}
        </Col>
      </Row>

      <Footer />
    </div>
  );
};

export default CustomerServiceDetailsPage;
