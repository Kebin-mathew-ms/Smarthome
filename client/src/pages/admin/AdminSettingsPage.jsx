import React from 'react';
import { Card, Form, Input, Switch, Button, message, Divider, Typography } from 'antd';
import PageHeader from '../../components/common/PageHeader';

const { Title, Text } = Typography;

const AdminSettingsPage = () => {
  const onFinish = () => {
    message.success('Platform settings updated successfully');
  };

  return (
    <div>
      <PageHeader
        title="Platform Settings"
        subtitle="Global system settings, email notifications and security preferences."
      />

      <Card bordered={false} style={{ maxWidth: 800 }}>
        <Form layout="vertical" onFinish={onFinish} initialValues={{ siteName: 'Smart Home Care', supportEmail: 'support@smarthomecare.com', enableRegistration: true, requireEmailVerification: false }}>
          <Title level={5}>System Configuration</Title>
          <Form.Item label="Platform Name" name="siteName" rules={[{ required: true }]}>
            <Input size="large" />
          </Form.Item>

          <Form.Item label="Support Email Address" name="supportEmail" rules={[{ required: true, type: 'email' }]}>
            <Input size="large" />
          </Form.Item>

          <Divider />

          <Title level={5}>Security & Registration Controls</Title>
          <Form.Item label="Allow Public Customer Registration" name="enableRegistration" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item label="Enforce Strict Email Verification" name="requireEmailVerification" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Button type="primary" htmlType="submit" size="large" style={{ marginTop: 16 }}>
            Save Platform Settings
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default AdminSettingsPage;
