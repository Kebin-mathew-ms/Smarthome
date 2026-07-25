require('dotenv').config();
const bcrypt = require('bcrypt');
const { pool } = require('../config/db');
const logger = require('../config/logger');

const hash = (plain) => bcrypt.hash(plain, 10);

async function insert(connection, table, rows) {
  const results = [];
  for (const row of rows) {
    const keys = Object.keys(row).map(k => `\`${k}\``).join(', ');
    const placeholders = Object.keys(row).map(() => '?').join(', ');
    const values = Object.values(row);
    const [result] = await connection.execute(
      `INSERT INTO \`${table}\` (${keys}) VALUES (${placeholders})`,
      values
    );
    results.push(result.insertId);
  }
  return results;
}

async function seed() {
  const connection = await pool.getConnection();

  try {
    logger.info('🌱  Starting comprehensive database seed across ALL tables...');
    await connection.beginTransaction();

    // ── 1. Users ──────────────────────────────────────────────────────────────
    logger.info('  → Seeding users...');
    const adminPassword     = await hash('Admin@123');
    const companyPassword   = await hash('Company@123');
    const userPassword      = await hash('User@123');
    const empPassword       = await hash('Emp@123');

    const [adminId, company1UserId, company2UserId, customer1Id, customer2Id, emp1UserId, emp2UserId] =
      await insert(connection, 'users', [
        {
          first_name: 'Super',
          last_name: 'Admin',
          email: 'admin@home.com',
          phone: '+91-9000000001',
          password: adminPassword,
          role: 'Admin',
          status: 'active',
        },
        {
          first_name: 'Ravi',
          last_name: 'Sharma',
          email: 'ravi@brightfix.com',
          phone: '+91-9000000002',
          password: companyPassword,
          role: 'Company',
          status: 'active',
        },
        {
          first_name: 'Priya',
          last_name: 'Nair',
          email: 'priya@cleanpro.com',
          phone: '+91-9000000003',
          password: companyPassword,
          role: 'Company',
          status: 'active',
        },
        {
          first_name: 'Arjun',
          last_name: 'Mehta',
          email: 'arjun@gmail.com',
          phone: '+91-9000000004',
          password: userPassword,
          role: 'User',
          status: 'active',
        },
        {
          first_name: 'Sneha',
          last_name: 'Pillai',
          email: 'sneha@gmail.com',
          phone: '+91-9000000005',
          password: userPassword,
          role: 'User',
          status: 'active',
        },
        {
          first_name: 'Karthik',
          last_name: 'Reddy',
          email: 'karthik@brightfix.com',
          phone: '+91-9200000001',
          password: empPassword,
          role: 'Employee',
          status: 'active',
        },
        {
          first_name: 'Divya',
          last_name: 'Lakshmi',
          email: 'divya@cleanpro.com',
          phone: '+91-9200000003',
          password: empPassword,
          role: 'Employee',
          status: 'active',
        }
      ]);

    // ── 2. Companies ──────────────────────────────────────────────────────────
    logger.info('  → Seeding companies...');
    const [company1Id, company2Id] = await insert(connection, 'companies', [
      {
        company_name: 'BrightFix Home Services',
        company_email: 'contact@brightfix.com',
        company_phone: '+91-9100000001',
        address: '14, MG Road, Indiranagar',
        city: 'Bengaluru',
        district: 'Bengaluru Urban',
        state: 'Karnataka',
        postal_code: '560038',
        description: 'Premium electrical and plumbing repair and maintenance services across Bengaluru.',
        status: 'active',
        created_by: adminId,
      },
      {
        company_name: 'CleanPro Solutions',
        company_email: 'hello@cleanpro.com',
        company_phone: '+91-9100000002',
        address: '7, Anna Salai, T Nagar',
        city: 'Chennai',
        district: 'Chennai',
        state: 'Tamil Nadu',
        postal_code: '600017',
        description: 'Professional home deep cleaning, sofa sanitization and hygiene experts.',
        status: 'active',
        created_by: adminId,
      },
    ]);

    // ── 3. Company Users & Settings ───────────────────────────────────────────
    logger.info('  → Seeding company settings...');
    await insert(connection, 'company_users', [
      { company_id: company1Id, user_id: company1UserId, designation: 'Owner' },
      { company_id: company2Id, user_id: company2UserId, designation: 'Director' },
    ]);

    await insert(connection, 'company_settings', [
      {
        company_id: company1Id,
        working_hours: '08:00 - 20:00',
        working_days: 'Monday - Sunday',
        service_radius: 30.00,
        minimum_booking_amount: 299.00,
        company_status: 'active',
        about_us: 'BrightFix has been serving homes across Bengaluru since 2018 with certified technicians.',
        mission: 'To make home maintenance stress-free for every household.',
        vision: 'Be the most trusted home services brand in South India.',
        emergency_service: true,
        website: 'https://brightfix.com',
      },
      {
        company_id: company2Id,
        working_hours: '09:00 - 18:00',
        working_days: 'Monday - Saturday',
        service_radius: 20.00,
        minimum_booking_amount: 499.00,
        company_status: 'active',
        about_us: 'CleanPro uses eco-friendly products and trained staff for spotless results.',
        mission: 'Deliver hygienic living spaces with green cleaning practices.',
        vision: 'Lead sustainable cleaning services in Tamil Nadu.',
        emergency_service: false,
        website: 'https://cleanpro.com',
      },
    ]);

    // ── 4. Service Categories & Subcategories ─────────────────────────────────
    logger.info('  → Seeding categories & subcategories...');
    const [
      electricalCatId,
      plumbingCatId,
      cleaningCatId,
      carpentryId,
      applianceCatId,
      paintingCatId,
    ] = await insert(connection, 'service_categories', [
      { category_name: 'Electrical', icon: 'zap',         description: 'Wiring, fittings, switches and electrical repairs.',         status: 'active' },
      { category_name: 'Plumbing',   icon: 'droplets',    description: 'Pipe repairs, drainage, water heaters and taps.',            status: 'active' },
      { category_name: 'Cleaning',   icon: 'sparkles',    description: 'Home, sofa, bathroom and deep cleaning services.',           status: 'active' },
      { category_name: 'Carpentry',  icon: 'hammer',      description: 'Furniture assembly, wood repairs and custom joinery.',       status: 'active' },
      { category_name: 'Appliances', icon: 'settings',    description: 'AC, washing machine, refrigerator servicing and repairs.',   status: 'active' },
      { category_name: 'Painting',   icon: 'paint-bucket',description: 'Interior and exterior painting, waterproofing.',             status: 'active' },
    ]);

    const [
      wiringSubId, switchSubId,
      pipeSubId, drainSubId,
      deepCleanSubId, sofaSubId, bathroomSubId,
      furnitureSubId, woodRepairSubId,
      acSubId, wmSubId,
      interiorSubId, exteriorSubId,
    ] = await insert(connection, 'service_subcategories', [
      { category_id: electricalCatId, subcategory_name: 'Wiring & Fittings',       icon: 'zap',      description: 'Full wiring, rewiring, light fittings.',     status: 'active' },
      { category_id: electricalCatId, subcategory_name: 'Switches & Sockets',      icon: 'plug',     description: 'Installation and replacement of switches.',   status: 'active' },
      { category_id: plumbingCatId,   subcategory_name: 'Pipe Repair & Leakage',   icon: 'wrench',   description: 'Burst pipe, leakage detection and sealing.',   status: 'active' },
      { category_id: plumbingCatId,   subcategory_name: 'Drain Cleaning',          icon: 'droplets', description: 'Blocked drain and sewer line clearing.',       status: 'active' },
      { category_id: cleaningCatId,   subcategory_name: 'Deep Home Cleaning',      icon: 'sparkles', description: 'Full flat/villa deep cleaning package.',       status: 'active' },
      { category_id: cleaningCatId,   subcategory_name: 'Sofa & Carpet Cleaning',  icon: 'sofa',     description: 'Steam and dry cleaning for sofas and rugs.',   status: 'active' },
      { category_id: cleaningCatId,   subcategory_name: 'Bathroom Sanitisation',   icon: 'shield',   description: 'Disinfection and tile scrubbing.',              status: 'active' },
      { category_id: carpentryId,     subcategory_name: 'Furniture Assembly',      icon: 'hammer',   description: 'Flat-pack and custom furniture assembly.',      status: 'active' },
      { category_id: carpentryId,     subcategory_name: 'Wood Repair & Polish',    icon: 'tree',     description: 'Door, window, cabinet repairs and polishing.',  status: 'active' },
      { category_id: applianceCatId,  subcategory_name: 'AC Service & Repair',     icon: 'wind',     description: 'Split/window AC cleaning, gas refill, repair.', status: 'active' },
      { category_id: applianceCatId,  subcategory_name: 'Washing Machine Repair',  icon: 'settings', description: 'Front/top load washing machine repairs.',       status: 'active' },
      { category_id: paintingCatId,   subcategory_name: 'Interior Painting',       icon: 'brush',    description: 'Room, hall and full-home interior painting.',   status: 'active' },
      { category_id: paintingCatId,   subcategory_name: 'Exterior Painting',       icon: 'home',     description: 'Exterior wall and waterproof coating.',         status: 'active' },
    ]);

    // ── 5. Services, Features & Packages ──────────────────────────────────────
    logger.info('  → Seeding services & packages...');
    const [svc1Id, svc2Id, svc3Id, svc4Id] = await insert(connection, 'services', [
      {
        company_id: company1Id,
        category_id: electricalCatId,
        subcategory_id: wiringSubId,
        service_name: 'Complete Home Electrical Wiring',
        short_description: 'End-to-end wiring for new or renovation projects.',
        full_description: 'Our certified electricians handle all wiring needs — from conduit laying to distribution board installation.',
        starting_price: 1499.00,
        estimated_duration: '4-8 hours',
        service_type: 'on_site',
        status: 'active',
      },
      {
        company_id: company1Id,
        category_id: plumbingCatId,
        subcategory_id: pipeSubId,
        service_name: 'Pipe Leak Detection & Repair',
        short_description: 'Fast diagnosis and sealing of water leaks.',
        full_description: 'Pinpoint and fix pipe leaks with minimal wall damage.',
        starting_price: 599.00,
        estimated_duration: '1-3 hours',
        service_type: 'on_site',
        status: 'active',
      },
      {
        company_id: company2Id,
        category_id: cleaningCatId,
        subcategory_id: deepCleanSubId,
        service_name: '3BHK Full Deep Cleaning',
        short_description: 'Comprehensive deep clean for 3-bedroom homes.',
        full_description: 'Hospital-grade eco-friendly cleaning agents for kitchen, bathrooms, bedrooms, and living areas.',
        starting_price: 2499.00,
        estimated_duration: '5-7 hours',
        service_type: 'on_site',
        status: 'active',
      },
      {
        company_id: company2Id,
        category_id: cleaningCatId,
        subcategory_id: sofaSubId,
        service_name: 'Sofa Steam Cleaning',
        short_description: 'Steam clean and deodorise sofas of any size.',
        full_description: 'High-pressure steam cleaning removes allergens, stains and odour.',
        starting_price: 799.00,
        estimated_duration: '1-2 hours',
        service_type: 'on_site',
        status: 'active',
      },
    ]);

    await insert(connection, 'service_features', [
      { service_id: svc1Id, feature_name: 'ISI certified wiring materials' },
      { service_id: svc1Id, feature_name: '1-year workmanship warranty' },
      { service_id: svc2Id, feature_name: 'Non-invasive leak detection' },
      { service_id: svc3Id, feature_name: 'Eco-friendly cleaning products' },
      { service_id: svc4Id, feature_name: 'Safe for kids and pets' },
    ]);

    const [pkg1Id, pkg2Id, pkg3Id, pkg4Id] = await insert(connection, 'service_packages', [
      { service_id: svc1Id, package_name: 'Basic Wiring', package_description: 'Wiring for 1 room.', price: 1499.00, estimated_duration: '2-3 hours', status: 'active' },
      { service_id: svc1Id, package_name: '2BHK Wiring', package_description: 'Full 2BHK wiring.', price: 3999.00, estimated_duration: '4-6 hours', status: 'active' },
      { service_id: svc3Id, package_name: 'Standard Deep Clean', package_description: '3BHK deep clean.', price: 2499.00, estimated_duration: '5-6 hours', status: 'active' },
      { service_id: svc4Id, package_name: '3-Seater Sofa Clean', package_description: 'Steam clean for 3-seater sofa.', price: 999.00, estimated_duration: '1 hour', status: 'active' },
    ]);

    // ── 6. Employees & Skills ─────────────────────────────────────────────────
    logger.info('  → Seeding employees & skills...');
    const [emp1Id, emp2Id, emp3Id, emp4Id] = await insert(connection, 'company_employees', [
      { company_id: company1Id, employee_name: 'Karthik Reddy',   email: 'karthik@brightfix.com', phone: '+91-9200000001', designation: 'Senior Electrician', address: 'Koramangala, Bengaluru', status: 'active' },
      { company_id: company1Id, employee_name: 'Suresh Kumar',    email: 'suresh@brightfix.com',  phone: '+91-9200000002', designation: 'Plumber',            address: 'JP Nagar, Bengaluru',   status: 'active' },
      { company_id: company2Id, employee_name: 'Divya Lakshmi',   email: 'divya@cleanpro.com',    phone: '+91-9200000003', designation: 'Lead Cleaner',        address: 'Velachery, Chennai',    status: 'active' },
      { company_id: company2Id, employee_name: 'Muthu Selvam',    email: 'muthu@cleanpro.com',    phone: '+91-9200000004', designation: 'Cleaning Technician', address: 'Adyar, Chennai',        status: 'active' },
    ]);

    await insert(connection, 'employee_skills', [
      { employee_id: emp1Id, subcategory_id: wiringSubId, experience_years: 6 },
      { employee_id: emp2Id, subcategory_id: pipeSubId,   experience_years: 4 },
      { employee_id: emp3Id, subcategory_id: deepCleanSubId, experience_years: 5 },
      { employee_id: emp4Id, subcategory_id: sofaSubId,   experience_years: 3 },
    ]);

    // ── 7. Marketplace: Addresses, Coupons, Favorites ─────────────────────────
    logger.info('  → Seeding marketplace tables (addresses, coupons, rewards, favorites)...');
    const [addr1Id, addr2Id] = await insert(connection, 'addresses', [
      { user_id: customer1Id, label: 'Home', contact_person: 'Arjun Mehta', phone: '+91-9000000004', house_name: '402, Oakwood Apartments', street: '100 Feet Road, Indiranagar', city: 'Bengaluru', district: 'Bengaluru Urban', state: 'Karnataka', postal_code: '560038', is_default: true },
      { user_id: customer2Id, label: 'Home', contact_person: 'Sneha Pillai', phone: '+91-9000000005', house_name: '12, Greenfield Villa', street: 'ECR Road, Thiruvanmiyur', city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', postal_code: '600041', is_default: true },
    ]);

    const [coupon1Id] = await insert(connection, 'coupon_codes', [
      { coupon_code: 'WELCOME100', discount_type: 'fixed', discount_value: 100.00, minimum_amount: 500.00, expiry_date: '2026-12-31', status: 'active' }
    ]);

    await insert(connection, 'user_coupons', [
      { coupon_id: coupon1Id, user_id: customer1Id, used: false }
    ]);

    await insert(connection, 'favorites', [
      { user_id: customer1Id, company_id: company1Id },
      { user_id: customer1Id, service_id: svc1Id },
      { user_id: customer2Id, company_id: company2Id }
    ]);

    await insert(connection, 'company_followers', [
      { user_id: customer1Id, company_id: company1Id },
      { user_id: customer2Id, company_id: company2Id }
    ]);

    // ── 8. Bookings & Payments ────────────────────────────────────────────────
    logger.info('  → Seeding bookings, status history, employees & payments...');
    const [booking1Id, booking2Id] = await insert(connection, 'bookings', [
      {
        booking_number: 'BK-2026-001',
        user_id: customer1Id,
        company_id: company1Id,
        service_id: svc1Id,
        package_id: pkg1Id,
        address_id: addr1Id,
        booking_status: 'Completed',
        payment_status: 'Paid',
        scheduled_date: '2026-07-20',
        scheduled_time: '10:00 AM',
        special_instructions: 'Need electrical wiring repair in master bedroom.',
        subtotal: 1499.00,
        discount_amount: 100.00,
        total_amount: 1399.00
      },
      {
        booking_number: 'BK-2026-002',
        user_id: customer2Id,
        company_id: company2Id,
        service_id: svc3Id,
        package_id: pkg3Id,
        address_id: addr2Id,
        booking_status: 'Work In Progress',
        payment_status: 'Paid',
        scheduled_date: '2026-07-21',
        scheduled_time: '02:00 PM',
        special_instructions: 'Full 3BHK deep cleaning needed.',
        subtotal: 2499.00,
        discount_amount: 0.00,
        total_amount: 2499.00
      }
    ]);

    await insert(connection, 'booking_services', [
      { booking_id: booking1Id, service_id: svc1Id, package_id: pkg1Id, service_price: 1499.00, quantity: 1, total_price: 1499.00 },
      { booking_id: booking2Id, service_id: svc3Id, package_id: pkg3Id, service_price: 2499.00, quantity: 1, total_price: 2499.00 },
    ]);

    await insert(connection, 'booking_status_history', [
      { booking_id: booking1Id, status: 'Confirmed', remarks: 'Booking confirmed with customer', changed_by: 'System' },
      { booking_id: booking1Id, status: 'Completed', remarks: 'Electrical job completed cleanly', changed_by: 'Karthik Reddy' },
      { booking_id: booking2Id, status: 'Confirmed', remarks: 'Cleaning slot confirmed', changed_by: 'System' },
      { booking_id: booking2Id, status: 'Work In Progress', remarks: 'Team arrived on site', changed_by: 'Divya Lakshmi' },
    ]);

    await insert(connection, 'booking_employees', [
      { booking_id: booking1Id, employee_id: emp1Id },
      { booking_id: booking2Id, employee_id: emp3Id }
    ]);

    await insert(connection, 'payments', [
      { booking_id: booking1Id, payment_reference: 'PAY-REF-001', payment_gateway: 'Razorpay', transaction_id: 'txn_1001', payment_status: 'Paid', amount: 1399.00, currency: 'INR' },
      { booking_id: booking2Id, payment_reference: 'PAY-REF-002', payment_gateway: 'Razorpay', transaction_id: 'txn_1002', payment_status: 'Paid', amount: 2499.00, currency: 'INR' },
    ]);

    await insert(connection, 'invoices', [
      { booking_id: booking1Id, invoice_number: 'INV-2026-001', invoice_date: '2026-07-20', invoice_path: '/uploads/invoices/inv_001.pdf' },
      { booking_id: booking2Id, invoice_number: 'INV-2026-002', invoice_date: '2026-07-21', invoice_path: '/uploads/invoices/inv_002.pdf' },
    ]);

    // ── 9. Chat & Collaboration ───────────────────────────────────────────────
    logger.info('  → Seeding chat rooms, messages & work updates...');
    const [room1Id] = await insert(connection, 'chat_rooms', [
      { booking_id: booking1Id, room_status: 'active' }
    ]);

    await insert(connection, 'chat_participants', [
      { room_id: room1Id, user_id: customer1Id, participant_role: 'Customer' },
      { room_id: room1Id, user_id: company1UserId, participant_role: 'Company' }
    ]);

    await insert(connection, 'chat_messages', [
      { room_id: room1Id, sender_id: customer1Id, message: 'Hello! What time will technician Karthik arrive?' },
      { room_id: room1Id, sender_id: company1UserId, message: 'Hi Arjun! Karthik will be at your location by 10:00 AM today.' }
    ]);

    await insert(connection, 'work_updates', [
      { booking_id: booking1Id, title: 'Panel Rewiring', description: 'Completed main circuit panel rewiring and safety check.', created_by: emp1UserId }
    ]);

    // ── 10. Reviews, Complaints & Warranties ──────────────────────────────────
    logger.info('  → Seeding reviews, complaints & warranties...');
    const [review1Id] = await insert(connection, 'reviews', [
      {
        booking_id: booking1Id,
        company_id: company1Id,
        service_id: svc1Id,
        user_id: customer1Id,
        employee_id: emp1Id,
        rating: 5.00,
        review_title: 'Exceptional Electrical Work!',
        review_description: 'Karthik was punctual, professional and completed the wiring seamlessly.',
        recommend: true
      }
    ]);

    await insert(connection, 'review_replies', [
      { review_id: review1Id, company_id: company1Id, reply: 'Thank you Arjun! Happy to keep your home safe.' }
    ]);

    await insert(connection, 'company_reviews_summary', [
      { company_id: company1Id, average_rating: 5.00, total_reviews: 1 },
      { company_id: company2Id, average_rating: 4.80, total_reviews: 3 }
    ]);

    const [complaint1Id] = await insert(connection, 'complaints', [
      {
        ticket_number: 'TCK-2026-001',
        user_id: customer1Id,
        company_id: company1Id,
        booking_id: booking1Id,
        subject: 'Invoice query',
        description: 'Wanted clarification on discount application.',
        priority: 'low',
        status: 'resolved'
      }
    ]);

    await insert(connection, 'complaint_messages', [
      { complaint_id: complaint1Id, sender_id: adminId, message: 'Discount of INR 100 was applied successfully on your final bill.' }
    ]);

    await insert(connection, 'warranties', [
      {
        booking_id: booking1Id,
        company_id: company1Id,
        warranty_number: 'WRN-2026-001',
        title: '1 Year Electrical Warranty',
        description: 'Coverage on internal wiring joints and DB switches.',
        valid_from: '2026-07-20',
        valid_until: '2027-07-20',
        terms: 'Standard usage policy applies.'
      }
    ]);

    // ── 11. Announcements, Notifications & Audit Logs ────────────────────────
    logger.info('  → Seeding announcements, notifications & audit logs...');
    await insert(connection, 'system_announcements', [
      { title: 'Monsoon Home Inspection Special', description: 'Get 15% off on all electrical and roof leakage inspections this month.', visible_to: 'all', start_date: '2026-07-01', end_date: '2026-08-31', status: 'active' }
    ]);

    await insert(connection, 'notifications', [
      { user_id: customer1Id, title: 'Booking Completed', message: 'Your booking BK-2026-001 has been marked as Completed.', notification_type: 'booking', read_status: false },
      { user_id: customer2Id, title: 'Technician Assigned', message: 'Divya Lakshmi has been assigned to your booking BK-2026-002.', notification_type: 'booking', read_status: false }
    ]);

    await insert(connection, 'activity_logs', [
      { user_id: adminId, activity: 'Seeded system database with test data', ip_address: '127.0.0.1' },
      { user_id: company1UserId, activity: 'Updated company profile details', ip_address: '127.0.0.1' }
    ]);

    await insert(connection, 'employee_checkins', [
      { employee_id: emp1Id, booking_id: booking1Id, check_in_time: '2026-07-20 09:55:00', check_out_time: '2026-07-20 12:30:00', notes: 'Job completed smoothly.' }
    ]);

    await connection.commit();
    logger.info('');
    logger.info('✅  ALL 20+ TABLES SEEDED SUCCESSFULLY!');
    logger.info('');
    logger.info('─────────────────────────────────────────────────────────────');
    logger.info('  🔑  System Login Accounts');
    logger.info('─────────────────────────────────────────────────────────────');
    logger.info('  SUPER ADMIN      : admin@home.com     / Admin@123');
    logger.info('  BRIGHTFIX OWNER  : ravi@brightfix.com / Company@123');
    logger.info('  CLEANPRO OWNER   : priya@cleanpro.com / Company@123');
    logger.info('  CUSTOMER 1       : arjun@gmail.com    / User@123');
    logger.info('  CUSTOMER 2       : sneha@gmail.com    / User@123');
    logger.info('  TECHNICIAN 1     : karthik@brightfix.com / Emp@123');
    logger.info('─────────────────────────────────────────────────────────────');

  } catch (error) {
    await connection.rollback();
    logger.error(`❌  Seed failed: ${error.message}`);
    logger.error(error.stack);
    process.exit(1);
  } finally {
    connection.release();
    process.exit(0);
  }
}

seed();
