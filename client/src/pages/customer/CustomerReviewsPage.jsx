import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Rate, Typography, Tag, Button, Space, message } from 'antd';
import { Star, MessageSquare, ThumbsUp, Plus } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import SkeletonCard from '../../components/common/SkeletonCard';
import ReviewModal from '../../components/reviews/ReviewModal';
import Footer from '../../layouts/Footer';
import { experienceService } from '../../services/experience.service';
import { bookingService } from '../../services/booking.service';
import { formatDate } from '../../utils/formatters';

const { Title, Text, Paragraph } = Typography;

const CustomerReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [completedBookings, setCompletedBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const revRes = await experienceService.getUserReviews();
      if (revRes.success) setReviews(revRes.data);

      const bkRes = await bookingService.getUserBookings({ status: 'Completed', limit: 50 });
      if (bkRes.success) setCompletedBookings(bkRes.data.items);
    } catch (err) {
      message.error(err.message || 'Failed to fetch reviews data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenReview = (booking) => {
    setSelectedBooking(booking);
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = async (formData) => {
    await experienceService.createReview(formData);
    message.success('Review published successfully!');
    fetchData();
  };

  return (
    <div>
      <PageHeader
        title="Customer Ratings & Service Reviews"
        subtitle="Manage your feedback, post reviews for completed jobs, and rate providers."
      />

      {loading ? (
        <SkeletonCard rows={6} />
      ) : (
        <Row gutter={[20, 20]}>
          {/* Completed Bookings awaiting review */}
          <Col span={24}>
            <Card title="Completed Jobs Ready for Review" bordered={false} style={{ borderRadius: 16, marginBottom: 16 }}>
              {completedBookings.length > 0 ? (
                <Row gutter={[16, 16]}>
                  {completedBookings.map(bk => {
                    const alreadyReviewed = reviews.some(r => r.booking_id === bk.id);
                    return (
                      <Col xs={24} sm={12} md={8} key={bk.id}>
                        <Card size="small" style={{ borderRadius: 12, border: '1px solid #e2e8f0' }}>
                          <strong style={{ display: 'block' }}>{bk.service_name}</strong>
                          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
                            {bk.company_name} | {bk.scheduled_date}
                          </Text>
                          {alreadyReviewed ? (
                            <Tag color="green">Reviewed</Tag>
                          ) : (
                            <Button type="primary" size="small" icon={<Star size={14} />} onClick={() => handleOpenReview(bk)}>
                              Write Review
                            </Button>
                          )}
                        </Card>
                      </Col>
                    );
                  })}
                </Row>
              ) : (
                <Text type="secondary">No recent completed bookings pending review.</Text>
              )}
            </Card>
          </Col>

          {/* Published Reviews */}
          <Col span={24}>
            <Title level={4}>My Published Reviews ({reviews.length})</Title>
            {reviews.map(rev => (
              <Card key={rev.id} bordered={false} style={{ borderRadius: 16, marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div>
                    <strong style={{ fontSize: 16, color: '#0f172a' }}>{rev.review_title}</strong>
                    <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
                      {rev.service_name} at {rev.company_name} • {formatDate(rev.created_at)}
                    </Text>
                  </div>
                  <Rate disabled defaultValue={Number(rev.rating)} style={{ fontSize: 16 }} />
                </div>

                <Paragraph style={{ margin: '8px 0 12px', color: '#334155' }}>
                  {rev.review_description}
                </Paragraph>

                {rev.recommend && (
                  <Tag color="green" icon={<ThumbsUp size={12} />}>Recommends Provider</Tag>
                )}
              </Card>
            ))}
          </Col>
        </Row>
      )}

      <ReviewModal
        open={isReviewModalOpen}
        onCancel={() => setIsReviewModalOpen(false)}
        booking={selectedBooking}
        onSubmitReview={handleSubmitReview}
      />

      <Footer />
    </div>
  );
};

export default CustomerReviewsPage;
