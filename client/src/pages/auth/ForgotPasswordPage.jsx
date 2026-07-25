import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { Input, Typography, Alert } from 'antd';
import { Mail, ArrowLeft } from 'lucide-react';
import AppButton from '../../components/common/AppButton';
import FormField from '../../components/common/FormField';
import { ROUTES } from '../../constants/routes';

const { Title, Text } = Typography;

const ForgotPasswordPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { email: '' }
  });

  const onSubmit = async () => {
    setLoading(true);
    // UI flow only as requested
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0, fontWeight: 700 }}>
          Reset Password
        </Title>
        <Text type="secondary">Enter your email to receive password reset instructions</Text>
      </div>

      {submitted ? (
        <div>
          <Alert
            message="Check Your Inbox"
            description="If an account exists with this email address, password reset instructions have been sent."
            type="success"
            showIcon
            style={{ marginBottom: 24 }}
          />
          <Link to={ROUTES.LOGIN}>
            <AppButton block size="large" icon={<ArrowLeft size={16} />}>
              Back to Login
            </AppButton>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="email"
            control={control}
            rules={{
              required: 'Email address is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Invalid email address'
              }
            }}
            render={({ field }) => (
              <FormField label="Email Address" error={errors.email} required>
                <Input
                  {...field}
                  prefix={<Mail size={16} style={{ color: '#94a3b8', marginRight: 6 }} />}
                  placeholder="name@company.com"
                  size="large"
                />
              </FormField>
            )}
          />

          <AppButton type="primary" htmlType="submit" block loading={loading} size="large" style={{ marginTop: 8 }}>
            Send Reset Instructions
          </AppButton>

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Link to={ROUTES.LOGIN} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: 14 }}>
              <ArrowLeft size={16} /> Back to Sign In
            </Link>
          </div>
        </form>
      )}
    </div>
  );
};

export default ForgotPasswordPage;
