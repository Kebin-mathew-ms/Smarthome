import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { Input, Select, Upload, message, Card, Row, Col, Typography, InputNumber } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import AppButton from '../../components/common/AppButton';
import FormField from '../../components/common/FormField';
import AppModal from '../../components/common/AppModal';
import AppBreadcrumb from '../../components/common/AppBreadcrumb';
import { adminService } from '../../services/admin.service';
import { ROUTES } from '../../constants/routes';

const { Option } = Select;
const { Title } = Typography;

const CompanyFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState(null);

  // Modal State for Newly Generated Credentials
  const [credModalOpen, setCredModalOpen] = useState(false);
  const [generatedCreds, setGeneratedCreds] = useState(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      company_name: '',
      company_email: '',
      company_phone: '',
      address: '',
      city: '',
      district: '',
      state: '',
      postal_code: '',
      description: '',
      status: 'pending',
      working_hours: '09:00 - 18:00',
      working_days: 'Monday - Saturday',
      service_radius: 25,
      minimum_booking_amount: 0
    }
  });

  useEffect(() => {
    if (isEditMode) {
      const fetchCompany = async () => {
        setLoading(true);
        try {
          const res = await adminService.getCompanyById(id);
          if (res.success) {
            const comp = res.data;
            reset({
              company_name: comp.company_name,
              company_email: comp.company_email,
              company_phone: comp.company_phone,
              address: comp.address,
              city: comp.city,
              district: comp.district || '',
              state: comp.state,
              postal_code: comp.postal_code,
              description: comp.description || '',
              status: comp.status,
              working_hours: comp.settings?.working_hours || '09:00 - 18:00',
              working_days: comp.settings?.working_days || 'Monday - Saturday',
              service_radius: comp.settings?.service_radius || 25,
              minimum_booking_amount: comp.settings?.minimum_booking_amount || 0
            });
          }
        } catch (err) {
          message.error(err.message || 'Failed to load company data');
        } finally {
          setLoading(false);
        }
      };
      fetchCompany();
    }
  }, [id, isEditMode]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== null) {
          formData.append(key, data[key]);
        }
      });
      if (logoFile) {
        formData.append('logo', logoFile);
      }

      if (isEditMode) {
        await adminService.updateCompany(id, formData);
        message.success('Company details updated successfully');
        navigate(ROUTES.ADMIN_COMPANIES);
      } else {
        const res = await adminService.createCompany(formData);
        if (res.success) {
          setGeneratedCreds(res.data.credentials);
          setCredModalOpen(true);
        }
      }
    } catch (err) {
      message.error(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCredModalClose = () => {
    setCredModalOpen(false);
    navigate(ROUTES.ADMIN_COMPANIES);
  };

  const breadcrumbItems = [
    { title: 'Dashboard', path: ROUTES.ADMIN_DASHBOARD },
    { title: 'Companies', path: ROUTES.ADMIN_COMPANIES },
    { title: isEditMode ? 'Edit Company' : 'Add Company' }
  ];

  return (
    <div>
      <AppBreadcrumb items={breadcrumbItems} />
      <PageHeader
        title={isEditMode ? 'Edit Company Profile' : 'Register New Company'}
        subtitle={isEditMode ? 'Update company information, status and operational settings.' : 'Register a service provider company with auto-generated login credentials.'}
        extra={
          <AppButton icon={<ArrowLeft size={16} />} onClick={() => navigate(ROUTES.ADMIN_COMPANIES)}>
            Back to Companies
          </AppButton>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card title="Basic Company Information" bordered={false} style={{ marginBottom: 24 }}>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Controller
                    name="company_name"
                    control={control}
                    rules={{ required: 'Company name is required' }}
                    render={({ field }) => (
                      <FormField label="Company Name" error={errors.company_name} required>
                        <Input {...field} placeholder="e.g. Apex Home Care Solutions" />
                      </FormField>
                    )}
                  />
                </Col>

                <Col xs={24} sm={12}>
                  <Controller
                    name="company_email"
                    control={control}
                    rules={{
                      required: 'Email is required',
                      pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' }
                    }}
                    render={({ field }) => (
                      <FormField label="Company Email" error={errors.company_email} required help="This email will be used as the company login ID.">
                        <Input {...field} placeholder="info@apexcare.com" disabled={isEditMode} />
                      </FormField>
                    )}
                  />
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Controller
                    name="company_phone"
                    control={control}
                    rules={{ required: 'Phone number is required' }}
                    render={({ field }) => (
                      <FormField label="Company Phone" error={errors.company_phone} required>
                        <Input {...field} placeholder="+1234567890" />
                      </FormField>
                    )}
                  />
                </Col>

                <Col xs={24} sm={12}>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <FormField label="Company Status" required>
                        <Select {...field} style={{ width: '100%' }}>
                          <Option value="pending">Pending</Option>
                          <Option value="active">Active</Option>
                          <Option value="inactive">Inactive</Option>
                          <Option value="blocked">Blocked</Option>
                          <Option value="rejected">Rejected</Option>
                        </Select>
                      </FormField>
                    )}
                  />
                </Col>
              </Row>

              <Controller
                name="address"
                control={control}
                rules={{ required: 'Street address is required' }}
                render={({ field }) => (
                  <FormField label="Street Address" error={errors.address} required>
                    <Input {...field} placeholder="123 Corporate Blvd, Suite 400" />
                  </FormField>
                )}
              />

              <Row gutter={16}>
                <Col xs={24} sm={8}>
                  <Controller
                    name="city"
                    control={control}
                    rules={{ required: 'City is required' }}
                    render={({ field }) => (
                      <FormField label="City" error={errors.city} required>
                        <Input {...field} placeholder="San Francisco" />
                      </FormField>
                    )}
                  />
                </Col>

                <Col xs={24} sm={8}>
                  <Controller
                    name="district"
                    control={control}
                    render={({ field }) => (
                      <FormField label="District">
                        <Input {...field} placeholder="Central District" />
                      </FormField>
                    )}
                  />
                </Col>

                <Col xs={24} sm={8}>
                  <Controller
                    name="state"
                    control={control}
                    rules={{ required: 'State is required' }}
                    render={({ field }) => (
                      <FormField label="State / Province" error={errors.state} required>
                        <Input {...field} placeholder="CA" />
                      </FormField>
                    )}
                  />
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Controller
                    name="postal_code"
                    control={control}
                    rules={{ required: 'Postal Code is required' }}
                    render={({ field }) => (
                      <FormField label="Postal Code" error={errors.postal_code} required>
                        <Input {...field} placeholder="94105" />
                      </FormField>
                    )}
                  />
                </Col>
                <Col xs={24} sm={12}>
                  <FormField label="Company Logo">
                    <Upload
                      beforeUpload={(file) => {
                        setLogoFile(file);
                        return false;
                      }}
                      maxCount={1}
                      accept="image/*"
                    >
                      <AppButton icon={<UploadOutlined />}>Select Logo File</AppButton>
                    </Upload>
                  </FormField>
                </Col>
              </Row>

              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <FormField label="Company Description">
                    <Input.TextArea {...field} rows={3} placeholder="Brief summary of company services..." />
                  </FormField>
                )}
              />
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card title="Operational Settings" bordered={false} style={{ marginBottom: 24 }}>
              <Controller
                name="working_hours"
                control={control}
                render={({ field }) => (
                  <FormField label="Working Hours">
                    <Input {...field} placeholder="08:00 - 18:00" />
                  </FormField>
                )}
              />

              <Controller
                name="working_days"
                control={control}
                render={({ field }) => (
                  <FormField label="Working Days">
                    <Input {...field} placeholder="Monday - Saturday" />
                  </FormField>
                )}
              />

              <Controller
                name="service_radius"
                control={control}
                render={({ field }) => (
                  <FormField label="Service Radius (km)">
                    <InputNumber {...field} style={{ width: '100%' }} min={1} max={500} />
                  </FormField>
                )}
              />

              <Controller
                name="minimum_booking_amount"
                control={control}
                render={({ field }) => (
                  <FormField label="Minimum Booking Amount ($)">
                    <InputNumber {...field} style={{ width: '100%' }} min={0} />
                  </FormField>
                )}
              />
            </Card>

            <AppButton type="primary" htmlType="submit" block size="large" loading={submitting}>
              {isEditMode ? 'Save Changes' : 'Create Company & Generate Credentials'}
            </AppButton>
          </Col>
        </Row>
      </form>

      {/* Temporary Password Credentials Display Modal */}
      <AppModal
        title="Company Registered Successfully"
        open={credModalOpen}
        onOk={handleCredModalClose}
        onCancel={handleCredModalClose}
        okText="I Have Copied These Credentials"
        cancelButtonProps={{ style: { display: 'none' } }}
      >
        <div style={{ padding: '12px 0' }}>
          <div style={{ background: '#fffbe5', padding: 16, borderRadius: 8, border: '1px solid #ffe58f', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#d48806', fontWeight: 600, marginBottom: 8 }}>
              <ShieldAlert size={18} />
              <span>Show Once Notice</span>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: '#595959' }}>
              The temporary password below is encrypted in the database and will <strong>NEVER BE SHOWN AGAIN</strong>. Please record it now.
            </p>
          </div>

          <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <div style={{ marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: '#64748b', display: 'block' }}>Company Login Email:</span>
              <strong style={{ fontSize: 15 }}>{generatedCreds?.email}</strong>
            </div>
            <div>
              <span style={{ fontSize: 12, color: '#64748b', display: 'block' }}>Temporary Auto Password:</span>
              <strong style={{ fontSize: 18, color: '#2563eb', fontFamily: 'monospace' }}>{generatedCreds?.temporaryPassword}</strong>
            </div>
          </div>
        </div>
      </AppModal>
    </div>
  );
};

export default CompanyFormPage;
