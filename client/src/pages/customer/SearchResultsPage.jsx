import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Typography, Tag, Space, message } from 'antd';
import { Search, Layers, Briefcase } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import SkeletonCard from '../../components/common/SkeletonCard';
import Footer from '../../layouts/Footer';
import { customerService } from '../../services/customer.service';

const { Title, Text } = Typography;

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const categoryId = searchParams.get('category') || '';

  const [results, setResults] = useState({ companies: [], categories: [], services: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If no search query and no category filter, do nothing
    if (!query.trim() && !categoryId) return;

    const performSearch = async () => {
      setLoading(true);
      try {
        const res = await customerService.searchMarketplace(query, categoryId);
        if (res.success) {
          setResults(res.data);
        }
      } catch (err) {
        message.error(err.message || 'Marketplace search failed');
      } finally {
        setLoading(false);
      }
    };
    performSearch();
  }, [query, categoryId]);

  const getHeaderTitle = () => {
    if (query) return `Search Results for "${query}"`;
    if (categoryId && results.services.length > 0) {
      return `Services in Category: ${results.services[0].category_name}`;
    }
    return 'Browse Services';
  };

  return (
    <div>
      <PageHeader
        title={getHeaderTitle()}
        subtitle="Found matching service categories and listings."
      />

      {loading ? (
        <SkeletonCard rows={6} />
      ) : (
        <div>
          {/* Services Section */}
          <Card title={<Space><Briefcase size={18} /> Service Offerings ({results.services.length})</Space>} bordered={false} style={{ marginBottom: 24, borderRadius: 16 }}>
            <Row gutter={[16, 16]}>
              {results.services.map(serv => (
                <Col xs={24} sm={12} md={8} key={serv.id}>
                  <Card hoverable onClick={() => navigate(`/services/${serv.id}`)}>
                    <Title level={5} style={{ margin: '0 0 4px' }}>{serv.service_name}</Title>
                    <Tag color="blue" style={{ marginBottom: 8 }}>{serv.category_name}</Tag>
                    <strong style={{ color: '#16a34a', display: 'block' }}>${Number(serv.starting_price).toFixed(2)}</strong>
                  </Card>
                </Col>
              ))}

              {results.services.length === 0 && (
                <Col span={24}><Text type="secondary">No matching services found under this category.</Text></Col>
              )}
            </Row>
          </Card>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default SearchResultsPage;
