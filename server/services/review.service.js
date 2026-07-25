const reviewRepository = require('../repositories/review.repository');
const bookingRepository = require('../repositories/booking.repository');
const userNotificationRepository = require('../repositories/userNotification.repository');
const auditLogService = require('./auditLog.service');
const Review = require('../models/review.model');

class ReviewService {
  async createReview(user, ipAddress, data, files = []) {
    const booking = await bookingRepository.findById(data.booking_id);
    if (!booking) {
      const error = new Error('Booking not found.');
      error.statusCode = 404;
      throw error;
    }

    if (booking.user_id !== user.id) {
      const error = new Error('Access forbidden. You can only review your own bookings.');
      error.statusCode = 403;
      throw error;
    }

    if (booking.booking_status !== 'Completed') {
      const error = new Error('Reviews can only be submitted for completed bookings.');
      error.statusCode = 400;
      throw error;
    }

    const existing = await reviewRepository.findByBookingId(data.booking_id);
    if (existing) {
      const error = new Error('A review has already been submitted for this booking.');
      error.statusCode = 400;
      throw error;
    }

    const reviewId = await reviewRepository.createReview({
      booking_id: data.booking_id,
      company_id: booking.company_id,
      service_id: booking.service_id,
      user_id: user.id,
      rating: data.rating,
      review_title: data.review_title,
      review_description: data.review_description,
      recommend: data.recommend !== undefined ? data.recommend : true
    });

    if (files && files.length) {
      for (const file of files) {
        let mediaType = 'image';
        if (file.mimetype.startsWith('video/')) mediaType = 'video';
        await reviewRepository.addMedia(reviewId, {
          media_type: mediaType,
          file_path: file.path
        });
      }
    }

    // Write Audit Log
    await auditLogService.log({
      user_id: user.id,
      action: 'Review Submitted',
      table_name: 'reviews',
      record_id: reviewId,
      ip_address: ipAddress
    });

    return reviewId;
  }

  async addReply(user, ipAddress, reviewId, replyText) {
    if (user.role !== 'Company') {
      const error = new Error('Only service provider companies can reply to customer reviews.');
      error.statusCode = 403;
      throw error;
    }
    await reviewRepository.addReply(reviewId, user.companyId || user.id, replyText);

    await auditLogService.log({
      user_id: user.id,
      action: 'Review Replied',
      table_name: 'review_replies',
      record_id: reviewId,
      ip_address: ipAddress
    });
  }

  async getCompanyReviews(companyId, query) {
    const list = await reviewRepository.findReviewsByCompanyId(companyId, query);
    return list.map(r => new Review(r));
  }

  async getUserReviews(userId) {
    const list = await reviewRepository.findReviewsByUserId(userId);
    return list.map(r => new Review(r));
  }
}

module.exports = new ReviewService();
