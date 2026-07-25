import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Input, Switch, Upload, message, Card, Row, Col, Typography, InputNumber } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import PageHeader from '../../components/common/PageHeader';
import AppButton from '../../components/common/AppButton';
import FormField from '../../components/common/FormField';
import SkeletonCard from '../../components/common/SkeletonCard';
import { companyPortalService } from '../../services/companyPortal.service';

const { Title, Text } = Typography;

const CompanyProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

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
      about_us: '',
      mission: '',
      vision: '',
      working_hours: '09:00 - 18:00',
      working_days: 'Monday - Saturday',
      service_radius: 25,
      minimum_booking_amount: 0,
      emergency_service: false,
      website: '',
      google_maps_location: ''
    }
  });

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await companyPortalService.getProfile();
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
          about_us: comp.settings?.about_us || '',
          mission: comp.settings?.mission || '',
          vision: comp.settings?.vision || '',
          working_hours: comp.settings?.working_hours || '09:00 - 18:00',
          working_days: comp.settings?.working_days || 'Monday - Saturday',
          service_radius: comp.settings?.service_radius || 25,
          minimum_booking_amount: comp.settings?.minimum_booking_amount || 0,
          emergency_service: Boolean(comp.settings?.emergency_service),
          website: comp.settings?.website || '',
          google_maps_location: comp.settings?.google_maps_location || ''
        });
      }
    } catch (err) {
      message.error(err.message || 'Failed to load company profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (data[key] !== undefined && data[key] !== null) {
          formData.append(key, data[key]);
        }
      });
      if (logoFile) formData.append('logo', logoFile);
      if (coverFile) formData.append('cover_image', coverFile);

      const res = await companyPortalService.updateProfile(formData);
      if (res.success) {
        message.success('Company profile updated successfully');
        fetchProfile();
      }
    } catch (err) {
      message.error(err.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="Company Profile" subtitle="Loading info..." />
        <SkeletonCard rows={6} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Company Profile & Media"
        subtitle="Manage public company profile information, branding assets, and operational parameters."
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card title="Business Details & Branding" bordered={false} style={{ marginBottom: 24 }}>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Controller
                    name="company_name"
                    control={control}
                    rules={{ required: 'Company name is required' }}
                    render={({ field }) => (
                      <FormField label="Company Name" error={errors.company_name} required>
                        <Input {...field} size="large" />
                      </FormField>
                    )}
                  />
                </Col>

                <Col xs={24} sm={12}>
                  <Controller
                    name="company_phone"
                    control={control}
                    rules={{ required: 'Phone is required' }}
                    render={({ field }) => (
                      <FormField label="Company Phone" error={errors.company_phone} required>
                        <Input {...field} size="large" />
                      </FormField>
                    )}
                  />
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <FormField label="Company Logo">
                    <Upload beforeUpload={(file) => { setLogoFile(file); return false; }} maxCount={1} accept="image/*">
                      <AppButton icon={<UploadOutlined />}>Upload New Logo</AppButton>
                    </Upload>
                  </FormField>
                </Col>
                <Col xs={24} sm={12}>
                  <FormField label="Cover Banner Image">
                    <Upload beforeUpload={(file) => { setCoverFile(file); return false; }} maxCount={1} accept="image/*">
                      <AppButton icon={<UploadOutlined />}>Upload Cover Banner</AppButton>
                    </Upload>
                  </FormField>
                </Col>
              </Row>

              <Controller
                name="address"
                control={control}
                rules={{ required: 'Address is required' }}
                render={({ field }) => (
                  <FormField label="Street Address" error={errors.address} required>
                    <Input {...field} size="large" />
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
                        <Input {...field} />
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
                      <FormField label="State" error={errors.state} required>
                        <Input {...field} />
                      </FormField>
                    )}
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <Controller
                    name="postal_code"
                    control={control}
                    rules={{ required: 'Postal Code is required' }}
                    render={({ field }) => (
                      <FormField label="Postal Code" error={errors.postal_code} required>
                        <Input {...field} />
                      </FormField>
                    )}
                  />
                </Col>
              </Row>

              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <FormField label="Tagline / Short Description">
                    <Input {...field} placeholder="Brief one-liner company summary..." />
                  </FormField>
                )}
              />

              <Controller
                name="about_us"
                control={control}
                render={({ field }) => (
                  <FormField label="About Us">
                    <Input.TextArea {...field} rows={3} placeholder="Full story about your company..." />
                  </FormField>
                )}
              />

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Controller
                    name="mission"
                    control={control}
                    render={({ field }) => (
                      <FormField label="Mission Statement">
                        <Input.TextArea {...field} rows={2} placeholder="Our mission..." />
                      </FormField>
                    )}
                  />
                </Col>
                <Col xs={24} sm={12}>
                  <Controller
                    name="vision"
                    control={control}
                    render={({ field }) => (
                      <FormField label="Vision Statement">
                        <Input.TextArea {...field} rows={2} placeholder="Our vision..." />
                      </FormField>
                    )}
                  />
                </Col>
              </Row>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card title="Operations & Coverage" bordered={false} style={{ marginBottom: 24 }}>
              <Controller
                name="working_hours"
                control={control}
                render={({ field }) => (
                  <FormField label="Working Hours">
                    <Input {...field} placeholder="09:00 - 18:00" />
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

              <Controller
                name="emergency_service"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <FormField label="24/7 Emergency Service Availability">
                    <Switch checked={value} onChange={onChange} />
                  </FormField>
                )}
              />

              <Controller
                name="website"
                control={control}
                render={({ field }) => (
                  <FormField label="Website URL">
                    <Input {...field} placeholder="https://company.com" />
                  </FormField>
                )}
              />
            </Card>

            <AppButton type="primary" htmlType="submit" block size="large" loading={submitting}>
              Save Profile & Settings
            </AppButton>
          </Col>
        </Row>
      </form>
    </div>
  );
};

export default CompanyProfilePage;
