import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Typography, Tag, Descriptions, Table, Space, message } from 'antd';
import { Briefcase, Edit2, ArrowLeft, CheckCircle2, Clock, DollarSign, Layers, Image } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import AppButton from '../../components/common/AppButton';
import AppBreadcrumb from '../../components/common/AppBreadcrumb';
import StatusBadge from '../../components/common/StatusBadge';
import SkeletonCard from '../../components/common/SkeletonCard';
import { companyPortalService } from '../../services/companyPortal.service';
import { ROUTES } from '../../constants/routes';

const { Title, Text, Paragraph } = Typography;

const CompanyServiceDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchService = async () => {
      setLoading(true);
      try {
        const res = await companyPortalService.getServiceById(id);
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

  if (loading) {
    return (
      <div>
        <PageHeader title="Service Details" subtitle="Loading..." />
        <SkeletonCard rows={6} />
      </div>
    );
  }

  if (!service) {
    return (
      <div>
        <PageHeader title="Service Not Found" />
        <AppButton icon={<ArrowLeft size={16} />} onClick={() => navigate(ROUTES.COMPANY_SERVICES)}>
          Back to Catalog
        </AppButton>
      </div>
    );
  }

  const breadcrumbItems = [
    { title: 'Dashboard', path: ROUTES.COMPANY_DASHBOARD },
    { title: 'Services Catalog', path: ROUTES.COMPANY_SERVICES },
    { title: service.service_name }
  ];

  const packageColumns = [
    { title: 'Package Name', dataIndex: 'package_name', key: 'package_name', render: text => <strong style={{ color: '#2563eb' }}>{text}</strong> },
    { title: 'Description', dataIndex: 'package_description', key: 'package_description', render: d => d || 'N/A' },
    { title: 'Price', dataIndex: 'price', key: 'price', render: p => <strong style={{ color: '#16a34a' }}>${Number(p).toFixed(2)}</strong> },
    { title: 'Duration', dataIndex: 'estimated_duration', key: 'estimated_duration', render: d => d || 'N/A' }
  ];

  return (
    <div>
      <AppBreadcrumb items={breadcrumbItems} />
      <PageHeader
        title={service.service_name}
        subtitle={`${service.category_name} > ${service.subcategory_name}`}
        extra={
          <Space>
            <AppButton type="primary" icon={<Edit2 size={16} />} onClick={() => navigate(`/company/services/${service.id}/edit`)}>
              Edit Service
            </AppButton>
          </Space>
        }
      />

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <Card bordered={false} style={{ marginBottom: 24 }}>
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 16,
                  background: '#eff6ff',
                  color: '#2563eb',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16
                }}
              >
                <Briefcase size={36} />
              </div>

              <Title level={4} style={{ margin: 0 }}>
                {service.service_name}
              </Title>
              <Text type="secondary" style={{ fontSize: 13, display: 'block', marginTop: 4 }}>
                Starting at <strong style={{ color: '#16a34a', fontSize: 18 }}>${Number(service.starting_price).toFixed(2)}</strong>
              </Text>

              <div style={{ marginTop: 12 }}>
                <StatusBadge status={service.status} />
              </div>
            </div>

            <Descriptions column={1} bordered size="small" style={{ marginTop: 16 }}>
              <Descriptions.Item label="Category">{service.category_name}</Descriptions.Item>
              <Descriptions.Item label="Subcategory">{service.subcategory_name}</Descriptions.Item>
              <Descriptions.Item label="Estimated Duration">{service.estimated_duration || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Service Type">{service.service_type}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card title="Detailed Service Overview" bordered={false} style={{ marginBottom: 24 }}>
            <Title level={5}>Short Description</Title>
            <Paragraph type="secondary">{service.short_description || 'No short description specified.'}</Paragraph>

            <Title level={5} style={{ marginTop: 16 }}>Full Specification & Scope</Title>
            <Paragraph>{service.full_description || 'No detailed description specified.'}</Paragraph>

            {service.features && service.features.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <Title level={5}>Included Features & Guarantees</Title>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                  {service.features.map((f, i) => (
                    <Tag key={i} color="blue" style={{ padding: '4px 12px', fontSize: 13 }}>
                      ✓ {f.feature_name}
                    </Tag>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <Card title="Available Service Packages" bordered={false}>
            {service.packages && service.packages.length > 0 ? (
              <Table columns={packageColumns} dataSource={service.packages} rowKey="id" pagination={false} size="small" />
            ) : (
              <Text type="secondary">No specific packages configured for this service yet.</Text>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CompanyServiceDetailsPage;
