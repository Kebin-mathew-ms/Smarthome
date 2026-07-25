import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Tabs, Typography, Button, Space, message } from 'antd';
import { Heart, Building2, Briefcase, Trash2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import AppButton from '../../components/common/AppButton';
import SkeletonCard from '../../components/common/SkeletonCard';
import Footer from '../../layouts/Footer';
import { customerService } from '../../services/customer.service';
import { ROUTES } from '../../constants/routes';

const { Title, Text } = Typography;

const FavoritesPage = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState({ companies: [], services: [] });
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await customerService.getFavorites();
      if (res.success) {
        setFavorites(res.data);
      }
    } catch (err) {
      message.error(err.message || 'Failed to fetch favorites');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleRemove = async (favId) => {
    try {
      await customerService.removeFavorite(favId);
      message.success('Removed from favorites');
      fetchFavorites();
    } catch (err) {
      message.error(err.message || 'Failed to remove favorite');
    }
  };

  const CompaniesTab = (
    <Row gutter={[20, 20]}>
      {favorites.companies.map(item => (
        <Col xs={24} sm={12} lg={8} key={item.favorite_id}>
          <Card
            hoverable
            bordered={false}
            bodyStyle={{ padding: 20 }}
            actions={[
              <Trash2 key="del" size={16} style={{ color: '#ef4444' }} onClick={() => handleRemove(item.favorite_id)} />,
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

      {favorites.companies.length === 0 && (
        <Col span={24}>
          <Card bordered={false} style={{ textAlign: 'center', padding: '40px 0' }}>
            <Heart size={40} style={{ color: '#94a3b8', marginBottom: 12 }} />
            <Title level={5}>No Favorited Companies</Title>
            <Text type="secondary">Save service provider companies to quickly access them later.</Text>
          </Card>
        </Col>
      )}
    </Row>
  );

  const ServicesTab = (
    <Row gutter={[20, 20]}>
      {favorites.services.map(item => (
        <Col xs={24} sm={12} lg={8} key={item.favorite_id}>
          <Card
            hoverable
            bordered={false}
            bodyStyle={{ padding: 20 }}
            actions={[
              <Trash2 key="del" size={16} style={{ color: '#ef4444' }} onClick={() => handleRemove(item.favorite_id)} />,
              <ArrowRight key="view" size={16} onClick={() => navigate(`/services/${item.service_id}`)} />
            ]}
          >
            <Title level={5} style={{ margin: '0 0 4px', fontWeight: 700 }}>{item.service_name}</Title>
            <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 12 }}>
              By {item.company_name} ({item.category_name})
            </Text>
            <strong style={{ color: '#16a34a', fontSize: 18 }}>${Number(item.starting_price).toFixed(2)}</strong>
          </Card>
        </Col>
      ))}

      {favorites.services.length === 0 && (
        <Col span={24}>
          <Card bordered={false} style={{ textAlign: 'center', padding: '40px 0' }}>
            <Briefcase size={40} style={{ color: '#94a3b8', marginBottom: 12 }} />
            <Title level={5}>No Favorited Services</Title>
            <Text type="secondary">Save service listings to compare pricing and features.</Text>
          </Card>
        </Col>
      )}
    </Row>
  );

  const items = [
    { key: 'companies', label: `Saved Companies (${favorites.companies.length})`, children: CompaniesTab },
    { key: 'services', label: `Saved Services (${favorites.services.length})`, children: ServicesTab }
  ];

  return (
    <div>
      <PageHeader
        title="My Saved Favorites"
        subtitle="Quick access to your saved service provider companies and favorite services."
      />

      {loading ? (
        <SkeletonCard rows={6} />
      ) : (
        <Tabs defaultActiveKey="companies" items={items} size="large" style={{ background: '#ffffff', padding: 24, borderRadius: 16 }} />
      )}

      <Footer />
    </div>
  );
};

export default FavoritesPage;
