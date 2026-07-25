const request = require('supertest');
const app = require('../app');

describe('Admin Module Suite', () => {
  it('should block unauthorized access without token', async () => {
    const res = await request(app).get('/api/admin/dashboard');
    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toEqual(false);
  });

  it('should block non-admin users from admin dashboard', async () => {
    // Attempting with invalid or customer token
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', 'Bearer invalid_token_here');
    expect(res.statusCode).toEqual(401);
  });
});
