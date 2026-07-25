require('dotenv').config();
const { query } = require('../config/db');
const logger = require('../config/logger');

async function runDatabaseIntegrityVerification() {
  console.log('================================================================');
  console.log('    SMART HOME CARE — DATABASE INTEGRITY VERIFICATION SUITE    ');
  console.log('================================================================\n');

  let passedChecks = 0;
  let failedChecks = 0;

  // Helper tester
  const assertIntegrity = (checkTitle, orphanRows) => {
    if (orphanRows.length === 0) {
      console.log(`[PASS] ${checkTitle}`);
      passedChecks++;
    } else {
      console.error(`[FAIL] ${checkTitle} — Found ${orphanRows.length} invalid/orphan record(s):`, orphanRows);
      failedChecks++;
    }
  };

  try {
    // Check 1: Every booking has a valid customer
    const orphanBookings = await query(`
      SELECT b.id, b.booking_number, b.user_id
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      WHERE u.id IS NULL
    `);
    assertIntegrity('Check 1: Every booking references a valid customer account', orphanBookings);

    // Check 2: Every assigned employee belongs to the correct company
    const mismatchedEmployees = await query(`
      SELECT be.booking_id, be.employee_id, b.company_id AS booking_company, ce.company_id AS employee_company
      FROM booking_employees be
      JOIN bookings b ON be.booking_id = b.id
      JOIN company_employees ce ON be.employee_id = ce.id
      WHERE b.company_id != ce.company_id
    `);
    assertIntegrity('Check 2: Every assigned technician belongs to the matching booking company', mismatchedEmployees);

    // Check 3: Payments reference valid bookings
    const orphanPayments = await query(`
      SELECT p.id, p.payment_reference, p.booking_id
      FROM payments p
      LEFT JOIN bookings b ON p.booking_id = b.id
      WHERE b.id IS NULL
    `);
    assertIntegrity('Check 3: Payments reference valid, existing bookings', orphanPayments);

    // Check 4: Chat messages belong to valid booking rooms
    const orphanChatMessages = await query(`
      SELECT cm.id, cm.room_id, cm.sender_id
      FROM chat_messages cm
      LEFT JOIN chat_rooms cr ON cm.room_id = cr.id
      WHERE cr.id IS NULL
    `);
    assertIntegrity('Check 4: Chat messages belong to valid active booking rooms', orphanChatMessages);

    // Check 5: Reviews exist ONLY for completed bookings
    const invalidReviews = await query(`
      SELECT r.id, r.booking_id, r.rating, b.booking_status
      FROM reviews r
      JOIN bookings b ON r.booking_id = b.id
      WHERE b.booking_status != 'Completed'
    `);
    assertIntegrity('Check 5: Reviews exist ONLY on completed bookings (1 per booking restriction)', invalidReviews);

    // Check 6: No orphan records in employee checkins and signatures
    const orphanCheckins = await query(`
      SELECT ec.id, ec.booking_id, ec.employee_id
      FROM employee_checkins ec
      LEFT JOIN bookings b ON ec.booking_id = b.id
      WHERE b.id IS NULL
    `);
    assertIntegrity('Check 6: Employee GPS check-in records reference valid bookings', orphanCheckins);

    // Check 7: Inactive employee assignments
    const inactiveEmployeeAssignments = await query(`
      SELECT be.booking_id, be.employee_id, ce.status AS employee_status
      FROM booking_employees be
      JOIN company_employees ce ON be.employee_id = ce.id
      WHERE ce.status != 'active'
    `);
    assertIntegrity('Check 7: No inactive/soft-deleted technicians assigned to bookings', inactiveEmployeeAssignments);

    console.log('\n================================================================');
    console.log(` VERIFICATION COMPLETE | PASSED: ${passedChecks} | FAILED: ${failedChecks}`);
    console.log('================================================================');

    process.exit(failedChecks === 0 ? 0 : 1);
  } catch (error) {
    console.error('Database Verification Error:', error.message);
    process.exit(1);
  }
}

runDatabaseIntegrityVerification();
