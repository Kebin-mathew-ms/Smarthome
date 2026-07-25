# Smart Home Care Enterprise SaaS Platform — API Reference

## Base URL
`/api`

## Authentication
Bearer Token header: `Authorization: Bearer <JWT_TOKEN>`

---

## 1. Authentication Endpoints (`/api`)
- `POST /register`: Register new Customer or Company account.
- `POST /login`: Authenticate credentials & return JWT.
- `GET /profile`: Get logged-in user profile.

## 2. Customer Marketplace Endpoints (`/api`)
- `GET /customer/companies`: Browse multi-tenant service providers with filters.
- `GET /customer/companies/:id`: View company details & **all services offered by company on same page**.
- `GET /customer/services/:id`: Service details view.
- `POST /customer/favorites`: Toggle favorite company.
- `POST /customer/follow`: Follow company.

## 3. Booking & Payment Endpoints (`/api`)
- `GET/POST/PUT/DELETE /addresses`: Manage customer address book.
- `POST /bookings`: Create atomic booking order transaction.
- `GET /bookings`: Fetch customer booking history.
- `GET /bookings/:id`: Fetch booking details, live status timeline & assigned technicians.
- `PATCH /bookings/cancel`: Cancel booking.
- `PATCH /bookings/reschedule`: Reschedule booking.
- `POST /payments/create-order`: Create Razorpay payment order.
- `POST /payments/verify`: HMAC signature verification.
- `GET /invoice/:bookingId`: Fetch booking invoice details.

## 4. Real-Time Chat & Work Updates Endpoints (`/api`)
- `GET /chat/rooms/:bookingId`: Join/Fetch private booking chat room.
- `GET /chat/messages/:roomId`: Fetch chat message stream.
- `POST /chat/message`: Send chat message.
- `POST /chat/upload/image`, `video`, `voice`, `document`: Upload chat attachments.
- `GET /work-updates/:bookingId`: Fetch work progress timeline.
- `POST /work-updates`: Post before/after photos & completion video update.

## 5. Experience, Support & Rewards Endpoints (`/api`)
- `GET/POST /reviews`: Customer completed booking reviews.
- `GET/POST /complaints`: Support ticket management with attachments.
- `GET /warranties`: Active & past service warranties.
- `POST /coupon/apply`: Redeem promotional coupon code.
- `GET /notifications`: Notification feed & unread status.

## 6. Enterprise Analytics & Health Endpoints (`/api`)
- `GET /admin/analytics`: Business Intelligence KPIs.
- `GET /company/analytics`: Provider analytics.
- `GET /reports/bookings`: Exportable booking reports.
- `GET /system/health`, `/health/database`, `/health/socket`, `/health/storage`: Infrastructure telemetry.
- `GET /backup`: Generate downloadable production snapshot.
