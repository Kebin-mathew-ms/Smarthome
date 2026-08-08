const request = require('supertest');
const app = require('../app');

describe('System Health & Analytics Telemetry Suite', () => {
  describe('GET /api/production/health', () => {
    it('should return general health status UP', async () => {
      const res = await request(app).get('/api/production/health');
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toEqual(true);
      expect(res.body.data.status).toEqual('UP');
    });
  });

  describe('GET /api/production/health/database', () => {
    it('should return database health status', async () => {
      const res = await request(app).get('/api/production/health/database');
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toEqual(true);
      expect(res.body.data).toHaveProperty('database');
    });
  });
});
