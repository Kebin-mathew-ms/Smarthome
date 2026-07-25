import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Button, Space, message } from 'antd';
import { Building2, UserCheck, ArrowRight, UserX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import AppButton from '../../components/common/AppButton';
import SkeletonCard from '../../components/common/SkeletonCard';
import Footer from '../../layouts/Footer';
import { customerService } from '../../services/customer.service';

const { Title, Text } = Typography;

const FollowingPage = () => {
  const navigate = useNavigate();
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFollowing = async () => {
    setLoading(true);
    try {
      const res = await customerService.getFollowing();
      if (res.success) {
        setFollowing(res.data);
      }
    } catch (err) {
      message.error(err.message || 'Failed to fetch followed companies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowing();
  }, []);

  const handleUnfollow = async (companyId) => {
    try {
      await customerService.unfollowCompany(companyId);
      message.success('Unfollowed company');
      fetchFollowing();
    } catch (err) {
      message.error(err.message || 'Failed to unfollow company');
    }
  };

  return (
    <div>
      <PageHeader
        title="Followed Service Providers"
        subtitle="Companies you follow for promotional updates, service additions, and announcements."
      />

      {loading ? (
        <SkeletonCard rows={6} />
      ) : (
        <Row gutter={[20, 20]}>
          {following.map(item => (
            <Col xs={24} sm={12} lg={8} key={item.follow_id}>
              <Card
                hoverable
                bordered={false}
                bodyStyle={{ padding: 20 }}
                actions={[
                  <UserX key="unfollow" size={16} style={{ color: '#ef4444' }} onClick={() => handleUnfollow(item.company_id)} />,
                  <ArrowRight key="view" size={16} onClick={() => navigate(`/companies/${item.company_id}`)} />
                ]}
              >
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                    {item.company_name.charAt(0)}
                  </div>
                  <div>
                    <Title level={5} style={{ margin: 0, fontWeight: 700 }}>{item.company_name}</Title>
                    <Text type="secondary" style={{ fontSize: 12 }}>{item.city}, {item.state}</Text>
                  </div>
                </div>
              </Card>
            </Col>
          ))}

          {following.length === 0 && (
            <Col span={24}>
              <Card bordered={false} style={{ textAlign: 'center', padding: '40px 0' }}>
                <UserCheck size={40} style={{ color: '#94a3b8', marginBottom: 12 }} />
                <Title level={5}>No Followed Companies</Title>
                <Text type="secondary">Follow companies from their profile pages to receive updates.</Text>
              </Card>
            </Col>
          )}
        </Row>
      )}

      <Footer />
    </div>
  );
};

export default FollowingPage;
