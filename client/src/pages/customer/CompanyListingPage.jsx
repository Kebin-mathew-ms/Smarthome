import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Input, Select, Checkbox, Rate, Tag, Button, Typography, Space, message } from 'antd';
import { Search, Building2, MapPin, Star, ShieldCheck, Phone, ArrowRight, Filter } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import AppTable from '../../components/common/AppTable';
import AppButton from '../../components/common/AppButton';
import SkeletonCard from '../../components/common/SkeletonCard';
import Footer from '../../layouts/Footer';
import { customerService } from '../../services/customer.service';
import { adminService } from '../../services/admin.service';
import { ROUTES } from '../../constants/routes';

const { Option } = Select;
const { Title, Text } = Typography;

const CompanyListingPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [companies, setCompanies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  // Filters State
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || undefined);
  const [cityFilter, setCityFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [emergencyFilter, setEmergencyFilter] = useState(false);
  const [sortOption, setSortOption] = useState('rating');

  const fetchCategories = async () => {
    try {
      const res = await adminService.getCategories({ page: 1, limit: 100 });
      if (res.success) setCategories(res.data.items);
    } catch {
      // ignore
    }
  };

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await customerService.getCompanies({
        page,
        limit: 9,
        search,
        category_id: categoryFilter,
        city: cityFilter,
        district: districtFilter,
        emergency: emergencyFilter ? 1 : undefined,
        sort: sortOption
      });
      if (res.success) {
        setCompanies(res.data.items);
        setTotal(res.data.total);
      }
    } catch (err) {
      message.error(err.message || 'Failed to fetch company marketplace listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [page, search, categoryFilter, cityFilter, districtFilter, emergencyFilter, sortOption]);

  return (
    <div>
      <PageHeader
        title="Service Company Marketplace"
        subtitle="Discover certified home care and maintenance companies in your location."
      />

      <Row gutter={[24, 24]}>
        {/* Filters Sidebar */}
        <Col xs={24} lg={6}>
          <Card title={<Space><Filter size={18} /> Filters</Space>} bordered={false} style={{ marginBottom: 24 }}>
            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ display: 'block', marginBottom: 6 }}>Search Company</Text>
              <Input
                prefix={<Search size={16} style={{ color: '#94a3b8', marginRight: 6 }} />}
                placeholder="Company name, city, district..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                allowClear
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ display: 'block', marginBottom: 6 }}>Service Category</Text>
              <Select
                placeholder="All Categories"
                value={categoryFilter}
                onChange={setCategoryFilter}
                style={{ width: '100%' }}
                allowClear
              >
                {categories.map(c => (
                  <Option key={c.id} value={c.id}>{c.category_name}</Option>
                ))}
              </Select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ display: 'block', marginBottom: 6 }}>City / Location</Text>
              <Input
                placeholder="e.g. San Francisco, San Jose..."
                value={cityFilter}
                onChange={e => setCityFilter(e.target.value)}
                allowClear
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ display: 'block', marginBottom: 6 }}>Badges & Capabilities</Text>
              <Checkbox checked={emergencyFilter} onChange={e => setEmergencyFilter(e.target.checked)}>
                24/7 Emergency Service
              </Checkbox>
            </div>

            <Button
              block
              onClick={() => {
                setSearch('');
                setCategoryFilter(undefined);
                setCityFilter('');
                setDistrictFilter('');
                setEmergencyFilter(false);
              }}
            >
              Reset Filters
            </Button>
          </Card>
        </Col>

        {/* Listings Content */}
        <Col xs={24} lg={18}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <Text type="secondary">
              Showing <strong>{companies.length}</strong> of <strong>{total}</strong> service provider companies
            </Text>

            <Space>
              <Text style={{ fontSize: 13 }}>Sort By:</Text>
              <Select value={sortOption} onChange={setSortOption} style={{ width: 170 }}>
                <Option value="rating">Highest Rated</Option>
                <Option value="newest">Newest First</Option>
                <Option value="oldest">Oldest First</Option>
                <Option value="alphabetical">Alphabetical (A-Z)</Option>
              </Select>
            </Space>
          </div>

          {loading ? (
            <Row gutter={[20, 20]}>
              {[1, 2, 3, 4, 5, 6].map(n => (
                <Col xs={24} sm={12} key={n}><SkeletonCard rows={4} /></Col>
              ))}
            </Row>
          ) : (
            <Row gutter={[20, 20]}>
              {companies.map(comp => (
                <Col xs={24} sm={12} key={comp.id}>
                  <Card
                    hoverable
                    bordered={false}
                    onClick={() => navigate(`/companies/${comp.id}`)}
                    bodyStyle={{ padding: 20 }}
                  >
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
                      <div style={{ width: 56, height: 56, borderRadius: 12, background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Building2 size={28} />
                      </div>
                      <div>
                        <Title level={5} style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>
                          {comp.company_name}
                        </Title>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          <MapPin size={12} style={{ marginRight: 4 }} />{comp.city}, {comp.state}
                        </Text>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Star size={16} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                        <strong style={{ fontSize: 14 }}>{Number(comp.average_rating).toFixed(1)}</strong>
                        <Text type="secondary" style={{ fontSize: 12 }}>({comp.total_reviews} reviews)</Text>
                      </div>

                      {comp.starting_price && (
                        <Text style={{ fontSize: 12, color: '#64748b' }}>
                          From <strong style={{ color: '#16a34a', fontSize: 14 }}>${Number(comp.starting_price).toFixed(2)}</strong>
                        </Text>
                      )}
                    </div>

                    <AppButton type="primary" block icon={<ArrowRight size={16} />}>
                      View Company & Services
                    </AppButton>
                  </Card>
                </Col>
              ))}

              {companies.length === 0 && (
                <Col span={24}>
                  <Card bordered={false} style={{ textAlign: 'center', padding: '48px 0' }}>
                    <Building2 size={48} style={{ color: '#94a3b8', marginBottom: 12 }} />
                    <Title level={4}>No Companies Found</Title>
                    <Text type="secondary">Try adjusting your search query or removing category/location filters.</Text>
                  </Card>
                </Col>
              )}
            </Row>
          )}
        </Col>
      </Row>

      <Footer />
    </div>
  );
};

export default CompanyListingPage;
