import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { Input, Typography, Alert, Checkbox } from 'antd';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/auth.service';
import AppButton from '../../components/common/AppButton';
import FormField from '../../components/common/FormField';
import { ROUTES } from '../../constants/routes';
import { ROLES } from '../../constants/roles';

const { Title, Text } = Typography;

const getRoleDefaultRoute = (role) => {
  switch (role) {
    case ROLES.ADMIN:
      return ROUTES.ADMIN_DASHBOARD;
    case ROLES.COMPANY:
      return ROUTES.COMPANY_DASHBOARD;
    case ROLES.EMPLOYEE:
      return ROUTES.EMPLOYEE_DASHBOARD;
    case ROLES.USER:
    default:
      return ROUTES.HOME;
  }
};

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      password: '',
      remember: true
    }
  });

  const onSubmit = async (data) => {
    setErrorMessage('');
    setLoading(true);
    try {
      const response = await authService.login({
        email: data.email,
        password: data.password
      });

      if (response.success) {
        const loggedInUser = response.data.user;
        login(loggedInUser, response.data.token);

        const targetFrom = location.state?.from?.pathname;
        const isInvalidTarget = !targetFrom || targetFrom === ROUTES.LOGIN || targetFrom === ROUTES.UNAUTHORIZED || targetFrom === ROUTES.DASHBOARD;
        
        const destination = isInvalidTarget ? getRoleDefaultRoute(loggedInUser?.role) : targetFrom;
        navigate(destination, { replace: true });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0, fontWeight: 700 }}>
          Welcome Back
        </Title>
        <Text type="secondary">Sign in to your Smart Home Care account</Text>
      </div>

      {errorMessage && (
        <Alert
          message="Authentication Error"
          description={errorMessage}
          type="error"
          showIcon
          style={{ marginBottom: 20 }}
          closable
          onClose={() => setErrorMessage('')}
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="email"
          control={control}
          rules={{
            required: 'Email address is required',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Please enter a valid email address'
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

        <Controller
          name="password"
          control={control}
          rules={{ required: 'Password is required' }}
          render={({ field }) => (
            <FormField label="Password" error={errors.password} required>
              <Input.Password
                {...field}
                prefix={<Lock size={16} style={{ color: '#94a3b8', marginRight: 6 }} />}
                placeholder="Enter password"
                size="large"
              />
            </FormField>
          )}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Controller
            name="remember"
            control={control}
            render={({ field: { value, onChange } }) => (
              <Checkbox checked={value} onChange={e => onChange(e.target.checked)}>
                Remember me
              </Checkbox>
            )}
          />
          <Link to={ROUTES.FORGOT_PASSWORD} style={{ fontSize: 14, color: '#2563eb', fontWeight: 500 }}>
            Forgot password?
          </Link>
        </div>

        <AppButton type="primary" htmlType="submit" block loading={loading} size="large">
          Sign In
        </AppButton>
      </form>

      <div style={{ textAlign: 'center', marginTop: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Text type="secondary">
          Don't have an account?{' '}
          <Link to={ROUTES.REGISTER} style={{ color: '#2563eb', fontWeight: 600 }}>
            Create Account
          </Link>
        </Text>
        <div style={{ paddingTop: 8, borderTop: '1px solid #f1f5f9' }}>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Field Technician?{' '}
            <Link to={ROUTES.EMPLOYEE_LOGIN} style={{ color: '#059669', fontWeight: 600 }}>
              Sign In to Technician Portal →
            </Link>
          </Text>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
