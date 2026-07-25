import React, { useState } from 'react';
import { Card, Input, Button, Typography, message } from 'antd';
import { User, Lock, Wrench, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { employeeService } from '../../services/employee.service';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../constants/routes';

const { Title, Text } = Typography;

const EmployeeLoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      message.warning('Please enter your technician credentials.');
      return;
    }

    setLoading(true);
    try {
      const res = await employeeService.login(email, password);
      if (res.success) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.employee));
        message.success('Technician login successful!');
        window.location.href = ROUTES.EMPLOYEE_DASHBOARD;
      }
    } catch (err) {
      message.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', padding: 20 }}>
      <Card bordered={false} style={{ width: 400, borderRadius: 20, boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: '#2563eb', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <Wrench size={28} />
          </div>
          <Title level={3} style={{ margin: 0 }}>Field Technician Portal</Title>
          <Text type="secondary" style={{ fontSize: 13 }}>Sign in to access assigned jobs & field dispatch</Text>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Email / Phone</label>
            <Input
              prefix={<User size={16} style={{ color: '#94a3b8', marginRight: 6 }} />}
              placeholder="technician@company.com"
              size="large"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600 }}>Password</label>
            <Input.Password
              prefix={<Lock size={16} style={{ color: '#94a3b8', marginRight: 6 }} />}
              placeholder="••••••••"
              size="large"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <Button type="primary" htmlType="submit" size="large" block loading={loading} icon={<ArrowRight size={16} />}>
            Sign In as Technician
          </Button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Not a technician?{' '}
            <Link to={ROUTES.LOGIN} style={{ color: '#2563eb', fontWeight: 600 }}>
              Standard Login
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default EmployeeLoginPage;
