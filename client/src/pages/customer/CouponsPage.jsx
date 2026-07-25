import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Tag, Input, Button, Space, Statistic, message } from 'antd';
import { Tag as CouponIcon, Gift, CheckCircle, Copy } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import SkeletonCard from '../../components/common/SkeletonCard';
import Footer from '../../layouts/Footer';
import { experienceService } from '../../services/experience.service';
import { formatDate } from '../../utils/formatters';

const { Title, Text, Paragraph } = Typography;

const CouponsPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [rewards, setRewards] = useState({ totalSpent: 0, rewardPoints: 0 });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const cRes = await experienceService.getCoupons();
      if (cRes.success) setCoupons(cRes.data);

      const rRes = await experienceService.getUserRewardPoints();
      if (rRes.success) setRewards(rRes.data);
    } catch (err) {
      message.error(err.message || 'Failed to fetch coupons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    message.success(`Coupon code ${code} copied to clipboard!`);
  };

  return (
    <div>
      <PageHeader
        title="Coupons & Reward Points Program"
        subtitle="Redeem promotional discount codes and track accumulated loyalty points."
      />

      <Row gutter={[20, 20]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12}>
          <Card bordered={false} style={{ borderRadius: 16, background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: '#fff' }}>
            <Statistic
              title={<span style={{ color: '#bfdbfe' }}>Loyalty Reward Points Balance</span>}
              value={rewards.rewardPoints}
              suffix="Pts"
              valueStyle={{ color: '#ffffff', fontWeight: 800, fontSize: 32 }}
            />
            <Text style={{ color: '#93c5fd', fontSize: 12, marginTop: 8, display: 'block' }}>
              Earn 10 Reward Points for every $100 spent on completed services.
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12}>
          <Card bordered={false} style={{ borderRadius: 16, background: '#f8fafc' }}>
            <Statistic
              title="Total Completed Service Spend"
              value={rewards.totalSpent}
              prefix="$"
              precision={2}
              valueStyle={{ color: '#16a34a', fontWeight: 800, fontSize: 32 }}
            />
            <Text type="secondary" style={{ fontSize: 12, marginTop: 8, display: 'block' }}>
              Lifetime value spent across platform service providers.
            </Text>
          </Card>
        </Col>
      </Row>

      <Title level={4}>Available Promotional Coupons</Title>

      {loading ? (
        <SkeletonCard rows={6} />
      ) : (
        <Row gutter={[20, 20]}>
          {coupons.map(c => (
            <Col xs={24} sm={12} md={8} key={c.id}>
              <Card bordered={false} style={{ borderRadius: 16, border: '1px dashed #2563eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <Tag color="blue" style={{ fontSize: 14, fontWeight: 700, padding: '4px 8px' }}>{c.coupon_code}</Tag>
                  <Button size="small" icon={<Copy size={12} />} onClick={() => handleCopyCode(c.coupon_code)}>
                    Copy Code
                  </Button>
                </div>

                <Title level={4} style={{ margin: '0 0 4px', color: '#16a34a' }}>
                  {c.discount_type === 'percentage' ? `${c.discount_value}% OFF` : `$${c.discount_value} OFF`}
                </Title>

                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
                  Min order amount: ${c.minimum_amount} | Valid till {formatDate(c.expiry_date)}
                </Text>
              </Card>
            </Col>
          ))}

          {coupons.length === 0 && (
            <Col span={24}>
              <Card bordered={false} style={{ textAlign: 'center', padding: '30px 0' }}>
                <CouponIcon size={40} style={{ color: '#94a3b8', marginBottom: 12 }} />
                <Title level={5}>No Active Coupons Available</Title>
              </Card>
            </Col>
          )}
        </Row>
      )}

      <Footer />
    </div>
  );
};

export default CouponsPage;
