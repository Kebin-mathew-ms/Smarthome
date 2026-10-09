import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { Input, Typography, Alert, Checkbox, Tabs, Tag, message } from 'antd';
import { Mail, Lock, User, Wrench, Shield, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/auth.service';
import { volunteerService } from '../../services/volunteer.service';
import AppButton from '../../components/common/AppButton';
import FormField from '../../components/common/FormField';
import { ROUTES } from '../../constants/routes';
import { ROLES } from '../../constants/roles';

const { Title, Text } = Typography;

const getRoleDefaultRoute = (role) => {
  switch (role) {
    case ROLES.ADMIN:
      return ROUTES.ADMIN_DASHBOARD;
    case ROLES.VOLUNTEER:
      return ROUTES.VOLUNTEER_DASHBOARD;
    case ROLES.USER:
    default:
      return ROUTES.HOME;
  }
};

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  // Parse role tab from query parameter e.g. ?tab=volunteer or ?tab=admin
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('tab') || 'user';
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const tabParam = queryParams.get('tab');
    if (tabParam && ['user', 'volunteer', 'admin'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  const { control, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      email: '',
      password: '',
      remember: true
    }
  });

  const handleTabChange = (key) => {
    setActiveTab(key);
    setErrorMessage('');
    reset();
  };

  const onSubmit = async (data) => {
    setErrorMessage('');
    setLoading(true);
    try {
      if (activeTab === 'volunteer') {
        // Volunteer portal login
        const response = await volunteerService.login(data.email, data.password);
        if (response && response.success) {
          const volUser = response.data.volunteer;
          const volToken = response.data.token;
          login(volUser, volToken);
          message.success('Volunteer login successful!');
          navigate(ROUTES.VOLUNTEER_DASHBOARD, { replace: true });
        } else {
          setErrorMessage(response?.message || 'Volunteer login failed.');
        }
      } else {
        // Standard Auth login for User or Admin
        const response = await authService.login({
          email: data.email,
          password: data.password
        });

        if (response && response.success) {
          const loggedInUser = response.data.user;

          // If Admin tab was explicitly chosen, verify user has admin role
          if (activeTab === 'admin' && loggedInUser.role !== ROLES.ADMIN) {
            setErrorMessage('Access Denied: Your account does not have System Administrator privileges.');
            setLoading(false);
            return;
          }

          login(loggedInUser, response.data.token);
          message.success(`Welcome back, ${loggedInUser.full_name || 'User'}!`);

          const targetFrom = location.state?.from?.pathname;
          const isInvalidTarget = !targetFrom || targetFrom === ROUTES.LOGIN || targetFrom === ROUTES.UNAUTHORIZED || targetFrom === ROUTES.DASHBOARD;
          
          const destination = isInvalidTarget ? getRoleDefaultRoute(loggedInUser?.role) : targetFrom;
          navigate(destination, { replace: true });
        }
      }
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* 3 Role Login Switcher Tabs */}
      <div style={{ marginBottom: 20 }}>
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          centered
          items={[
            {
              key: 'user',
              label: (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                  <User size={16} /> User
                </span>
              )
            },
            {
              key: 'volunteer',
              label: (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                  <Wrench size={16} /> Volunteer
                </span>
              )
            },
            {
              key: 'admin',
              label: (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                  <Shield size={16} /> Admin
                </span>
              )
            }
          ]}
        />
      </div>

      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <Title level={3} style={{ margin: 0, fontWeight: 700 }}>
          {activeTab === 'user' && 'User Sign In'}
          {activeTab === 'volunteer' && 'Volunteer Portal Sign In'}
          {activeTab === 'admin' && 'Admin Console Sign In'}
        </Title>
        <Text type="secondary" style={{ fontSize: 13 }}>
          {activeTab === 'user' && 'Access customer home care services & bookings'}
          {activeTab === 'volunteer' && 'Access assigned field tasks & work logs'}
          {activeTab === 'admin' && 'Access system operations, dispatch & health diagnostics'}
        </Text>
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
            pattern: activeTab === 'volunteer' ? undefined : {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Please enter a valid email address'
            }
          }}
          render={({ field }) => (
            <FormField label={activeTab === 'volunteer' ? 'Email or Phone' : 'Email Address'} error={errors.email} required>
              <Input
                {...field}
                prefix={<Mail size={16} style={{ color: '#94a3b8', marginRight: 6 }} />}
                placeholder={activeTab === 'volunteer' ? 'volunteer@home.com' : 'name@company.com'}
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
          {activeTab !== 'volunteer' && (
            <Link to={ROUTES.FORGOT_PASSWORD} style={{ fontSize: 14, color: '#2563eb', fontWeight: 500 }}>
              Forgot password?
            </Link>
          )}
        </div>

        <AppButton
          type="primary"
          htmlType="submit"
          block
          loading={loading}
          size="large"
          style={{
            background: activeTab === 'volunteer' ? '#059669' : activeTab === 'admin' ? '#7c3aed' : '#2563eb',
            borderColor: activeTab === 'volunteer' ? '#059669' : activeTab === 'admin' ? '#7c3aed' : '#2563eb'
          }}
        >
          {activeTab === 'user' && 'Sign In as User'}
          {activeTab === 'volunteer' && 'Sign In as Volunteer'}
          {activeTab === 'admin' && 'Sign In as Admin'}
        </AppButton>
      </form>

      <div style={{ textAlign: 'center', marginTop: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {activeTab === 'user' && (
          <Text type="secondary">
            Don't have an account?{' '}
            <Link to={ROUTES.REGISTER} style={{ color: '#2563eb', fontWeight: 600 }}>
              Create Account
            </Link>
          </Text>
        )}
        <div style={{ paddingTop: 8, borderTop: '1px solid #f1f5f9' }}>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Back to{' '}
            <Link to={ROUTES.HOME} style={{ color: '#2563eb', fontWeight: 600 }}>
              System Home & Role Overview
            </Link>
          </Text>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
