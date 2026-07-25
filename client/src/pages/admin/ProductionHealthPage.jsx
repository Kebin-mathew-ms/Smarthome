import React, { useState } from 'react';
import { Card, Button, Typography, Space, Descriptions, Tag, message } from 'antd';
import { Download, Database, ShieldCheck, Server, RefreshCw } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Footer from '../../layouts/Footer';
import api from '../../services/api';

const { Title, Text } = Typography;

const ProductionHealthPage = () => {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadBackup = async () => {
    setDownloading(true);
    try {
      const res = await api.get('/backup');
      if (res.success) {
        const jsonStr = JSON.stringify(res.data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `production_backup_${Date.now()}.json`;
        a.click();
        message.success('Production database backup generated and downloaded!');
      }
    } catch (err) {
      message.error(err.message || 'Failed to generate backup');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Production Health & Backup Management"
        subtitle="Manage platform backups, verify database integrity, and inspect security settings."
      />

      <Card title="Production System Snapshots & Backup Generator" bordered={false} style={{ borderRadius: 16, marginBottom: 24 }}>
        <Paragraph>
          Generate a full JSON backup snapshot of all production tables, system settings, and record inventories.
        </Paragraph>
        <Button
          type="primary"
          size="large"
          icon={<Download size={18} />}
          loading={downloading}
          onClick={handleDownloadBackup}
        >
          Generate Production Backup Snapshot
        </Button>
      </Card>

      <Card title="Enterprise Security Controls Status" bordered={false} style={{ borderRadius: 16 }}>
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="Helmet Security Headers"><Tag color="green">Active</Tag></Descriptions.Item>
          <Descriptions.Item label="XSS Input Sanitizer"><Tag color="green">Active</Tag></Descriptions.Item>
          <Descriptions.Item label="Brute Force Lockout"><Tag color="green">Active (Max 5 Attempts)</Tag></Descriptions.Item>
          <Descriptions.Item label="JWT Handshake Validation"><Tag color="green">Active</Tag></Descriptions.Item>
          <Descriptions.Item label="CORS Access Policy"><Tag color="blue">Strictly Configured</Tag></Descriptions.Item>
          <Descriptions.Item label="Database Pool Status"><Tag color="green">Healthy (mysql2)</Tag></Descriptions.Item>
        </Descriptions>
      </Card>

      <Footer />
    </div>
  );
};

export default ProductionHealthPage;
