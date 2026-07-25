import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Tag, Button, Space, message } from 'antd';
import { ShieldCheck, Calendar, Building2, Download, FileText } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import SkeletonCard from '../../components/common/SkeletonCard';
import Footer from '../../layouts/Footer';
import { experienceService } from '../../services/experience.service';
import { formatDate } from '../../utils/formatters';

const { Title, Text, Paragraph } = Typography;

const WarrantyCenterPage = () => {
  const [warranties, setWarranties] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWarranties = async () => {
    setLoading(true);
    try {
      const res = await experienceService.getWarranties();
      if (res.success) setWarranties(res.data);
    } catch (err) {
      message.error(err.message || 'Failed to fetch warranties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarranties();
  }, []);

  return (
    <div>
      <PageHeader
        title="Warranty & Guarantee Management"
        subtitle="Track active service guarantees, warranty numbers, and validity periods issued by providers."
      />

      {loading ? (
        <SkeletonCard rows={6} />
      ) : (
        <Row gutter={[20, 20]}>
          {warranties.map(war => {
            const isExpired = new Date(war.valid_until) < new Date();
            return (
              <Col xs={24} sm={12} key={war.id}>
                <Card
                  bordered={false}
                  style={{ borderRadius: 16, border: isExpired ? '1px solid #cbd5e1' : '2px solid #16a34a' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <Tag color="blue" style={{ fontSize: 12, fontWeight: 700 }}>{war.warranty_number}</Tag>
                    <Tag color={isExpired ? 'red' : 'green'} icon={<ShieldCheck size={12} />}>
                      {isExpired ? 'Expired' : 'Active Warranty'}
                    </Tag>
                  </div>

                  <Title level={5} style={{ margin: '0 0 6px', fontWeight: 700 }}>{war.title}</Title>
                  <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 12 }}>
                    Provider: {war.company_name} | Service: {war.service_name}
                  </Text>

                  <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8, fontSize: 13, marginBottom: 12 }}>
                    <div><strong>Valid From:</strong> {formatDate(war.valid_from)}</div>
                    <div><strong>Valid Until:</strong> {formatDate(war.valid_until)}</div>
                    {war.terms && <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Terms: {war.terms}</div>}
                  </div>

                  <Button type="primary" ghost size="small" icon={<Download size={14} />}>
                    Download Guarantee Slip
                  </Button>
                </Card>
              </Col>
            );
          })}

          {warranties.length === 0 && (
            <Col span={24}>
              <Card bordered={false} style={{ textAlign: 'center', padding: '40px 0' }}>
                <ShieldCheck size={40} style={{ color: '#94a3b8', marginBottom: 12 }} />
                <Title level={5}>No Active Warranties Found</Title>
                <Text type="secondary">Completed service warranties will automatically appear here.</Text>
              </Card>
            </Col>
          )}
        </Row>
      )}

      <Footer />
    </div>
  );
};

export default WarrantyCenterPage;
