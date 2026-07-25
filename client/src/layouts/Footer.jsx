import React from 'react';
import { Typography, Row, Col, Space } from 'antd';
import { Wrench, ShieldCheck, Phone, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

const { Title, Text, Paragraph } = Typography;

const Footer = () => {
  return (
    <footer style={{ background: '#0f172a', color: '#94a3b8', padding: '48px 24px 24px', marginTop: 48, borderRadius: '16px 16px 0 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Row gutter={[32, 32]}>
          <Col xs={24} md={8}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Wrench size={20} />
              </div>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#f8fafc' }}>Smart Home Care</span>
            </div>
            <Paragraph style={{ color: '#94a3b8', fontSize: 14 }}>
              Connecting homeowners with certified, top-rated home maintenance service provider companies for plumbing, electrical, cleaning, painting and gardening.
            </Paragraph>
          </Col>

          <Col xs={12} sm={8} md={5}>
            <Title level={5} style={{ color: '#f8fafc', marginBottom: 16 }}>Marketplace</Title>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Link to={ROUTES.HOME} style={{ color: '#94a3b8' }}>Home</Link>
              <Link to={ROUTES.COMPANIES} style={{ color: '#94a3b8' }}>Browse Companies</Link>
              <Link to={ROUTES.CATEGORIES} style={{ color: '#94a3b8' }}>Categories</Link>
              <Link to={ROUTES.FAVORITES} style={{ color: '#94a3b8' }}>Saved Favorites</Link>
            </div>
          </Col>

          <Col xs={12} sm={8} md={5}>
            <Title level={5} style={{ color: '#f8fafc', marginBottom: 16 }}>Services</Title>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ color: '#94a3b8' }}>Plumbing Services</span>
              <span style={{ color: '#94a3b8' }}>Electrical Repairs</span>
              <span style={{ color: '#94a3b8' }}>House Cleaning</span>
              <span style={{ color: '#94a3b8' }}>Interior Painting</span>
              <span style={{ color: '#94a3b8' }}>Gardening & Lawn</span>
            </div>
          </Col>

          <Col xs={24} sm={8} md={6}>
            <Title level={5} style={{ color: '#f8fafc', marginBottom: 16 }}>Contact & Support</Title>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14 }}>
              <div><Phone size={14} style={{ marginRight: 8, color: '#3b82f6' }} />+1 (800) 555-CARE</div>
              <div><Mail size={14} style={{ marginRight: 8, color: '#3b82f6' }} />support@smarthomecare.com</div>
              <div><MapPin size={14} style={{ marginRight: 8, color: '#3b82f6' }} />Marketplace HQ, San Francisco</div>
            </div>
          </Col>
        </Row>

        <div style={{ borderTop: '1px solid #1e293b', marginTop: 36, paddingTop: 24, textAlign: 'center', fontSize: 13 }}>
          © {new Date().getFullYear()} Smart Home Care & Maintenance Service Marketplace. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
