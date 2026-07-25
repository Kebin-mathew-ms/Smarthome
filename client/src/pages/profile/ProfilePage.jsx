import React, { useState } from 'react';
import { Input, Typography, App, Tag, Divider, Row, Col, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { User, Mail, Phone, Shield, Calendar, Lock } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/auth.service';
import PageHeader from '../../components/common/PageHeader';
import AppCard from '../../components/common/AppCard';
import AppButton from '../../components/common/AppButton';
import FormField from '../../components/common/FormField';
import { formatDate } from '../../utils/formatters';

const { Title, Text } = Typography;

const ProfilePage = () => {
  const { message } = App.useApp();
  const { user, updateUser } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      phone: user?.phone || ''
    }
  });

  const onSubmitProfile = async (data) => {
    setSubmitting(true);
    try {
      const res = await authService.updateProfile(data);
      if (res.success) {
        updateUser(res.data);
        message.success('Profile updated successfully');
      }
    } catch (err) {
      message.error(err.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="My Profile"
        subtitle="Manage your personal profile and security credentials."
      />

      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <AppCard>
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  color: '#fff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 32,
                  fontWeight: 700,
                  marginBottom: 16
                }}
              >
                {user?.first_name ? user.first_name.charAt(0).toUpperCase() : 'U'}
              </div>

              <Title level={4} style={{ margin: 0 }}>
                {user?.first_name} {user?.last_name}
              </Title>
              <Text type="secondary">{user?.email}</Text>

              <div style={{ marginTop: 12 }}>
                <Tag color="blue" icon={<Shield size={12} style={{ marginRight: 4 }} />}>
                  {user?.role} Account
                </Tag>
              </div>

              <Divider style={{ margin: '20px 0' }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Mail size={16} style={{ color: '#64748b' }} />
                  <Text style={{ fontSize: 14 }}>{user?.email}</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Phone size={16} style={{ color: '#64748b' }} />
                  <Text style={{ fontSize: 14 }}>{user?.phone || 'N/A'}</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Calendar size={16} style={{ color: '#64748b' }} />
                  <Text style={{ fontSize: 14 }}>Joined {formatDate(user?.created_at)}</Text>
                </div>
              </div>
            </div>
          </AppCard>
        </Col>

        <Col xs={24} md={16}>
          <AppCard title="Edit Personal Details">
            <form onSubmit={handleSubmit(onSubmitProfile)}>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Controller
                    name="first_name"
                    control={control}
                    rules={{ required: 'First name is required' }}
                    render={({ field }) => (
                      <FormField label="First Name" error={errors.first_name} required>
                        <Input
                          {...field}
                          prefix={<User size={16} style={{ color: '#94a3b8', marginRight: 6 }} />}
                          size="large"
                        />
                      </FormField>
                    )}
                  />
                </Col>

                <Col xs={24} sm={12}>
                  <Controller
                    name="last_name"
                    control={control}
                    rules={{ required: 'Last name is required' }}
                    render={({ field }) => (
                      <FormField label="Last Name" error={errors.last_name} required>
                        <Input
                          {...field}
                          prefix={<User size={16} style={{ color: '#94a3b8', marginRight: 6 }} />}
                          size="large"
                        />
                      </FormField>
                    )}
                  />
                </Col>
              </Row>

              <Controller
                name="phone"
                control={control}
                rules={{ required: 'Phone number is required' }}
                render={({ field }) => (
                  <FormField label="Phone Number" error={errors.phone} required>
                    <Input
                      {...field}
                      prefix={<Phone size={16} style={{ color: '#94a3b8', marginRight: 6 }} />}
                      size="large"
                    />
                  </FormField>
                )}
              />

              <div style={{ marginTop: 12 }}>
                <AppButton type="primary" htmlType="submit" loading={submitting} size="large">
                  Save Profile Changes
                </AppButton>
              </div>
            </form>
          </AppCard>
        </Col>
      </Row>
    </div>
  );
};

export default ProfilePage;
