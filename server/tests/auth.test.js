const request = require('supertest');
const app = require('../app');

describe('Authentication API Suite', () => {
  describe('POST /api/register', () => {
    it('should register a new customer successfully', async () => {
      const res = await request(app)
        .post('/api/register')
        .send({
          first_name: 'Test',
          last_name: 'Customer Automated',
          email: `test_${Date.now()}@example.com`,
          password: 'Password123!',
          phone: `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`,
          role: 'User'
        });
      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toEqual(true);
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data.user).toHaveProperty('id');
    });

    it('should fail registration with invalid email format', async () => {
      const res = await request(app)
        .post('/api/register')
        .send({
          first_name: 'Test',
          last_name: 'Customer',
          email: 'invalid-email-format',
          password: 'Password123!',
          phone: '+19876543210',
          role: 'User'
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toEqual(false);
    });
  });

  describe('POST /api/login', () => {
    it('should fail login with wrong credentials', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'WrongPassword!'
        });
      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toEqual(false);
    });
  });
});
