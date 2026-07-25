-- Production Database Optimization & Composite Indexes

CREATE INDEX idx_bookings_user_status ON bookings (user_id, booking_status);
CREATE INDEX idx_bookings_company_status ON bookings (company_id, booking_status);
CREATE INDEX idx_bookings_scheduled_date ON bookings (scheduled_date);

CREATE INDEX idx_chat_messages_room_date ON chat_messages (room_id, created_at);

CREATE INDEX idx_reviews_company_rating ON reviews (company_id, rating);
CREATE INDEX idx_reviews_service_rating ON reviews (service_id, rating);

CREATE INDEX idx_complaints_user_status ON complaints (user_id, status);
CREATE INDEX idx_complaints_company_status ON complaints (company_id, status);

CREATE INDEX idx_payments_booking_status ON payments (booking_id, payment_status);

CREATE INDEX idx_services_company_status ON services (company_id, status);
