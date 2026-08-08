const request = require('supertest');
const app = require('../app');

describe('Volunteer Portal Suite', () => {
  describe('POST /api/volunteer/login', () => {
    it('should reject volunteer login with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/volunteer/login')
        .send({
          email: 'invalid.tech@company.com',
          password: 'WrongPassword!'
        });
      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toEqual(false);
    });
  });

  describe('GET /api/volunteer/dashboard', () => {
    it('should reject unauthenticated volunteer dashboard access', async () => {
      const res = await request(app).get('/api/volunteer/dashboard');
      expect(res.statusCode).toEqual(401);
    });
  });
});
