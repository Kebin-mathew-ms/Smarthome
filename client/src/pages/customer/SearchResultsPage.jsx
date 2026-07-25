import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Typography, Tag, Input, Space, message } from 'antd';
import { Search, Building2, Layers, Briefcase } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import SkeletonCard from '../../components/common/SkeletonCard';
import Footer from '../../layouts/Footer';
import { customerService } from '../../services/customer.service';

const { Title, Text } = Typography;

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';

  const [results, setResults] = useState({ companies: [], categories: [], services: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) return;

    const performSearch = async () => {
      setLoading(true);
      try {
        const res = await customerService.searchMarketplace(query);
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
  }, [query]);

  return (
    <div>
      <PageHeader
        title={`Search Results for "${query}"`}
        subtitle="Found matching companies, service categories, and listings."
      />

      {loading ? (
        <SkeletonCard rows={6} />
      ) : (
        <div>
          {/* Companies Section */}
          <Card title={<Space><Building2 size={18} /> Provider Companies ({results.companies.length})</Space>} bordered={false} style={{ marginBottom: 24, borderRadius: 16 }}>
            <Row gutter={[16, 16]}>
              {results.companies.map(comp => (
                <Col xs={24} sm={12} md={8} key={comp.id}>
                  <Card hoverable onClick={() => navigate(`/companies/${comp.id}`)}>
                    <Title level={5} style={{ margin: 0 }}>{comp.company_name}</Title>
                    <Text type="secondary">{comp.city}</Text>
                  </Card>
                </Col>
              ))}

              {results.companies.length === 0 && (
                <Col span={24}><Text type="secondary">No matching provider companies found.</Text></Col>
              )}
            </Row>
          </Card>

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
                <Col span={24}><Text type="secondary">No matching services found.</Text></Col>
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
