import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { Input, Typography, Alert, Select, Progress } from 'antd';
import { Mail, Lock, User, Phone } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/auth.service';
import AppButton from '../../components/common/AppButton';
import FormField from '../../components/common/FormField';
import { getPasswordStrength } from '../../utils/validators';
import { ROUTES } from '../../constants/routes';
import { ROLES } from '../../constants/roles';

const { Title, Text } = Typography;
const { Option } = Select;

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      password: '',
      role: ROLES.USER
    }
  });

  const watchPassword = watch('password', '');
  const passwordStrength = getPasswordStrength(watchPassword);

  const onSubmit = async (data) => {
    setErrorMessage('');
    setLoading(true);
    try {
      const response = await authService.register(data);
      if (response.success) {
        const newUser = response.data.user;
        login(newUser, response.data.token);
        
        let destination = ROUTES.HOME;
        if (newUser?.role === ROLES.COMPANY) {
          destination = ROUTES.COMPANY_DASHBOARD;
        } else if (newUser?.role === ROLES.ADMIN) {
          destination = ROUTES.ADMIN_DASHBOARD;
        }
        navigate(destination, { replace: true });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0, fontWeight: 700 }}>
          Create Account
        </Title>
        <Text type="secondary">Join Smart Home Care & Maintenance Service</Text>
      </div>

      {errorMessage && (
        <Alert
          message="Registration Error"
          description={errorMessage}
          type="error"
          showIcon
          style={{ marginBottom: 20 }}
          closable
          onClose={() => setErrorMessage('')}
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Controller
            name="first_name"
            control={control}
            rules={{ required: 'First name is required' }}
            render={({ field }) => (
              <FormField label="First Name" error={errors.first_name} required>
                <Input
                  {...field}
                  prefix={<User size={16} style={{ color: '#94a3b8', marginRight: 6 }} />}
                  placeholder="John"
                  size="large"
                />
              </FormField>
            )}
          />

          <Controller
            name="last_name"
            control={control}
            rules={{ required: 'Last name is required' }}
            render={({ field }) => (
              <FormField label="Last Name" error={errors.last_name} required>
                <Input
                  {...field}
                  prefix={<User size={16} style={{ color: '#94a3b8', marginRight: 6 }} />}
                  placeholder="Doe"
                  size="large"
                />
              </FormField>
            )}
          />
        </div>

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
                placeholder="john.doe@example.com"
                size="large"
              />
            </FormField>
          )}
        />

        <Controller
          name="phone"
          control={control}
          rules={{
            required: 'Phone number is required',
            pattern: {
              value: /^\+?[1-9]\d{1,14}$/,
              message: 'Invalid phone format (e.g., +1234567890)'
            }
          }}
          render={({ field }) => (
            <FormField label="Phone Number" error={errors.phone} required>
              <Input
                {...field}
                prefix={<Phone size={16} style={{ color: '#94a3b8', marginRight: 6 }} />}
                placeholder="+1234567890"
                size="large"
              />
            </FormField>
          )}
        />

        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <FormField label="Account Type" required>
              <Select {...field} size="large" style={{ width: '100%' }}>
                <Option value={ROLES.USER}>Homeowner / Customer</Option>
                <Option value={ROLES.COMPANY}>Service Company</Option>
              </Select>
            </FormField>
          )}
        />

        <Controller
          name="password"
          control={control}
          rules={{
            required: 'Password is required',
            minLength: {
              value: 8,
              message: 'Password must be at least 8 characters'
            },
            validate: (value) =>
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(value) ||
              'Must include uppercase, lowercase, number and special char'
          }}
          render={({ field }) => (
            <FormField label="Password" error={errors.password} required>
              <Input.Password
                {...field}
                prefix={<Lock size={16} style={{ color: '#94a3b8', marginRight: 6 }} />}
                placeholder="Min 8 characters"
                size="large"
              />
            </FormField>
          )}
        />

        {watchPassword && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ fontSize: 12 }} type="secondary">
                Password Strength:
              </Text>
              <Text style={{ fontSize: 12, fontWeight: 600, color: passwordStrength.color }}>
                {passwordStrength.label}
              </Text>
            </div>
            <Progress
              percent={(passwordStrength.score / 5) * 100}
              steps={5}
              strokeColor={passwordStrength.color}
              showInfo={false}
              size="small"
            />
          </div>
        )}

        <AppButton type="primary" htmlType="submit" block loading={loading} size="large" style={{ marginTop: 8 }}>
          Register Account
        </AppButton>
      </form>

      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <Text type="secondary">
          Already have an account?{' '}
          <Link to={ROUTES.LOGIN} style={{ color: '#2563eb', fontWeight: 600 }}>
            Sign In
          </Link>
        </Text>
      </div>
    </div>
  );
};

export default RegisterPage;
