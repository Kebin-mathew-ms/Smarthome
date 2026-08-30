const request = require('supertest');
const app = require('../app');
const { query } = require('../config/db');

describe('Service Customization & Dynamic Pricing Tests', () => {
  describe('1. Database Tables Integrity', () => {
    it('should confirm all new customization tables exist in MySQL database', async () => {
      const tables = [
        'customization_groups',
        'customization_options',
        'package_option_configs',
        'booking_customizations'
      ];

      for (const tbl of tables) {
        const rows = await query(`SHOW TABLES LIKE ?`, [tbl]);
        expect(rows.length).toBeGreaterThan(0);
      }
    });
  });

  describe('2. Customization API Contract Verification', () => {
    it('should retrieve resolved customization options for Painting service', async () => {
      // Find Painting service
      const services = await query(`SELECT id FROM services WHERE service_name LIKE '%Painting%' LIMIT 1`);
      if (services.length > 0) {
        const serviceId = services[0].id;
        const res = await request(app).get(`/api/services/${serviceId}/customizations`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toEqual(true);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThan(0);

        const firstGroup = res.body.data[0];
        expect(firstGroup).toHaveProperty('group_name');
        expect(firstGroup).toHaveProperty('options');
        expect(firstGroup.options.length).toBeGreaterThan(0);
      }
    });
  });
});
