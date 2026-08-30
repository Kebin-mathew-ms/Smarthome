require('dotenv').config();
const { pool } = require('../config/db');
const logger = require('../config/logger');

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

async function runSeed() {
  const connection = await pool.getConnection();
  try {
    logger.info('🌱 Seeding service customization data...');
    await connection.beginTransaction();

    // Clear existing customization data
    await connection.query('DELETE FROM booking_customizations');
    await connection.query('DELETE FROM package_option_configs');
    await connection.query('DELETE FROM customization_options');
    await connection.query('DELETE FROM customization_groups');

    // Fetch services to link to
    const [services] = await connection.query('SELECT id, service_name FROM services');
    const [packages] = await connection.query('SELECT id, service_id, package_name FROM service_packages');

    const findServiceId = (name) => {
      const s = services.find(x => x.service_name.toLowerCase().includes(name.toLowerCase()));
      return s ? s.id : null;
    };

    // ── 1. PAINTING CUSTOMIZATIONS ──────────────────────────────────────────
    const paintingServiceId = findServiceId('Painting');
    if (paintingServiceId) {
      logger.info(`Seeding painting customizations for service ID: ${paintingServiceId}`);

      // Paint Type Group
      const [paintTypeGroupId] = await insert(connection, 'customization_groups', [{
        service_id: paintingServiceId,
        group_name: 'Paint Type',
        group_description: 'Choose paint quality and tier',
        selection_type: 'single',
        display_order: 1
      }]);

      const paintTypeOptionIds = await insert(connection, 'customization_options', [
        { group_id: paintTypeGroupId, option_name: 'Economy Paint', description: 'Budget friendly wall paint', price: 0.00, display_order: 1 },
        { group_id: paintTypeGroupId, option_name: 'Premium Paint', description: 'Long lasting premium finish', price: 2000.00, display_order: 2 },
        { group_id: paintTypeGroupId, option_name: 'Luxury/Designer Paint', description: 'Ultra premium designer luxury paint', price: 4000.00, display_order: 3 }
      ]);

      // Surface Preparation Group
      const [surfacePrepGroupId] = await insert(connection, 'customization_groups', [{
        service_id: paintingServiceId,
        group_name: 'Surface Preparation',
        group_description: 'Putty and base coat preparations',
        selection_type: 'single',
        display_order: 2
      }]);

      const surfacePrepOptionIds = await insert(connection, 'customization_options', [
        { group_id: surfacePrepGroupId, option_name: 'No Putty Required', description: 'Direct paint application', price: 0.00, display_order: 1 },
        { group_id: surfacePrepGroupId, option_name: 'Putty Required', description: 'Single coat putty base', price: 1500.00, display_order: 2 },
        { group_id: surfacePrepGroupId, option_name: 'Full Surface Preparation', description: 'Double coat putty + primer sanding', price: 3000.00, display_order: 3 }
      ]);

      // Paint Finish Group
      const [finishGroupId] = await insert(connection, 'customization_groups', [{
        service_id: paintingServiceId,
        group_name: 'Paint Finish',
        group_description: 'Select final paint sheen level',
        selection_type: 'single',
        display_order: 3
      }]);

      await insert(connection, 'customization_options', [
        { group_id: finishGroupId, option_name: 'Matte', description: 'Non-reflective sheen', price: 0.00, display_order: 1 },
        { group_id: finishGroupId, option_name: 'Satin', description: 'Slight pearl shine', price: 0.00, display_order: 2 },
        { group_id: finishGroupId, option_name: 'Gloss', description: 'High gloss reflective', price: 0.00, display_order: 3 },
        { group_id: finishGroupId, option_name: 'Textured', description: 'Designer textured coat', price: 1000.00, display_order: 4 }
      ]);

      // Number of Coats Group
      const [coatsGroupId] = await insert(connection, 'customization_groups', [{
        service_id: paintingServiceId,
        group_name: 'Number of Coats',
        group_description: 'Choose thickness of paint layer',
        selection_type: 'single',
        display_order: 4
      }]);

      const coatsOptionIds = await insert(connection, 'customization_options', [
        { group_id: coatsGroupId, option_name: '1 Coat', description: 'Touch up coat', price: 0.00, display_order: 1 },
        { group_id: coatsGroupId, option_name: '2 Coats', description: 'Standard recommended coats', price: 0.00, display_order: 2 },
        { group_id: coatsGroupId, option_name: '3 Coats', description: 'Extra durable coverage', price: 1000.00, display_order: 3 }
      ]);

      // Additional Areas Group
      const [areasGroupId] = await insert(connection, 'customization_groups', [{
        service_id: paintingServiceId,
        group_name: 'Additional Areas',
        group_description: 'Select coverage surfaces',
        selection_type: 'multi',
        display_order: 5
      }]);

      await insert(connection, 'customization_options', [
        { group_id: areasGroupId, option_name: 'Walls', description: 'Standard wall painting', price: 0.00, display_order: 1 },
        { group_id: areasGroupId, option_name: 'Ceiling', description: 'Ceiling painting service', price: 500.00, display_order: 2 },
        { group_id: areasGroupId, option_name: 'Doors', description: 'Wooden doors paint/polish', price: 800.00, display_order: 3 },
        { group_id: areasGroupId, option_name: 'Windows/Frames', description: 'Window grills and frames', price: 600.00, display_order: 4 },
        { group_id: areasGroupId, option_name: 'Grills', description: 'Metal balcony grills', price: 400.00, display_order: 5 },
        { group_id: areasGroupId, option_name: 'Exterior Walls', description: 'Weatherproof outer wall paint', price: 2500.00, display_order: 6 }
      ]);

      // Seed Package Overrides for Painting Standard Room Paint package
      // Premium package might include Premium paint, Luxury package includes Luxury paint
      const paintPackage = packages.find(p => p.service_id === paintingServiceId);
      if (paintPackage) {
        logger.info(`Setting package overrides for package: ${paintPackage.package_name}`);
        // Let's assume Standard Paint includes Economy Paint, but 2 Coats is standard.
        // We override "2 Coats" as included.
        await insert(connection, 'package_option_configs', [
          { package_id: paintPackage.id, option_id: coatsOptionIds[1], is_included: true, additional_price: 0.00, is_active: true }
        ]);
      }
    }

    // ── 2. ELECTRICAL CUSTOMIZATIONS ──────────────────────────────────────────
    const electricalServiceId = findServiceId('Wiring');
    if (electricalServiceId) {
      logger.info(`Seeding electrical customizations for service ID: ${electricalServiceId}`);

      // Service Type Group
      const [typeGroupId] = await insert(connection, 'customization_groups', [{
        service_id: electricalServiceId,
        group_name: 'Service Type',
        group_description: 'Type of electrical job',
        selection_type: 'single',
        display_order: 1
      }]);

      await insert(connection, 'customization_options', [
        { group_id: typeGroupId, option_name: 'Switch/Socket Replacement', description: 'Fittings swap', price: 100.00, display_order: 1 },
        { group_id: typeGroupId, option_name: 'Light Installation', description: 'Install wall or ceiling lights', price: 150.00, display_order: 2 },
        { group_id: typeGroupId, option_name: 'Fan Installation', description: 'Standard ceiling fan install', price: 250.00, display_order: 3 },
        { group_id: typeGroupId, option_name: 'Wiring/Repair', description: 'Fix faulty wiring lines', price: 400.00, display_order: 4 },
        { group_id: typeGroupId, option_name: 'MCB/Distribution Board Work', description: 'DB Box and breakers diagnostics', price: 500.00, display_order: 5 },
        { group_id: typeGroupId, option_name: 'Other Electrical Work', description: 'Custom electrical diagnosis', price: 300.00, display_order: 6 }
      ]);

      // Additional Options Group (Quantity-based charges)
      const [addonsGroupId] = await insert(connection, 'customization_groups', [{
        service_id: electricalServiceId,
        group_name: 'Additional Options',
        group_description: 'Choose materials or quantity extras',
        selection_type: 'quantity',
        display_order: 2
      }]);

      await insert(connection, 'customization_options', [
        { group_id: addonsGroupId, option_name: 'New wiring required (meters)', description: 'Price per meter', price: 150.00, display_order: 1 },
        { group_id: addonsGroupId, option_name: 'Existing wiring repair', description: 'Number of locations', price: 200.00, display_order: 2 },
        { group_id: addonsGroupId, option_name: 'Ceiling/light fixture installation', description: 'Number of fixtures', price: 100.00, display_order: 3 },
        { group_id: addonsGroupId, option_name: 'Fan installation (quantity)', description: 'Number of fans', price: 300.00, display_order: 4 },
        { group_id: addonsGroupId, option_name: 'Switch/socket replacement (quantity)', description: 'Number of switch boards', price: 80.00, display_order: 5 },
        { group_id: addonsGroupId, option_name: 'MCB replacement (quantity)', description: 'Number of breakers', price: 400.00, display_order: 6 }
      ]);
    }

    // ── 3. PLUMBING CUSTOMIZATIONS ────────────────────────────────────────────
    const plumbingServiceId = findServiceId('Pipe');
    if (plumbingServiceId) {
      logger.info(`Seeding plumbing customizations for service ID: ${plumbingServiceId}`);

      // Plumbing Service Group
      const [plumbingGroupId] = await insert(connection, 'customization_groups', [{
        service_id: plumbingServiceId,
        group_name: 'Plumbing Service',
        group_description: 'Identify issue type',
        selection_type: 'single',
        display_order: 1
      }]);

      await insert(connection, 'customization_options', [
        { group_id: plumbingGroupId, option_name: 'Tap/Faucet Repair', description: 'Leaking tap or washer fix', price: 200.00, display_order: 1 },
        { group_id: plumbingGroupId, option_name: 'Tap/Faucet Replacement', description: 'Fitting new taps', price: 350.00, display_order: 2 },
        { group_id: plumbingGroupId, option_name: 'Sink Repair', description: 'Under-sink pipe leakage', price: 400.00, display_order: 3 },
        { group_id: plumbingGroupId, option_name: 'Toilet Repair', description: 'Flush valve or flush tank issues', price: 500.00, display_order: 4 },
        { group_id: plumbingGroupId, option_name: 'Pipe Leakage', description: 'Internal pipe line sealing', price: 600.00, display_order: 5 },
        { group_id: plumbingGroupId, option_name: 'Drainage/Blockage', description: 'Unclogging choke drains', price: 450.00, display_order: 6 },
        { group_id: plumbingGroupId, option_name: 'Water Tank/Connection Work', description: 'Inlet/outlet tank valve works', price: 800.00, display_order: 7 },
        { group_id: plumbingGroupId, option_name: 'Other Plumbing Work', description: 'Plumbing diagnostics', price: 300.00, display_order: 8 }
      ]);

      // Additional Requirements
      const [reqGroupId] = await insert(connection, 'customization_groups', [{
        service_id: plumbingServiceId,
        group_name: 'Additional Requirements',
        group_description: 'Add extra labor or parts',
        selection_type: 'multi',
        display_order: 2
      }]);

      await insert(connection, 'customization_options', [
        { group_id: reqGroupId, option_name: 'New parts required', description: 'Fittings and valves cost', price: 400.00, display_order: 1 },
        { group_id: reqGroupId, option_name: 'Pipe replacement', description: 'Replace standard PVC pipelines', price: 800.00, display_order: 2 },
        { group_id: reqGroupId, option_name: 'Wall breaking required', description: 'Access concealed pipes', price: 1500.00, display_order: 3 },
        { group_id: reqGroupId, option_name: 'Drain cleaning chemicals', description: 'Anti-clog compound', price: 200.00, display_order: 4 },
        { group_id: reqGroupId, option_name: 'Fixture replacement labor', description: 'Install sanitary ware', price: 1200.00, display_order: 5 }
      ]);
    }

    // ── 4. CLEANING CUSTOMIZATIONS ────────────────────────────────────────────
    const cleaningServiceId = findServiceId('Cleaning');
    if (cleaningServiceId) {
      logger.info(`Seeding cleaning customizations for service ID: ${cleaningServiceId}`);

      // Cleaning Type Group
      const [cleanTypeGroupId] = await insert(connection, 'customization_groups', [{
        service_id: cleaningServiceId,
        group_name: 'Cleaning Type',
        group_description: 'Select depth of cleaning',
        selection_type: 'single',
        display_order: 1
      }]);

      await insert(connection, 'customization_options', [
        { group_id: cleanTypeGroupId, option_name: 'Basic Cleaning', description: 'Sweeping, mopping and dusting', price: 0.00, display_order: 1 },
        { group_id: cleanTypeGroupId, option_name: 'Deep Cleaning', description: 'Stain removal and machine scrubbing', price: 1000.00, display_order: 2 },
        { group_id: cleanTypeGroupId, option_name: 'Premium Cleaning', description: 'Deep cleaning + disinfection steam sanitization', price: 2000.00, display_order: 3 }
      ]);

      // Areas Group
      const [areasCleanGroupId] = await insert(connection, 'customization_groups', [{
        service_id: cleaningServiceId,
        group_name: 'Areas Included',
        group_description: 'Choose zones to clean',
        selection_type: 'multi',
        display_order: 2
      }]);

      await insert(connection, 'customization_options', [
        { group_id: areasCleanGroupId, option_name: 'Living Room', description: 'Full lounge cleaning', price: 0.00, display_order: 1 },
        { group_id: areasCleanGroupId, option_name: 'Bedroom', description: 'Bedroom vacuum & dust', price: 0.00, display_order: 2 },
        { group_id: areasCleanGroupId, option_name: 'Kitchen', description: 'Kitchen cabinet counters', price: 500.00, display_order: 3 },
        { group_id: areasCleanGroupId, option_name: 'Bathroom', description: 'Bathroom tile scrubbing', price: 400.00, display_order: 4 },
        { group_id: areasCleanGroupId, option_name: 'Balcony', description: 'Balcony wash & sweep', price: 300.00, display_order: 5 },
        { group_id: areasCleanGroupId, option_name: 'Full House', description: 'All areas sweep, mop, dust', price: 1500.00, display_order: 6 }
      ]);

      // Additional Services Group (Quantity-based)
      const [extraCleanGroupId] = await insert(connection, 'customization_groups', [{
        service_id: cleaningServiceId,
        group_name: 'Additional Services',
        group_description: 'Add specialized upholstery cleaning',
        selection_type: 'quantity',
        display_order: 3
      }]);

      await insert(connection, 'customization_options', [
        { group_id: extraCleanGroupId, option_name: 'Sofa Cleaning', description: 'Per seat cost', price: 300.00, display_order: 1 },
        { group_id: extraCleanGroupId, option_name: 'Carpet Cleaning', description: 'Per carpet rug cost', price: 500.00, display_order: 2 },
        { group_id: extraCleanGroupId, option_name: 'Mattress Cleaning', description: 'Per mattress cost', price: 600.00, display_order: 3 },
        { group_id: extraCleanGroupId, option_name: 'Window Cleaning', description: 'Per window pane cost', price: 150.00, display_order: 4 },
        { group_id: extraCleanGroupId, option_name: 'Kitchen Deep Cleaning (extra)', description: 'Degreasing of chimneys/stoves', price: 1200.00, display_order: 5 },
        { group_id: extraCleanGroupId, option_name: 'Bathroom Deep Cleaning (extra)', description: 'Hard water stain removal', price: 800.00, display_order: 6 }
      ]);
    }

    // ── 5. CARPENTRY CUSTOMIZATIONS ───────────────────────────────────────────
    const carpentryServiceId = findServiceId('Assembly');
    if (carpentryServiceId) {
      logger.info(`Seeding carpentry customizations for service ID: ${carpentryServiceId}`);

      // Service Type
      const [carpentryTypeGroupId] = await insert(connection, 'customization_groups', [{
        service_id: carpentryServiceId,
        group_name: 'Service Type',
        group_description: 'Choose wood work required',
        selection_type: 'single',
        display_order: 1
      }]);

      await insert(connection, 'customization_options', [
        { group_id: carpentryTypeGroupId, option_name: 'Furniture Repair', description: 'Fix creaks, loose hinges', price: 300.00, display_order: 1 },
        { group_id: carpentryTypeGroupId, option_name: 'Door Repair', description: 'Align doors, lock adjustments', price: 400.00, display_order: 2 },
        { group_id: carpentryTypeGroupId, option_name: 'Door Installation', description: 'Fit new wood/laminate door', price: 1200.00, display_order: 3 },
        { group_id: carpentryTypeGroupId, option_name: 'Shelf Installation', description: 'Mount wall shelves', price: 350.00, display_order: 4 },
        { group_id: carpentryTypeGroupId, option_name: 'Cabinet Repair', description: 'Fix modular kitchen drawers', price: 500.00, display_order: 5 },
        { group_id: carpentryTypeGroupId, option_name: 'Furniture Assembly', description: 'Flat pack wardrobe/beds', price: 800.00, display_order: 6 },
        { group_id: carpentryTypeGroupId, option_name: 'Custom Carpentry', description: 'Custom wood cut & install', price: 1500.00, display_order: 7 }
      ]);

      // Additional Requirements
      const [carpentryReqGroupId] = await insert(connection, 'customization_groups', [{
        service_id: carpentryServiceId,
        group_name: 'Additional Requirements',
        group_description: 'Choose materials or hardware',
        selection_type: 'multi',
        display_order: 2
      }]);

      await insert(connection, 'customization_options', [
        { group_id: carpentryReqGroupId, option_name: 'New wood/material required', description: 'Standard plywood/wood board cost', price: 1000.00, display_order: 1 },
        { group_id: carpentryReqGroupId, option_name: 'Hardware replacement', description: 'Standard nails, glue, screws', price: 200.00, display_order: 2 },
        { group_id: carpentryReqGroupId, option_name: 'Hinges replacement', description: 'Premium soft close hinges', price: 300.00, display_order: 3 },
        { group_id: carpentryReqGroupId, option_name: 'Handle replacement', description: 'Designer steel handles', price: 250.00, display_order: 4 },
        { group_id: carpentryReqGroupId, option_name: 'Cutting/modification', description: 'Wood cutting and planing work', price: 400.00, display_order: 5 },
        { group_id: carpentryReqGroupId, option_name: 'Polishing/finishing', description: 'Wood varnish polish finish', price: 800.00, display_order: 6 }
      ]);
    }

    // ── 6. APPLIANCES CUSTOMIZATIONS ──────────────────────────────────────────
    const appliancesServiceId = findServiceId('AC');
    if (appliancesServiceId) {
      logger.info(`Seeding appliances customizations for service ID: ${appliancesServiceId}`);

      // Appliance Type Group
      const [appTypeGroupId] = await insert(connection, 'customization_groups', [{
        service_id: appliancesServiceId,
        group_name: 'Appliance Type',
        group_description: 'Select your appliance',
        selection_type: 'single',
        display_order: 1
      }]);

      await insert(connection, 'customization_options', [
        { group_id: appTypeGroupId, option_name: 'AC', description: 'Split or window air conditioner', price: 0.00, display_order: 1 },
        { group_id: appTypeGroupId, option_name: 'Washing Machine', description: 'Front load or top load', price: 0.00, display_order: 2 },
        { group_id: appTypeGroupId, option_name: 'Refrigerator', description: 'Single, double or side-by-side door', price: 0.00, display_order: 3 },
        { group_id: appTypeGroupId, option_name: 'Microwave', description: 'Solo or convection oven', price: 0.00, display_order: 4 },
        { group_id: appTypeGroupId, option_name: 'Water Heater', description: 'Instant or storage geyser', price: 0.00, display_order: 5 },
        { group_id: appTypeGroupId, option_name: 'Dishwasher', description: 'Under-counter or free standing', price: 0.00, display_order: 6 },
        { group_id: appTypeGroupId, option_name: 'Other Appliance', description: 'Kitchen chimney, vacuum cleaners', price: 0.00, display_order: 7 }
      ]);

      // Service Type Group
      const [appSvcGroupId] = await insert(connection, 'customization_groups', [{
        service_id: appliancesServiceId,
        group_name: 'Service Type',
        group_description: 'Choose job type',
        selection_type: 'single',
        display_order: 2
      }]);

      await insert(connection, 'customization_options', [
        { group_id: appSvcGroupId, option_name: 'Installation', description: 'Complete mounting and test run', price: 600.00, display_order: 1 },
        { group_id: appSvcGroupId, option_name: 'Repair', description: 'Fix heating/cooling/mechanical parts', price: 400.00, display_order: 2 },
        { group_id: appSvcGroupId, option_name: 'Maintenance', description: 'Deep clean, filters, lubrication', price: 500.00, display_order: 3 },
        { group_id: appSvcGroupId, option_name: 'Uninstallation', description: 'Safe removal from wall/fixtures', price: 300.00, display_order: 4 },
        { group_id: appSvcGroupId, option_name: 'Inspection/Diagnosis', description: 'Fault checking and repair quotes', price: 250.00, display_order: 5 }
      ]);

      // Additional Requirements Group (Conditional options)
      const [appAddGroupId] = await insert(connection, 'customization_groups', [{
        service_id: appliancesServiceId,
        group_name: 'Additional Requirements',
        group_description: 'Materials and specialized installations',
        selection_type: 'multi',
        display_order: 3
      }]);

      await insert(connection, 'customization_options', [
        // AC Options
        { group_id: appAddGroupId, option_name: 'AC Gas Refill', description: 'Recharge refrigerant gas', price: 1500.00, display_order: 1 },
        { group_id: appAddGroupId, option_name: 'AC Drain pipe work', description: 'Condensation water pipe fix', price: 300.00, display_order: 2 },
        { group_id: appAddGroupId, option_name: 'AC Additional copper piping', description: 'Price per meter', price: 800.00, display_order: 3 },
        { group_id: appAddGroupId, option_name: 'AC Wall drilling', description: 'Drill hole for copper piping conduit', price: 250.00, display_order: 4 },
        { group_id: appAddGroupId, option_name: 'AC Outdoor unit installation', description: 'Bracket mounting outdoor unit', price: 600.00, display_order: 5 },
        // Washing Machine Options
        { group_id: appAddGroupId, option_name: 'Washing Machine Pipe/connection work', description: 'Inlet hose or drain pipe fittings', price: 300.00, display_order: 6 },
        { group_id: appAddGroupId, option_name: 'Washing Machine Stand installation', description: 'Heavy duty trolley base stand', price: 700.00, display_order: 7 }
      ]);
    }

    await connection.commit();
    logger.info('✅ Service customization data seeded successfully!');
  } catch (error) {
    await connection.rollback();
    logger.error(`❌ Seeding failed: ${error.message}`);
  } finally {
    connection.release();
    process.exit(0);
  }
}

runSeed();
