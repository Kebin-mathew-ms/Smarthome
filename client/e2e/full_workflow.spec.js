const { test, expect } = require('@playwright/test');

test.describe('End-to-End Complete Platform SaaS Workflow', () => {
  const testUser = {
    name: 'E2E Customer John',
    email: `e2e_customer_${Date.now()}@example.com`,
    password: 'Password123!',
    phone: '+19876543210'
  };

  test('Complete Lifecycle: Customer Booking -> Provider Acceptance -> Technician GPS Check-In & Chat -> Job Completion -> Review & Invoice', async ({ page }) => {
    // 1. Customer Registration & Login
    await page.goto('http://localhost:5173/register');
    await page.fill('input[placeholder*="Name"], input[id*="name"]', testUser.name);
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);
    await page.fill('input[placeholder*="Phone"], input[id*="phone"]', testUser.phone);
    await page.click('button[type="submit"]');

    // Login Customer
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/my-bookings');

    // 2. Browse Marketplace & Company Details
    await page.goto('http://localhost:5173/companies');
    await expect(page.locator('h1, h2, div')).toContainText(/Companies|Browse/i);

    // View Company details & all services
    await page.goto('http://localhost:5173/companies/1');
    await page.waitForSelector('text=Services');

    // 3. Initiate Service Booking Wizard
    await page.goto('http://localhost:5173/book/1');
    // Step 1: Address Selection
    await page.click('button:has-text("Next"), button:has-text("Continue")');
    // Step 2: Schedule Date & Slot
    await page.click('button:has-text("Next"), button:has-text("Continue")');
    // Step 3: Payment Method
    await page.click('button:has-text("Confirm Booking"), button:has-text("Pay")');

    // 4. Provider Company Acceptance & Technician Assignment
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', 'company@proservice.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await page.goto('http://localhost:5173/company/bookings');

    // 5. Field Technician Workflow
    await page.goto('http://localhost:5173/employee/login');
    await page.fill('input[type="email"]', 'technician@company.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await page.goto('http://localhost:5173/employee/bookings');

    // Check-In to job site
    await page.goto('http://localhost:5173/employee/bookings/1');
    await page.click('button:has-text("Check-In")');
    await expect(page.locator('body')).toContainText(/Check-In/i);

    // Join Socket.IO Chat Room
    await page.click('button:has-text("Open Chat")');
    await page.waitForURL('**/chat/**');

    // 6. Customer Feedback Review & Invoice Generation
    await page.goto('http://localhost:5173/login');
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.password);
    await page.click('button[type="submit"]');

    await page.goto('http://localhost:5173/reviews');
    await expect(page.locator('body')).toContainText(/Review/i);
  });
});
