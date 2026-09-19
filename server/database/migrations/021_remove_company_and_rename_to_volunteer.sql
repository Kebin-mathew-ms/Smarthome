-- 1. Drop Foreign Keys referencing companies
ALTER TABLE company_users DROP FOREIGN KEY fk_company_users_company;
ALTER TABLE company_documents DROP FOREIGN KEY fk_company_docs_company;
ALTER TABLE company_settings DROP FOREIGN KEY fk_company_settings_company;
ALTER TABLE services DROP FOREIGN KEY fk_services_company;
ALTER TABLE company_employees DROP FOREIGN KEY fk_employees_company;
ALTER TABLE company_gallery DROP FOREIGN KEY fk_gallery_company;
ALTER TABLE favorites DROP FOREIGN KEY fk_fav_company;
ALTER TABLE company_followers DROP FOREIGN KEY fk_follower_company;
ALTER TABLE recently_viewed DROP FOREIGN KEY fk_rv_company;
ALTER TABLE bookings DROP FOREIGN KEY fk_bookings_company;
ALTER TABLE reviews DROP FOREIGN KEY fk_reviews_table_company;
ALTER TABLE review_replies DROP FOREIGN KEY fk_rr_company;
ALTER TABLE complaints DROP FOREIGN KEY fk_complaints_company;
ALTER TABLE warranties DROP FOREIGN KEY fk_warranties_company;

-- 2. Make company_id nullable
ALTER TABLE services MODIFY COLUMN company_id INT NULL;
ALTER TABLE bookings MODIFY COLUMN company_id INT NULL;
ALTER TABLE reviews MODIFY COLUMN company_id INT NULL;
ALTER TABLE review_replies MODIFY COLUMN company_id INT NULL;
ALTER TABLE complaints MODIFY COLUMN company_id INT NULL;
ALTER TABLE warranties MODIFY COLUMN company_id INT NULL;
ALTER TABLE notification_queue MODIFY COLUMN company_id INT NULL;

-- 3. Update existing user roles
UPDATE users SET role = 'Volunteer' WHERE role = 'Employee';
UPDATE users SET role = 'User' WHERE role = 'Company';

-- 4. Modify role ENUM in users table
ALTER TABLE users MODIFY COLUMN role ENUM('Admin', 'User', 'Volunteer') NOT NULL DEFAULT 'User';

-- 5. Rename company_employees to volunteers (if present)
RENAME TABLE company_employees TO volunteers;

-- 5b. Ensure volunteers table exists
CREATE TABLE IF NOT EXISTS volunteers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NULL,
  user_id INT NULL,
  volunteer_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  designation VARCHAR(100) NOT NULL,
  profile_photo VARCHAR(255) NULL,
  address TEXT NULL,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_volunteers_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE volunteers CHANGE COLUMN employee_name volunteer_name VARCHAR(150) NOT NULL;
ALTER TABLE volunteers MODIFY COLUMN company_id INT NULL;
ALTER TABLE volunteers ADD INDEX idx_volunteers_email (email);

-- 6. Rename employee_skills to volunteer_skills
ALTER TABLE employee_skills DROP FOREIGN KEY fk_emp_skills_emp;
RENAME TABLE employee_skills TO volunteer_skills;

CREATE TABLE IF NOT EXISTS volunteer_skills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  volunteer_id INT NOT NULL,
  subcategory_id INT NOT NULL,
  experience_years INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_vol_skills_vol (volunteer_id),
  INDEX idx_vol_skills_sub (subcategory_id),
  UNIQUE KEY uk_volunteer_skill (volunteer_id, subcategory_id),
  CONSTRAINT fk_vol_skills_vol FOREIGN KEY (volunteer_id) REFERENCES volunteers(id) ON DELETE CASCADE,
  CONSTRAINT fk_vol_skills_sub FOREIGN KEY (subcategory_id) REFERENCES service_subcategories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE volunteer_skills CHANGE COLUMN employee_id volunteer_id INT NOT NULL;

-- 7. Rename booking_employees to booking_volunteers
ALTER TABLE booking_employees DROP FOREIGN KEY fk_be_emp;
RENAME TABLE booking_employees TO booking_volunteers;

CREATE TABLE IF NOT EXISTS booking_volunteers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  volunteer_id INT NOT NULL,
  assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_booking_volunteer (booking_id, volunteer_id),
  CONSTRAINT fk_bv_vol FOREIGN KEY (volunteer_id) REFERENCES volunteers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE booking_volunteers CHANGE COLUMN employee_id volunteer_id INT NOT NULL;

-- 8. Rename employee portal session and check-in tables
ALTER TABLE employee_sessions DROP FOREIGN KEY fk_es_employee;
RENAME TABLE employee_sessions TO volunteer_sessions;

CREATE TABLE IF NOT EXISTS volunteer_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  volunteer_id INT NOT NULL,
  session_token VARCHAR(255) NOT NULL,
  ip_address VARCHAR(45) NULL,
  user_agent VARCHAR(255) NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_vs_vol FOREIGN KEY (volunteer_id) REFERENCES volunteers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE volunteer_sessions CHANGE COLUMN employee_id volunteer_id INT NOT NULL;

ALTER TABLE employee_checkins DROP FOREIGN KEY fk_ec_employee;
RENAME TABLE employee_checkins TO volunteer_checkins;

CREATE TABLE IF NOT EXISTS volunteer_checkins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  volunteer_id INT NOT NULL,
  checkin_type ENUM('checkin', 'checkout') NOT NULL,
  latitude DECIMAL(10, 8) NULL,
  longitude DECIMAL(11, 8) NULL,
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_vc_vol FOREIGN KEY (volunteer_id) REFERENCES volunteers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE volunteer_checkins CHANGE COLUMN employee_id volunteer_id INT NOT NULL;

ALTER TABLE employee_signatures DROP FOREIGN KEY fk_esig_employee;
RENAME TABLE employee_signatures TO volunteer_signatures;

CREATE TABLE IF NOT EXISTS volunteer_signatures (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  volunteer_id INT NOT NULL,
  signature_url VARCHAR(255) NOT NULL,
  signer_name VARCHAR(150) NOT NULL,
  signer_type ENUM('customer', 'volunteer') NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_vsig_vol FOREIGN KEY (volunteer_id) REFERENCES volunteers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE volunteer_signatures CHANGE COLUMN employee_id volunteer_id INT NOT NULL;

ALTER TABLE employee_daily_logs DROP FOREIGN KEY fk_edl_employee;
RENAME TABLE employee_daily_logs TO volunteer_daily_logs;

CREATE TABLE IF NOT EXISTS volunteer_daily_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  volunteer_id INT NOT NULL,
  log_date DATE NOT NULL,
  status ENUM('on_duty', 'off_duty', 'on_break', 'in_transit') NOT NULL DEFAULT 'off_duty',
  total_jobs_completed INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_vdl_vol FOREIGN KEY (volunteer_id) REFERENCES volunteers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE volunteer_daily_logs CHANGE COLUMN employee_id volunteer_id INT NOT NULL;

