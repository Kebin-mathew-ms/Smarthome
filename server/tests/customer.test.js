const request = require('supertest');
const app = require('../app');

describe('Customer Marketplace Suite', () => {
  describe('GET /api/customer/companies', () => {
    it('should return company providers listing for marketplace', async () => {
      const res = await request(app).get('/api/customer/companies');
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toEqual(true);
      expect(Array.isArray(res.body.data.items)).toEqual(true);
    });
  });

  describe('GET /api/customer/companies/:id', () => {
    it('should handle non-existent company id gracefully', async () => {
      const res = await request(app).get('/api/customer/companies/999999');
      expect(res.statusCode).toBeOneOf([404, 200]);
    });
  });
});
