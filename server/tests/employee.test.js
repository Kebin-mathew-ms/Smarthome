const request = require('supertest');
const app = require('../app');

describe('Employee (Field Technician) Portal Suite', () => {
  describe('POST /api/employee/login', () => {
    it('should reject technician login with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/employee/login')
        .send({
          email: 'invalid.tech@company.com',
          password: 'WrongPassword!'
        });
      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toEqual(false);
    });
  });

  describe('GET /api/employee/dashboard', () => {
    it('should reject unauthenticated technician dashboard access', async () => {
      const res = await request(app).get('/api/employee/dashboard');
      expect(res.statusCode).toEqual(401);
    });
  });
});
