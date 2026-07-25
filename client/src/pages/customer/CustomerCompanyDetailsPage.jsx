import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Tabs, Typography, Rate, Tag, Space, Descriptions, Button, Image as AntImage, message } from 'antd';
import { Building2, MapPin, Phone, Mail, Globe, Star, Heart, Bookmark, Users, Briefcase, Clock, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
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

const CustomerCompanyDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const fetchCompany = async () => {
    setLoading(true);
    try {
      const res = await customerService.getCompanyById(id);
      if (res.success) {
        setCompanyData(res.data);
      }
    } catch (err) {
      message.error(err.message || 'Failed to load company marketplace details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, [id]);

  const handleToggleFavorite = async () => {
    if (!user) {
      message.info('Please sign in to add this company to your favorites.');
      navigate(ROUTES.LOGIN);
      return;
    }

    try {
      if (isFavorited) {
        setIsFavorited(false);
        message.success('Company removed from favorites');
      } else {
        await customerService.addFavorite({ companyId: id });
        setIsFavorited(true);
        message.success('Company saved to favorites');
      }
    } catch (err) {
      message.error(err.message || 'Favorite action failed');
    }
  };

  const handleToggleFollow = async () => {
    if (!user) {
      message.info('Please sign in to follow this service provider company.');
      navigate(ROUTES.LOGIN);
      return;
    }

    try {
      if (isFollowing) {
        await customerService.unfollowCompany(id);
        setIsFollowing(false);
        message.success('Unfollowed company');
      } else {
        await customerService.followCompany(id);
        setIsFollowing(true);
        message.success('Following company for updates');
      }
    } catch (err) {
      message.error(err.message || 'Follow action failed');
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="Company Details" subtitle="Loading..." />
        <SkeletonCard rows={8} />
      </div>
    );
  }

  if (!companyData || !companyData.company) {
    return (
      <div>
        <PageHeader title="Company Not Found" />
        <Button onClick={() => navigate(ROUTES.COMPANIES)}>Back to Marketplace Directory</Button>
      </div>
    );
  }

  const { company, services } = companyData;

  const breadcrumbItems = [
    { title: 'Marketplace', path: ROUTES.COMPANIES },
    { title: company.company_name }
  ];

  // Tab 1: Overview
  const OverviewTab = (
    <div>
      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card bordered={false} bodyStyle={{ padding: 20, textAlign: 'center' }}>
            <Briefcase size={28} style={{ color: '#2563eb', marginBottom: 8 }} />
            <Title level={4} style={{ margin: 0 }}>{services ? services.length : 0}</Title>
            <Text type="secondary" style={{ fontSize: 12 }}>Services Offered</Text>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} bodyStyle={{ padding: 20, textAlign: 'center' }}>
            <Star size={28} style={{ color: '#f59e0b', marginBottom: 8 }} />
            <Title level={4} style={{ margin: 0 }}>{Number(company.average_rating).toFixed(1)} / 5.0</Title>
            <Text type="secondary" style={{ fontSize: 12 }}>({company.total_reviews} reviews)</Text>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} bodyStyle={{ padding: 20, textAlign: 'center' }}>
            <Clock size={28} style={{ color: '#16a34a', marginBottom: 8 }} />
            <Title level={4} style={{ margin: 0 }}>&lt; 30 Mins</Title>
            <Text type="secondary" style={{ fontSize: 12 }}>Average Response Time</Text>
          </Card>
        </Col>
      </Row>

      <Card title="About Company Overview" bordered={false}>
        <Paragraph>{company.about_us || company.description || 'Professional home care & maintenance service provider.'}</Paragraph>
      </Card>
    </div>
  );

  // Tab 2: CRITICAL REQUIREMENT — ALL Services of this Company
  const ServicesTab = (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Title level={4} style={{ margin: 0, fontWeight: 700 }}>
          All Services Offered by {company.company_name} ({services ? services.length : 0})
        </Title>
        <Text type="secondary">Select a service to view full packages, duration, and details.</Text>
      </div>

      <Row gutter={[20, 20]}>
        {services && services.map(serv => (
          <Col xs={24} sm={12} lg={8} key={serv.id}>
            <Card
              hoverable
              bordered={false}
              bodyStyle={{ padding: 20 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <Tag color="blue">{serv.category_name}</Tag>
                <Tag color="geekblue" style={{ fontSize: 11 }}>{serv.subcategory_name}</Tag>
              </div>

              <Title level={5} style={{ margin: '0 0 6px', fontWeight: 700 }}>{serv.service_name}</Title>
              <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 12 }}>
                {serv.short_description || 'Certified provider service'}
              </Text>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', marginBottom: 16 }}>
                <div>
                  <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Starting Price</Text>
                  <strong style={{ color: '#16a34a', fontSize: 18 }}>${Number(serv.starting_price).toFixed(2)}</strong>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Duration</Text>
                  <strong style={{ fontSize: 13, color: '#334155' }}>{serv.estimated_duration || 'N/A'}</strong>
                </div>
              </div>

              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Button onClick={() => navigate(`/services/${serv.id}`)}>
                  View Details
                </Button>
                <Button type="primary" onClick={() => navigate(`/services/${serv.id}`)}>
                  Book Now
                </Button>
              </Space>
            </Card>
          </Col>
        ))}

        {(!services || services.length === 0) && (
          <Col span={24}>
            <Card bordered={false} style={{ textAlign: 'center', padding: '40px 0' }}>
              <Briefcase size={40} style={{ color: '#94a3b8', marginBottom: 12 }} />
              <Title level={5}>No active services listed yet</Title>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );

  // Tab 3: Gallery
  const GalleryTab = (
    <div>
      <Row gutter={[16, 16]}>
        {company.gallery && company.gallery.length > 0 ? (
          company.gallery.map(img => (
            <Col xs={24} sm={12} md={8} key={img.id}>
              <Card bordered={false} bodyStyle={{ padding: 8 }}>
                <div style={{ height: 180, background: '#f1f5f9', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 12, color: '#64748b' }}>{img.caption || 'Portfolio Showcase'}</Text>
                </div>
              </Card>
            </Col>
          ))
        ) : (
          <Col span={24}>
            <Text type="secondary">No gallery photos uploaded yet.</Text>
          </Col>
        )}
      </Row>
    </div>
  );

  // Tab 4: Reviews
  const ReviewsTab = (
    <div>
      <Card bordered={false}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24 }}>
          <div style={{ textAlign: 'center', padding: '16px 24px', background: '#fffbeb', borderRadius: 12 }}>
            <Title level={2} style={{ margin: 0, color: '#b45309' }}>{Number(company.average_rating).toFixed(1)}</Title>
            <Rate disabled defaultValue={company.average_rating} style={{ fontSize: 14 }} />
            <Text type="secondary" style={{ display: 'block', fontSize: 12, marginTop: 4 }}>
              Based on {company.total_reviews} reviews
            </Text>
          </div>

          <div>
            <Title level={5} style={{ margin: 0 }}>Customer Verification & Rating</Title>
            <Text type="secondary">Reviews are collected from verified home care service bookings.</Text>
          </div>
        </div>
      </Card>
    </div>
  );

  // Tab 5: About
  const AboutTab = (
    <div>
      <Card title="Company Information & Specs" bordered={false} style={{ marginBottom: 20 }}>
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="Working Hours">{company.working_hours || '09:00 - 18:00'}</Descriptions.Item>
          <Descriptions.Item label="Working Days">{company.working_days || 'Monday - Saturday'}</Descriptions.Item>
          <Descriptions.Item label="Service Radius">{company.service_radius || 25} km</Descriptions.Item>
          <Descriptions.Item label="Min Booking">${company.minimum_booking_amount || 0}</Descriptions.Item>
          <Descriptions.Item label="Emergency Service">{company.emergency_service ? 'Available 24/7' : 'Standard Hours'}</Descriptions.Item>
          <Descriptions.Item label="Website">{company.website || 'N/A'}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="Mission Statement" bordered={false}>
            <Text>{company.mission || 'To provide high-quality, dependable home maintenance and repair services.'}</Text>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Vision Statement" bordered={false}>
            <Text>{company.vision || 'To become the premier trusted smart home care provider in the region.'}</Text>
          </Card>
        </Col>
      </Row>
    </div>
  );

  // Tab 6: FAQ
  const FaqTab = (
    <Card title="Frequently Asked Questions" bordered={false}>
      <div style={{ marginBottom: 16 }}>
        <Title level={5}>What happens if I need emergency repairs outside working hours?</Title>
        <Paragraph type="secondary">
          {company.emergency_service
            ? 'Our emergency dispatch team is available 24/7. You can request urgent dispatch through the emergency service tag.'
            : 'For non-emergency requests, bookings received outside normal business hours will be scheduled for the next business day.'}
        </Paragraph>
      </div>

      <div>
        <Title level={5}>Are your service technicians background checked?</Title>
        <Paragraph type="secondary">
          Yes, all employees listed under our company portal undergo mandatory identity checks, certification checks, and safety training.
        </Paragraph>
      </div>
    </Card>
  );

  const tabItems = [
    { key: 'overview', label: 'Overview', children: OverviewTab },
    { key: 'services', label: `Services (${services ? services.length : 0})`, children: ServicesTab },
    { key: 'gallery', label: 'Gallery', children: GalleryTab },
    { key: 'reviews', label: 'Reviews', children: ReviewsTab },
    { key: 'about', label: 'About', children: AboutTab },
    { key: 'faq', label: 'FAQ', children: FaqTab }
  ];

  return (
    <div>
      <AppBreadcrumb items={breadcrumbItems} />

      {/* Header Banner */}
      <Card bordered={false} style={{ marginBottom: 24, borderRadius: 16 }}>
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={16}>
            <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
              <div style={{ width: 80, height: 80, borderRadius: 16, background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 32 }}>
                {company.company_name ? company.company_name.charAt(0) : 'C'}
              </div>

              <div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Title level={3} style={{ margin: 0, fontWeight: 800 }}>{company.company_name}</Title>
                  <Tag color="green">Verified Company</Tag>
                  {company.emergency_service && <Tag color="volcano">24/7 Emergency</Tag>}
                </div>

                <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 8, fontSize: 13, color: '#64748b' }}>
                  <span><MapPin size={14} style={{ marginRight: 4 }} />{company.city}, {company.state}</span>
                  <span><Star size={14} style={{ color: '#f59e0b', fill: '#f59e0b', marginRight: 4 }} />{Number(company.average_rating).toFixed(1)} ({company.total_reviews} reviews)</span>
                </div>
              </div>
            </div>
          </Col>

          <Col xs={24} md={8} style={{ textAlign: 'right' }}>
            <Space>
              <Button
                icon={<Heart size={16} style={{ color: isFavorited ? '#ef4444' : undefined, fill: isFavorited ? '#ef4444' : 'none' }} />}
                onClick={handleToggleFavorite}
              >
                {isFavorited ? 'Saved' : 'Favorite'}
              </Button>
              <Button
                type={isFollowing ? 'default' : 'primary'}
                onClick={handleToggleFollow}
              >
                {isFollowing ? 'Following' : 'Follow Provider'}
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Tabs Layout */}
      <Tabs defaultActiveKey="services" items={tabItems} size="large" style={{ background: '#ffffff', padding: 24, borderRadius: 16 }} />

      <Footer />
    </div>
  );
};

export default CustomerCompanyDetailsPage;
