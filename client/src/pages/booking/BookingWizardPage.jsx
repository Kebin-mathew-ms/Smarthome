import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Steps, Row, Col, Card, Typography, DatePicker, Select, Radio, Input, Button, Tag, Space, Descriptions, Switch, InputNumber, Divider, message } from 'antd';
import { Calendar, Clock, MapPin, CreditCard, ShieldCheck, CheckCircle2, ArrowRight, ArrowLeft, Layers, Settings, Minus, Plus } from 'lucide-react';
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

  // Customization Options State
  const [customizationGroups, setCustomizationGroups] = useState([]);
  const [customizationLoading, setCustomizationLoading] = useState(false);
  const [selectedCustomizations, setSelectedCustomizations] = useState({});

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

  const fetchCustomizations = async (pkgId) => {
    setCustomizationLoading(true);
    try {
      const res = await customerService.getServiceCustomizations(serviceId, pkgId);
      if (res.success) {
        setCustomizationGroups(res.data);
        const initialSelections = {};
        for (const g of res.data) {
          if (g.selection_type === 'single') {
            const included = g.options.find(o => o.is_included) || g.options[0];
            if (included) {
              initialSelections[g.id] = {
                option_id: included.id,
                quantity: 1,
                price: Number(included.price),
                is_included: Boolean(included.is_included),
                option_name: included.option_name,
                group_name: g.group_name
              };
            }
          }
        }
        setSelectedCustomizations(initialSelections);
      }
    } catch (err) {
      console.error('Failed to load customizations', err);
    } finally {
      setCustomizationLoading(false);
    }
  };

  useEffect(() => {
    if (service && selectedPackageId) {
      fetchCustomizations(selectedPackageId);
    }
  }, [selectedPackageId, service]);

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
        <Button onClick={() => navigate(ROUTES.HOME)}>Return to Home</Button>
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

  const addOnsTotal = Object.values(selectedCustomizations)
    .filter(x => x && x.option_id)
    .reduce((sum, c) => sum + (c.is_included ? 0 : Number(c.price) * c.quantity), 0);

  const subtotal = basePrice + addOnsTotal;
  const tax = Number((subtotal * 0.10).toFixed(2));
  const grandTotal = subtotal + tax;

  const handleSingleSelect = (group, option) => {
    setSelectedCustomizations(prev => ({
      ...prev,
      [group.id]: {
        option_id: option.id,
        quantity: 1,
        price: Number(option.price),
        is_included: Boolean(option.is_included),
        option_name: option.option_name,
        group_name: group.group_name
      }
    }));
  };

  const handleToggleSelect = (group, option, checked) => {
    setSelectedCustomizations(prev => {
      const copy = { ...prev };
      if (checked) {
        copy[option.id] = {
          option_id: option.id,
          quantity: 1,
          price: Number(option.price),
          is_included: Boolean(option.is_included),
          option_name: option.option_name,
          group_name: group.group_name
        };
      } else {
        delete copy[option.id];
      }
      return copy;
    });
  };

  const handleQuantityChange = (group, option, quantity) => {
    setSelectedCustomizations(prev => {
      const copy = { ...prev };
      if (quantity > 0) {
        copy[option.id] = {
          option_id: option.id,
          quantity: quantity,
          price: Number(option.price),
          is_included: Boolean(option.is_included),
          option_name: option.option_name,
          group_name: group.group_name
        };
      } else {
        delete copy[option.id];
      }
      return copy;
    });
  };

  const handleBookingSubmit = async () => {
    if (!selectedAddressId) {
      message.warning('Please select a delivery address before placing booking.');
      return;
    }

    setSubmitting(true);
    try {
      const customizationsList = Object.values(selectedCustomizations)
        .filter(x => x && x.option_id)
        .map(c => ({
          option_id: c.option_id,
          quantity: c.quantity
        }));

      const payload = {
        service_id: service.id,
        package_id: selectedPackageId,
        address_id: selectedAddressId,
        scheduled_date: scheduledDate.format('YYYY-MM-DD'),
        scheduled_time: scheduledTime,
        payment_method: paymentMethod,
        special_instructions: specialInstructions,
        customizations: customizationsList
      };

      const res = await bookingService.createBooking(payload);
      if (res.success) {
        const booking = res.data;

        if (paymentMethod === 'Razorpay') {
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
    { title: 'Select Package', icon: <Layers size={16} /> },
    { title: 'Customize Service', icon: <Settings size={16} /> },
    { title: 'Select Address', icon: <MapPin size={16} /> },
    { title: 'Schedule', icon: <Calendar size={16} /> },
    { title: 'Review & Book', icon: <CheckCircle2 size={16} /> }
  ];

  return (
    <div>
      <PageHeader
        title={`Book Service: ${service.service_name}`}
        subtitle="Direct Booking Portal with Live Service Customization"
      />

      <Card bordered={false} style={{ marginBottom: 24, borderRadius: 16 }}>
        <Steps current={currentStep} items={steps} style={{ marginBottom: 32 }} />

        {/* Step 1: Select Package */}
        {currentStep === 0 && (
          <div>
            <Title level={4}>1. Choose Package Tier</Title>
            {service.packages && service.packages.length > 0 ? (
              <div style={{ marginBottom: 24 }}>
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
            ) : (
              <p>No package tiers available. Base pricing will apply.</p>
            )}

            <div style={{ textAlign: 'right', marginTop: 24 }}>
              <Button type="primary" size="large" onClick={() => setCurrentStep(1)}>
                Continue to Customize <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Customize Service */}
        {currentStep === 1 && (
          <div>
            <Title level={4} style={{ marginBottom: 20 }}>2. Customize Your Service</Title>

            {customizationLoading ? (
              <SkeletonCard rows={4} />
            ) : customizationGroups.length === 0 ? (
              <p>No customization options available for this service. Proceed to Address.</p>
            ) : (
              <div style={{ marginBottom: 32 }}>
                {customizationGroups.map(group => (
                  <Card
                    key={group.id}
                    title={<span style={{ fontWeight: 600 }}>{group.group_name} <Text type="secondary" style={{ fontSize: 12, fontWeight: 400 }}>({group.group_description})</Text></span>}
                    style={{ marginBottom: 20, borderRadius: 12 }}
                    bodyStyle={{ padding: '16px 24px' }}
                  >
                    {/* Single Select */}
                    {group.selection_type === 'single' && (
                      <Radio.Group
                        style={{ width: '100%' }}
                        value={selectedCustomizations[group.id]?.option_id}
                        onChange={e => {
                          const opt = group.options.find(o => o.id === e.target.value);
                          if (opt) handleSingleSelect(group, opt);
                        }}
                      >
                        <Space direction="vertical" style={{ width: '100%' }}>
                          {group.options.map(opt => (
                            <Radio key={opt.id} value={opt.id}>
                              <Space>
                                <strong style={{ fontSize: 14 }}>{opt.option_name}</strong>
                                {opt.description && <Text type="secondary" style={{ fontSize: 12 }}>— {opt.description}</Text>}
                                {opt.is_included ? <Tag color="green">Included</Tag> : <Tag color="blue">+${Number(opt.price).toFixed(2)}</Tag>}
                              </Space>
                            </Radio>
                          ))}
                        </Space>
                      </Radio.Group>
                    )}

                    {/* Toggle / Switch */}
                    {group.selection_type === 'toggle' && (
                      <Space direction="vertical" style={{ width: '100%' }}>
                        {group.options.map(opt => {
                          const isChecked = Boolean(selectedCustomizations[opt.id]);
                          return (
                            <div key={opt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
                              <div>
                                <strong style={{ fontSize: 14, display: 'block' }}>{opt.option_name}</strong>
                                {opt.description && <Text type="secondary" style={{ fontSize: 12 }}>{opt.description}</Text>}
                              </div>
                              <Space size="middle">
                                {opt.is_included ? <Tag color="green">Included</Tag> : <Tag color="blue">+${Number(opt.price).toFixed(2)}</Tag>}
                                <Switch checked={isChecked} onChange={checked => handleToggleSelect(group, opt, checked)} />
                              </Space>
                            </div>
                          );
                        })}
                      </Space>
                    )}

                    {/* Multi-Select / Checkbox */}
                    {group.selection_type === 'multi' && (
                      <Space direction="vertical" style={{ width: '100%' }}>
                        {group.options.map(opt => {
                          const isChecked = Boolean(selectedCustomizations[opt.id]);
                          return (
                            <div key={opt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
                              <div>
                                <strong style={{ fontSize: 14, display: 'block' }}>{opt.option_name}</strong>
                                {opt.description && <Text type="secondary" style={{ fontSize: 12 }}>{opt.description}</Text>}
                              </div>
                              <Space size="middle">
                                {opt.is_included ? <Tag color="green">Included</Tag> : <Tag color="blue">+${Number(opt.price).toFixed(2)}</Tag>}
                                <Switch checked={isChecked} onChange={checked => handleToggleSelect(group, opt, checked)} />
                              </Space>
                            </div>
                          );
                        })}
                      </Space>
                    )}

                    {/* Quantity-based Selector */}
                    {group.selection_type === 'quantity' && (
                      <Space direction="vertical" style={{ width: '100%' }}>
                        {group.options.map(opt => {
                          const selected = selectedCustomizations[opt.id];
                          const qty = selected ? selected.quantity : 0;
                          return (
                            <div key={opt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                              <div>
                                <strong style={{ fontSize: 14, display: 'block' }}>{opt.option_name}</strong>
                                {opt.description && <Text type="secondary" style={{ fontSize: 12 }}>{opt.description}</Text>}
                              </div>
                              <Space size="large">
                                {opt.is_included ? <Tag color="green">Included</Tag> : <Tag color="blue">+${Number(opt.price).toFixed(2)}</Tag>}
                                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: 8, overflow: 'hidden' }}>
                                  <Button
                                    size="small"
                                    type="text"
                                    icon={<Minus size={14} />}
                                    disabled={qty <= (opt.min_quantity || 0)}
                                    onClick={() => handleQuantityChange(group, opt, qty - 1)}
                                  />
                                  <span style={{ padding: '0 12px', fontWeight: 600, minWidth: 32, textAlign: 'center' }}>{qty}</span>
                                  <Button
                                    size="small"
                                    type="text"
                                    icon={<Plus size={14} />}
                                    disabled={opt.max_quantity !== null && qty >= opt.max_quantity}
                                    onClick={() => handleQuantityChange(group, opt, qty + 1)}
                                  />
                                </div>
                              </Space>
                            </div>
                          );
                        })}
                      </Space>
                    )}
                  </Card>
                ))}
              </div>
            )}

            {/* Live Pricing Box */}
            <Card style={{ background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 24 }}>
              <Row gutter={24} style={{ textAlign: 'center' }}>
                <Col span={8}>
                  <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase' }}>Base Price</Text>
                  <Title level={4} style={{ margin: '4px 0 0', color: '#1e293b' }}>${basePrice.toFixed(2)}</Title>
                </Col>
                <Col span={8} style={{ borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0' }}>
                  <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase' }}>Add-ons Total</Text>
                  <Title level={4} style={{ margin: '4px 0 0', color: '#3b82f6' }}>+${addOnsTotal.toFixed(2)}</Title>
                </Col>
                <Col span={8}>
                  <Text type="secondary" style={{ fontSize: 12, textTransform: 'uppercase' }}>Running Total</Text>
                  <Title level={4} style={{ margin: '4px 0 0', color: '#16a34a' }}>${subtotal.toFixed(2)}</Title>
                </Col>
              </Row>
            </Card>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button size="large" onClick={() => setCurrentStep(0)}><ArrowLeft size={16} /> Back</Button>
              <Button type="primary" size="large" onClick={() => setCurrentStep(2)}>
                Continue to Address <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Select Address */}
        {currentStep === 2 && (
          <div>
            <Title level={4}>3. Select Dispatch Address</Title>

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
              <Button size="large" onClick={() => setCurrentStep(1)}><ArrowLeft size={16} /> Back</Button>
              <Button type="primary" size="large" disabled={!selectedAddressId} onClick={() => setCurrentStep(3)}>
                Next: Select Schedule <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Schedule */}
        {currentStep === 3 && (
          <div>
            <Title level={4}>4. Select Date & Time Slot</Title>

            <Row gutter={24} style={{ marginTop: 20 }}>
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

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
              <Button size="large" onClick={() => setCurrentStep(2)}><ArrowLeft size={16} /> Back</Button>
              <Button type="primary" size="large" onClick={() => setCurrentStep(4)}>
                Next: Review & Payment <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        )}

        {/* Step 5: Review & Book */}
        {currentStep === 4 && (
          <div>
            <Title level={4}>5. Review Selections & Place Booking</Title>

            <Row gutter={24} style={{ marginTop: 20 }}>
              <Col xs={24} md={16}>
                <Descriptions title="Booking Overview" bordered size="small" column={1} style={{ marginBottom: 24 }}>
                  <Descriptions.Item label="Service">{service.service_name}</Descriptions.Item>
                  <Descriptions.Item label="Package">{pkgObj ? pkgObj.package_name : 'Standard'}</Descriptions.Item>
                  <Descriptions.Item label="Schedule">{scheduledDate.format('YYYY-MM-DD')} ({scheduledTime})</Descriptions.Item>
                  {Object.values(selectedCustomizations).filter(x => x && x.option_id).length > 0 && (
                    <Descriptions.Item label="Selected Customizations">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {Object.values(selectedCustomizations)
                          .filter(x => x && x.option_id)
                          .map(c => (
                            <div key={c.option_id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                              <span>
                                <Tag color="cyan">{c.group_name}</Tag>
                                <strong>{c.option_name}</strong>
                                {c.quantity > 1 && ` x ${c.quantity}`}
                              </span>
                              <span style={{ color: c.is_included ? '#16a34a' : '#475569' }}>
                                {c.is_included ? 'Included' : `$${(Number(c.price) * c.quantity).toFixed(2)}`}
                              </span>
                            </div>
                          ))}
                      </div>
                    </Descriptions.Item>
                  )}
                </Descriptions>

                <FormField label="Special Instructions / Access Notes (Optional)">
                  <Input.TextArea
                    rows={3}
                    placeholder="e.g. Please ring doorbell twice, gate code #1234..."
                    value={specialInstructions}
                    onChange={e => setSpecialInstructions(e.target.value)}
                  />
                </FormField>
              </Col>

              <Col xs={24} md={8}>
                <Card title="Payment & Pricing" style={{ borderRadius: 12, border: '1px solid #cbd5e1' }}>
                  <div style={{ marginBottom: 20 }}>
                    <Text strong style={{ display: 'block', marginBottom: 8 }}>Select Payment Method</Text>
                    <Radio.Group value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} style={{ width: '100%' }}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Radio value="Cash">Cash on Delivery</Radio>
                        <Radio value="Razorpay">Online Payment</Radio>
                      </Space>
                    </Radio.Group>
                  </div>

                  <Divider style={{ margin: '12px 0' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text type="secondary">Base Price</Text>
                    <Text>${basePrice.toFixed(2)}</Text>
                  </div>
                  {addOnsTotal > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text type="secondary">Add-ons</Text>
                      <Text>+${addOnsTotal.toFixed(2)}</Text>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text type="secondary">Estimated Tax (10%)</Text>
                    <Text>${tax.toFixed(2)}</Text>
                  </div>
                  <Divider style={{ margin: '12px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                    <strong style={{ fontSize: 16 }}>Grand Total</strong>
                    <strong style={{ color: '#16a34a', fontSize: 18 }}>${grandTotal.toFixed(2)}</strong>
                  </div>

                  <AppButton type="primary" size="large" block loading={submitting} onClick={handleBookingSubmit}>
                    Place Booking
                  </AppButton>
                </Card>
              </Col>
            </Row>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
              <Button size="large" onClick={() => setCurrentStep(3)}><ArrowLeft size={16} /> Back</Button>
            </div>
          </div>
        )}
      </Card>

      <Footer />
    </div>
  );
};

export default BookingWizardPage;
