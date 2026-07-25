import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Steps, Row, Col, Card, Typography, DatePicker, Select, Radio, Input, Button, Tag, Space, Descriptions, message } from 'antd';
import { Calendar, Clock, MapPin, CreditCard, ShieldCheck, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import dayjs from 'dayjs';
import PageHeader from '../../components/common/PageHeader';
import AppButton from '../../components/common/AppButton';
import FormField from '../../components/common/FormField';
import SkeletonCard from '../../components/common/SkeletonCard';
import Footer from '../../layouts/Footer';
import { customerService } from '../../services/customer.service';
import { bookingService } from '../../services/booking.service';
import { ROUTES } from '../../constants/routes';

const { Title, Text, Paragraph } = Typography;

const timeSlots = [
  '08:00 AM - 10:00 AM',
  '10:00 AM - 12:00 PM',
  '12:00 PM - 02:00 PM',
  '02:00 PM - 04:00 PM',
  '04:00 PM - 06:00 PM'
];

const BookingWizardPage = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0);
  const [service, setService] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form Selections
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  const [scheduledDate, setScheduledDate] = useState(dayjs().add(1, 'day'));
  const [scheduledTime, setScheduledTime] = useState(timeSlots[0]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const servRes = await customerService.getServiceById(serviceId);
        if (servRes.success) {
          setService(servRes.data);
          if (servRes.data.packages && servRes.data.packages.length > 0) {
            setSelectedPackageId(servRes.data.packages[0].id);
          }
        }

        const addrRes = await bookingService.getAddresses();
        if (addrRes.success) {
          setAddresses(addrRes.data);
          const def = addrRes.data.find(a => a.is_default);
          if (def) setSelectedAddressId(def.id);
          else if (addrRes.data[0]) setSelectedAddressId(addrRes.data[0].id);
        }
      } catch (err) {
        message.error(err.message || 'Failed to initialize booking wizard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [serviceId]);

  if (loading) {
    return (
      <div>
        <PageHeader title="Service Booking Wizard" subtitle="Loading..." />
        <SkeletonCard rows={8} />
      </div>
    );
  }

  if (!service) {
    return (
      <div>
        <PageHeader title="Service Not Found" />
        <Button onClick={() => navigate(ROUTES.COMPANIES)}>Return to Marketplace</Button>
      </div>
    );
  }

  // Price Calculation
  let basePrice = Number(service.starting_price);
  let pkgObj = null;

  if (selectedPackageId && service.packages) {
    pkgObj = service.packages.find(p => p.id === selectedPackageId);
    if (pkgObj) basePrice = Number(pkgObj.price);
  }

  const tax = Number((basePrice * 0.10).toFixed(2));
  const grandTotal = basePrice + tax;

  const handleBookingSubmit = async () => {
    if (!selectedAddressId) {
      message.warning('Please select a delivery address before placing booking.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        company_id: service.company_id,
        service_id: service.id,
        package_id: selectedPackageId,
        address_id: selectedAddressId,
        scheduled_date: scheduledDate.format('YYYY-MM-DD'),
        scheduled_time: scheduledTime,
        payment_method: paymentMethod,
        special_instructions: specialInstructions
      };

      const res = await bookingService.createBooking(payload);
      if (res.success) {
        const booking = res.data;

        if (paymentMethod === 'Razorpay') {
          // Trigger Razorpay Order Creation & Payment Verification
          const orderRes = await bookingService.createRazorpayOrder(booking.id);
          if (orderRes.success) {
            const orderData = orderRes.data;
            message.success('Simulated Razorpay Checkout verification initiated...');
            await bookingService.verifyPayment({
              razorpay_order_id: orderData.order_id,
              razorpay_payment_id: `pay_${Date.now()}`,
              razorpay_signature: 'simulated_sig',
              payment_reference: orderData.payment_reference
            });
          }
        }

        message.success('Booking placed successfully!');
        navigate(`/bookings/${booking.id}`);
      }
    } catch (err) {
      message.error(err.message || 'Booking submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { title: 'Package & Schedule', icon: <Calendar size={16} /> },
    { title: 'Address', icon: <MapPin size={16} /> },
    { title: 'Payment Method', icon: <CreditCard size={16} /> },
    { title: 'Review & Confirm', icon: <CheckCircle2 size={16} /> }
  ];

  return (
    <div>
      <PageHeader
        title={`Book Service: ${service.service_name}`}
        subtitle={`Provider: ${service.company_name}`}
      />

      <Card bordered={false} style={{ marginBottom: 24, borderRadius: 16 }}>
        <Steps current={currentStep} items={steps} style={{ marginBottom: 32 }} />

        {/* Step 1: Package & Schedule */}
        {currentStep === 0 && (
          <div>
            <Title level={4}>1. Select Package & Schedule</Title>

            {service.packages && service.packages.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <Text strong style={{ display: 'block', marginBottom: 12 }}>Choose Package Tier</Text>
                <Row gutter={[16, 16]}>
                  {service.packages.map(pkg => (
                    <Col xs={24} sm={12} md={8} key={pkg.id}>
                      <Card
                        hoverable
                        onClick={() => setSelectedPackageId(pkg.id)}
                        style={{ border: selectedPackageId === pkg.id ? '2px solid #2563eb' : '1px solid #e2e8f0', borderRadius: 12 }}
                      >
                        <Title level={5} style={{ margin: 0, color: '#2563eb' }}>{pkg.package_name}</Title>
                        <strong style={{ fontSize: 20, color: '#16a34a', display: 'block', margin: '8px 0' }}>
                          ${Number(pkg.price).toFixed(2)}
                        </strong>
                        <Text type="secondary" style={{ fontSize: 12 }}>{pkg.package_description || 'Standard package'}</Text>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            )}

            <Row gutter={24}>
              <Col xs={24} sm={12}>
                <FormField label="Preferred Service Date" required>
                  <DatePicker
                    value={scheduledDate}
                    onChange={setScheduledDate}
                    disabledDate={d => d && d.isBefore(dayjs(), 'day')}
                    style={{ width: '100%' }}
                    size="large"
                  />
                </FormField>
              </Col>

              <Col xs={24} sm={12}>
                <FormField label="Preferred Time Slot" required>
                  <Select value={scheduledTime} onChange={setScheduledTime} style={{ width: '100%' }} size="large">
                    {timeSlots.map(slot => (
                      <Select.Option key={slot} value={slot}>{slot}</Select.Option>
                    ))}
                  </Select>
                </FormField>
              </Col>
            </Row>

            <div style={{ textAlign: 'right', marginTop: 24 }}>
              <Button type="primary" size="large" onClick={() => setCurrentStep(1)}>
                Next: Select Address <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Address Selection */}
        {currentStep === 1 && (
          <div>
            <Title level={4}>2. Select Dispatch Address</Title>

            <Row gutter={[16, 16]}>
              {addresses.map(addr => (
                <Col xs={24} sm={12} key={addr.id}>
                  <Card
                    hoverable
                    onClick={() => setSelectedAddressId(addr.id)}
                    style={{ border: selectedAddressId === addr.id ? '2px solid #2563eb' : '1px solid #e2e8f0', borderRadius: 12 }}
                  >
                    <Tag color="blue">{addr.label}</Tag>
                    <Title level={5} style={{ margin: '8px 0 4px' }}>{addr.contact_person} ({addr.phone})</Title>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      {addr.house_name}, {addr.street}, {addr.city}, {addr.state} - {addr.postal_code}
                    </Text>
                  </Card>
                </Col>
              ))}

              {addresses.length === 0 && (
                <Col span={24}>
                  <Card bordered={false} style={{ textAlign: 'center', padding: '30px 0' }}>
                    <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>No address available.</Text>
                    <Button type="primary" onClick={() => navigate(ROUTES.ADDRESSES)}>Add New Address</Button>
                  </Card>
                </Col>
              )}
            </Row>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
              <Button size="large" onClick={() => setCurrentStep(0)}><ArrowLeft size={16} /> Back</Button>
              <Button type="primary" size="large" disabled={!selectedAddressId} onClick={() => setCurrentStep(2)}>
                Next: Payment Method <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Payment Method */}
        {currentStep === 2 && (
          <div>
            <Title level={4}>3. Select Payment Method & Instructions</Title>

            <div style={{ marginBottom: 24 }}>
              <Radio.Group value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} style={{ width: '100%' }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Card style={{ borderRadius: 12, border: paymentMethod === 'Cash' ? '2px solid #2563eb' : undefined }}>
                    <Radio value="Cash">
                      <strong>Pay Cash on Service Delivery</strong>
                      <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>Pay in person after service completion.</Text>
                    </Radio>
                  </Card>
                  <Card style={{ borderRadius: 12, border: paymentMethod === 'Razorpay' ? '2px solid #2563eb' : undefined }}>
                    <Radio value="Razorpay">
                      <strong>Online Payment (Razorpay / UPI / Card / Net Banking)</strong>
                      <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>Instant secure digital payment.</Text>
                    </Radio>
                  </Card>
                </Space>
              </Radio.Group>
            </div>

            <FormField label="Special Instructions / Access Notes (Optional)">
              <Input.TextArea
                rows={3}
                placeholder="e.g. Please ring doorbell twice, gate code #1234..."
                value={specialInstructions}
                onChange={e => setSpecialInstructions(e.target.value)}
              />
            </FormField>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
              <Button size="large" onClick={() => setCurrentStep(1)}><ArrowLeft size={16} /> Back</Button>
              <Button type="primary" size="large" onClick={() => setCurrentStep(3)}>
                Next: Review Order <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Summary & Confirm */}
        {currentStep === 3 && (
          <div>
            <Title level={4}>4. Order Summary & Final Confirmation</Title>

            <Descriptions column={2} bordered size="small" style={{ marginBottom: 24 }}>
              <Descriptions.Item label="Service">{service.service_name}</Descriptions.Item>
              <Descriptions.Item label="Provider">{service.company_name}</Descriptions.Item>
              <Descriptions.Item label="Package">{pkgObj ? pkgObj.package_name : 'Standard'}</Descriptions.Item>
              <Descriptions.Item label="Date & Time">{scheduledDate.format('YYYY-MM-DD')} ({scheduledTime})</Descriptions.Item>
              <Descriptions.Item label="Payment Method">{paymentMethod}</Descriptions.Item>
              <Descriptions.Item label="Estimated Subtotal">${basePrice.toFixed(2)}</Descriptions.Item>
              <Descriptions.Item label="Estimated Tax (10%)">${tax.toFixed(2)}</Descriptions.Item>
              <Descriptions.Item label="Grand Total"><strong style={{ color: '#16a34a', fontSize: 18 }}>${grandTotal.toFixed(2)}</strong></Descriptions.Item>
            </Descriptions>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button size="large" onClick={() => setCurrentStep(2)}><ArrowLeft size={16} /> Back</Button>
              <AppButton type="primary" size="large" loading={submitting} onClick={handleBookingSubmit}>
                Confirm & Place Booking
              </AppButton>
            </div>
          </div>
        )}
      </Card>

      <Footer />
    </div>
  );
};

export default BookingWizardPage;
