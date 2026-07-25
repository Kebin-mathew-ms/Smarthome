import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Typography, Tag, Descriptions, Space, message, Tabs, Table } from 'antd';
import { Building2, Mail, Phone, MapPin, Key, Edit2, ArrowLeft, ShieldCheck, Users, Briefcase, Calendar, DollarSign } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import AppButton from '../../components/common/AppButton';
import AppBreadcrumb from '../../components/common/AppBreadcrumb';
import StatusBadge from '../../components/common/StatusBadge';
import AppModal from '../../components/common/AppModal';
import SkeletonCard from '../../components/common/SkeletonCard';
import { adminService } from '../../services/admin.service';
import { formatDate } from '../../utils/formatters';
import { ROUTES } from '../../constants/routes';

const { Title, Text } = Typography;

const CompanyDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  // Credential Modal State for reset password
  const [credModalOpen, setCredModalOpen] = useState(false);
  const [generatedCreds, setGeneratedCreds] = useState(null);

  const fetchCompanyDetails = async () => {
    setLoading(true);
    try {
      const res = await adminService.getCompanyById(id);
      if (res.success) {
        setCompany(res.data);
      }
    } catch (err) {
      message.error(err.message || 'Failed to load company details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyDetails();
  }, [id]);

  const handleResetPassword = async () => {
    try {
      const res = await adminService.resetCompanyPassword(id);
      if (res.success) {
        setGeneratedCreds(res.data);
        setCredModalOpen(true);
        message.success('Password reset successfully');
      }
    } catch (err) {
      message.error(err.message || 'Password reset failed');
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="Company Details" subtitle="Loading info..." />
        <SkeletonCard rows={5} />
      </div>
    );
  }

  if (!company) {
    return (
      <div>
        <PageHeader title="Company Not Found" />
        <AppButton icon={<ArrowLeft size={16} />} onClick={() => navigate(ROUTES.ADMIN_COMPANIES)}>
          Back to Companies
        </AppButton>
      </div>
    );
  }

  const breadcrumbItems = [
    { title: 'Dashboard', path: ROUTES.ADMIN_DASHBOARD },
    { title: 'Companies', path: ROUTES.ADMIN_COMPANIES },
    { title: company.company_name }
  ];

  return (
    <div>
      <AppBreadcrumb items={breadcrumbItems} />
      <PageHeader
        title={company.company_name}
        subtitle={`Registered on ${formatDate(company.created_at)}`}
        extra={
          <Space wrap>
            <AppButton icon={<Key size={16} />} onClick={handleResetPassword}>
              Reset Password
            </AppButton>
            <AppButton type="primary" icon={<Edit2 size={16} />} onClick={() => navigate(`/admin/companies/${company.id}/edit`)}>
              Edit Profile
            </AppButton>
          </Space>
        }
      />

      <Row gutter={[24, 24]}>
        {/* Left Column: Quick Stats & Card */}
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
                <Building2 size={36} />
              </div>

              <Title level={4} style={{ margin: 0 }}>
                {company.company_name}
              </Title>
              <Text type="secondary">{company.company_email}</Text>

              <div style={{ marginTop: 12 }}>
                <StatusBadge status={company.status} />
              </div>
            </div>

            <Row gutter={[12, 12]} style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
              <Col span={12}>
                <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, textAlign: 'center' }}>
                  <Users size={18} style={{ color: '#2563eb', marginBottom: 4 }} />
                  <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Employees</Text>
                  <strong style={{ fontSize: 16 }}>{company.employeesCount || 0}</strong>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, textAlign: 'center' }}>
                  <Briefcase size={18} style={{ color: '#16a34a', marginBottom: 4 }} />
                  <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Services</Text>
                  <strong style={{ fontSize: 16 }}>{company.servicesCount || 0}</strong>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, textAlign: 'center' }}>
                  <Calendar size={18} style={{ color: '#9333ea', marginBottom: 4 }} />
                  <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Bookings</Text>
                  <strong style={{ fontSize: 16 }}>{company.bookingsCount || 0}</strong>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, textAlign: 'center' }}>
                  <DollarSign size={18} style={{ color: '#ea580c', marginBottom: 4 }} />
                  <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Revenue</Text>
                  <strong style={{ fontSize: 16 }}>${company.revenue || 0}</strong>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Right Column: Detailed Info Tabs */}
        <Col xs={24} lg={16}>
          <Card bordered={false}>
            <Tabs
              items={[
                {
                  key: 'overview',
                  label: 'Company Overview',
                  children: (
                    <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
                      <Descriptions.Item label="Company Name">{company.company_name}</Descriptions.Item>
                      <Descriptions.Item label="Email">{company.company_email}</Descriptions.Item>
                      <Descriptions.Item label="Phone">{company.company_phone}</Descriptions.Item>
                      <Descriptions.Item label="Status"><StatusBadge status={company.status} /></Descriptions.Item>
                      <Descriptions.Item label="Street Address">{company.address}</Descriptions.Item>
                      <Descriptions.Item label="City">{company.city}</Descriptions.Item>
                      <Descriptions.Item label="District">{company.district || 'N/A'}</Descriptions.Item>
                      <Descriptions.Item label="State">{company.state}</Descriptions.Item>
                      <Descriptions.Item label="Postal Code">{company.postal_code}</Descriptions.Item>
                      <Descriptions.Item label="Registered Date">{formatDate(company.created_at)}</Descriptions.Item>
                      <Descriptions.Item label="Description" span={2}>
                        {company.description || 'No description provided.'}
                      </Descriptions.Item>
                    </Descriptions>
                  )
                },
                {
                  key: 'settings',
                  label: 'Operational Settings',
                  children: (
                    <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
                      <Descriptions.Item label="Working Hours">{company.settings?.working_hours || '09:00 - 18:00'}</Descriptions.Item>
                      <Descriptions.Item label="Working Days">{company.settings?.working_days || 'Monday - Saturday'}</Descriptions.Item>
                      <Descriptions.Item label="Service Radius">{company.settings?.service_radius || 25} km</Descriptions.Item>
                      <Descriptions.Item label="Minimum Booking Amount">${company.settings?.minimum_booking_amount || 0}</Descriptions.Item>
                    </Descriptions>
                  )
                },
                {
                  key: 'documents',
                  label: 'Uploaded Documents',
                  children: (
                    <div>
                      {company.documents && company.documents.length > 0 ? (
                        <Table
                          columns={[
                            { title: 'Document Name', dataIndex: 'document_name', key: 'document_name' },
                            { title: 'Type', dataIndex: 'document_type', key: 'document_type' },
                            { title: 'Uploaded At', dataIndex: 'uploaded_at', key: 'uploaded_at', render: d => formatDate(d) }
                          ]}
                          dataSource={company.documents}
                          rowKey="id"
                          pagination={false}
                          size="small"
                        />
                      ) : (
                        <Text type="secondary">No official documents uploaded yet.</Text>
                      )}
                    </div>
                  )
                }
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* Password Credentials Modal */}
      <AppModal
        title="Temporary Password Reset"
        open={credModalOpen}
        onOk={() => setCredModalOpen(false)}
        onCancel={() => setCredModalOpen(false)}
        okText="I Have Recorded This Password"
        cancelButtonProps={{ style: { display: 'none' } }}
      >
        <div style={{ padding: '12px 0' }}>
          <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <div style={{ marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: '#64748b', display: 'block' }}>Company Account:</span>
              <strong style={{ fontSize: 15 }}>{generatedCreds?.email}</strong>
            </div>
            <div>
              <span style={{ fontSize: 12, color: '#64748b', display: 'block' }}>New Temporary Password:</span>
              <strong style={{ fontSize: 18, color: '#2563eb', fontFamily: 'monospace' }}>{generatedCreds?.temporaryPassword}</strong>
            </div>
          </div>
        </div>
      </AppModal>
    </div>
  );
};

export default CompanyDetailsPage;
