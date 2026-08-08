const request = require('supertest');
const app = require('../app');
const { query } = require('../config/db');

describe('Full Platform SQA Regression Suite', () => {
  describe('1. API Response Contract Consistency', () => {
    it('should return standard JSON envelope format { success, message, data } on public endpoints', async () => {
      const res = await request(app).get('/api/production/health');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success');
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('data');
    });

    it('should return standard error envelope format { success: false, message } on 404', async () => {
      const res = await request(app).get('/api/non-existent-endpoint-xyz');
      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toEqual(false);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('2. Role Permission Matrix Enforcement', () => {
    it('should reject unauthenticated request to /api/admin/dashboard with 401', async () => {
      const res = await request(app).get('/api/admin/dashboard');
      expect(res.statusCode).toEqual(401);
    });

    it('should reject unauthenticated request to /api/volunteer/dashboard with 401', async () => {
      const res = await request(app).get('/api/volunteer/dashboard');
      expect(res.statusCode).toEqual(401);
    });

    it('should reject unauthenticated request to /api/bookings with 401', async () => {
      const res = await request(app).get('/api/bookings');
      expect(res.statusCode).toEqual(401);
    });
  });

  describe('3. Database Migrations Schema Integrity', () => {
    it('should confirm all core tables exist in MySQL database', async () => {
      const tables = [
        'users',
        'companies',
        'services',
        'volunteers',
        'bookings',
        'payments',
        'invoices',
        'chat_rooms',
        'chat_messages',
        'reviews',
        'complaints',
        'warranties',
        'coupon_codes',
        'system_announcements',
        'activity_logs',
        'volunteer_sessions',
        'volunteer_checkins',
        'volunteer_signatures',
        'volunteer_daily_logs'
      ];

      for (const tbl of tables) {
        const rows = await query(`SHOW TABLES LIKE ?`, [tbl]);
        expect(rows.length).toBeGreaterThan(0);
      }
    });
  });
});
