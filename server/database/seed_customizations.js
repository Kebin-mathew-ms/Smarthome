require('dotenv').config();
const { pool } = require('../config/db');
const logger = require('../config/logger');

async function seedCustomizationsOnly() {
  const connection = await pool.getConnection();
  try {
    logger.info('🌱 Starting Customization-Only Data Seeding...');
    await connection.beginTransaction();

    // 1. Fetch existing services & packages
    const [services] = await connection.query(`SELECT id, service_name FROM services WHERE deleted_at IS NULL`);
    const [packages] = await connection.query(`SELECT id, service_id, package_name FROM service_packages WHERE deleted_at IS NULL`);

    if (!services || services.length === 0) {
      logger.warn('⚠️ No services found in database. Please run the primary database seed or create services first.');
      connection.release();
      process.exit(0);
    }

    logger.info(`  Found ${services.length} existing service(s) and ${packages.length} package(s).`);

    const insertRow = async (table, row) => {
      const keys = Object.keys(row).map(k => `\`${k}\``).join(', ');
      const placeholders = Object.keys(row).map(() => '?').join(', ');
      const values = Object.values(row);
      const [res] = await connection.execute(
        `INSERT INTO \`${table}\` (${keys}) VALUES (${placeholders})`,
        values
      );
      return res.insertId;
    };

    // Helper functions
    const findService = (term) => services.find(s => s.service_name.toLowerCase().includes(term.toLowerCase())) || services[0];
    const findPackage = (svcId) => packages.find(p => p.service_id === svcId) || (packages.length > 0 ? packages[0] : null);

    // ────────────────────────────────────────────────────────────────────────
    // SERVICE 1: AC Service / General Service Customizations
    // ────────────────────────────────────────────────────────────────────────
    const acSvc = findService('ac') || services[0];
    const acPkg = findPackage(acSvc.id);

    logger.info(`  → Seeding customizations for Service: "${acSvc.service_name}" (ID: ${acSvc.id})...`);

    const cgAc1 = await insertRow('customization_groups', {
      service_id: acSvc.id,
      group_name: 'Unit Count & Type',
      group_description: 'Select number of AC units to service',
      selection_type: 'single',
      display_order: 1,
      is_active: 1
    });

    const cgAc2 = await insertRow('customization_groups', {
      service_id: acSvc.id,
      group_name: 'Add-on Treatments',
      group_description: 'Optional add-on treatments for AC',
      selection_type: 'multi',
      display_order: 2,
      is_active: 1
    });

    const optAc1 = await insertRow('customization_options', {
      group_id: cgAc1,
      option_name: '1 Split AC Unit',
      description: 'Includes filter jet wash and cooling check',
      price: 0.00,
      display_order: 1,
      is_active: 1
    });

    const optAc2 = await insertRow('customization_options', {
      group_id: cgAc1,
      option_name: '2 Split AC Units',
      description: 'Service 2 split units in same visit',
      price: 499.00,
      display_order: 2,
      is_active: 1
    });

    const optAc3 = await insertRow('customization_options', {
      group_id: cgAc2,
      option_name: 'Eco Gas Top-Up (R32/R410)',
      description: 'Refill refrigerant gas up to 20%',
      price: 450.00,
      display_order: 1,
      is_active: 1
    });

    const optAc4 = await insertRow('customization_options', {
      group_id: cgAc2,
      option_name: 'Anti-Bacterial Foam Spray Sanitisation',
      description: 'Eliminates 99.9% germs in cooling coils',
      price: 199.00,
      display_order: 2,
      is_active: 1
    });

    if (acPkg) {
      await insertRow('package_option_configs', { package_id: acPkg.id, option_id: optAc1, is_included: 1, additional_price: 0.00, is_active: 1 });
      await insertRow('package_option_configs', { package_id: acPkg.id, option_id: optAc2, is_included: 0, additional_price: 499.00, is_active: 1 });
      await insertRow('package_option_configs', { package_id: acPkg.id, option_id: optAc3, is_included: 0, additional_price: 450.00, is_active: 1 });
      await insertRow('package_option_configs', { package_id: acPkg.id, option_id: optAc4, is_included: 0, additional_price: 199.00, is_active: 1 });
    }

    // ────────────────────────────────────────────────────────────────────────
    // SERVICE 2: Cleaning / General Service Customizations
    // ────────────────────────────────────────────────────────────────────────
    const cleanSvc = findService('clean') || (services.length > 1 ? services[1] : services[0]);
    const cleanPkg = findPackage(cleanSvc.id);

    if (cleanSvc.id !== acSvc.id) {
      logger.info(`  → Seeding customizations for Service: "${cleanSvc.service_name}" (ID: ${cleanSvc.id})...`);

      const cgClean1 = await insertRow('customization_groups', {
        service_id: cleanSvc.id,
        group_name: 'Property Size & Layout',
        group_description: 'Specify area size',
        selection_type: 'single',
        display_order: 1,
        is_active: 1
      });

      const cgClean2 = await insertRow('customization_groups', {
        service_id: cleanSvc.id,
        group_name: 'Deep Clean Add-ons',
        group_description: 'Extra cleaning targets',
        selection_type: 'multi',
        display_order: 2,
        is_active: 1
      });

      const optC1 = await insertRow('customization_options', {
        group_id: cgClean1,
        option_name: 'Standard Apartment (Up to 1500 sq ft)',
        description: 'Standard flat layout coverage',
        price: 0.00,
        display_order: 1,
        is_active: 1
      });

      const optC2 = await insertRow('customization_options', {
        group_id: cgClean2,
        option_name: 'Kitchen Cabinet Interior Scrubbing',
        description: 'Clean inside all drawers and cabinets',
        price: 399.00,
        display_order: 1,
        is_active: 1
      });

      const optC3 = await insertRow('customization_options', {
        group_id: cgClean2,
        option_name: 'Balcony & Window Mesh Scrubbing',
        description: 'Scrub dust and grime off balcony wire meshes',
        price: 299.00,
        display_order: 2,
        is_active: 1
      });

      if (cleanPkg) {
        await insertRow('package_option_configs', { package_id: cleanPkg.id, option_id: optC1, is_included: 1, additional_price: 0.00, is_active: 1 });
        await insertRow('package_option_configs', { package_id: cleanPkg.id, option_id: optC2, is_included: 0, additional_price: 399.00, is_active: 1 });
        await insertRow('package_option_configs', { package_id: cleanPkg.id, option_id: optC3, is_included: 0, additional_price: 299.00, is_active: 1 });
      }
    }

    await connection.commit();
    logger.info('');
    logger.info('✅  CUSTOMIZATION-ONLY SEED DATA SUCCESSFULLY INSTALLED!');
    logger.info('');
  } catch (error) {
    await connection.rollback();
    logger.error(`❌ Customization seed failed: ${error.message}`);
    process.exit(1);
  } finally {
    connection.release();
    process.exit(0);
  }
}

seedCustomizationsOnly();
