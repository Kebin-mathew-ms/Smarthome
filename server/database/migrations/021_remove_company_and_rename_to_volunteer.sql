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

-- 5. Rename company_employees to volunteers
RENAME TABLE company_employees TO volunteers;
ALTER TABLE volunteers CHANGE COLUMN employee_name volunteer_name VARCHAR(150) NOT NULL;
ALTER TABLE volunteers MODIFY COLUMN company_id INT NULL;
ALTER TABLE volunteers ADD INDEX idx_volunteers_email (email);

-- 6. Rename employee_skills to volunteer_skills
ALTER TABLE employee_skills DROP FOREIGN KEY fk_emp_skills_emp;
RENAME TABLE employee_skills TO volunteer_skills;
ALTER TABLE volunteer_skills CHANGE COLUMN employee_id volunteer_id INT NOT NULL;
ALTER TABLE volunteer_skills ADD CONSTRAINT fk_vol_skills_vol FOREIGN KEY (volunteer_id) REFERENCES volunteers(id) ON DELETE CASCADE;

-- 7. Rename booking_employees to booking_volunteers
ALTER TABLE booking_employees DROP FOREIGN KEY fk_be_emp;
RENAME TABLE booking_employees TO booking_volunteers;
ALTER TABLE booking_volunteers CHANGE COLUMN employee_id volunteer_id INT NOT NULL;
ALTER TABLE booking_volunteers ADD CONSTRAINT fk_bv_vol FOREIGN KEY (volunteer_id) REFERENCES volunteers(id) ON DELETE CASCADE;

-- 8. Rename employee portal session and check-in tables
ALTER TABLE employee_sessions DROP FOREIGN KEY fk_es_employee;
RENAME TABLE employee_sessions TO volunteer_sessions;
ALTER TABLE volunteer_sessions CHANGE COLUMN employee_id volunteer_id INT NOT NULL;
ALTER TABLE volunteer_sessions ADD CONSTRAINT fk_vs_vol FOREIGN KEY (volunteer_id) REFERENCES volunteers(id) ON DELETE CASCADE;

ALTER TABLE employee_checkins DROP FOREIGN KEY fk_ec_employee;
RENAME TABLE employee_checkins TO volunteer_checkins;
ALTER TABLE volunteer_checkins CHANGE COLUMN employee_id volunteer_id INT NOT NULL;
ALTER TABLE volunteer_checkins ADD CONSTRAINT fk_vc_vol FOREIGN KEY (volunteer_id) REFERENCES volunteers(id) ON DELETE CASCADE;

ALTER TABLE employee_signatures DROP FOREIGN KEY fk_esig_employee;
RENAME TABLE employee_signatures TO volunteer_signatures;
ALTER TABLE volunteer_signatures CHANGE COLUMN employee_id volunteer_id INT NOT NULL;
ALTER TABLE volunteer_signatures ADD CONSTRAINT fk_vsig_vol FOREIGN KEY (volunteer_id) REFERENCES volunteers(id) ON DELETE CASCADE;

ALTER TABLE employee_daily_logs DROP FOREIGN KEY fk_edl_employee;
RENAME TABLE employee_daily_logs TO volunteer_daily_logs;
ALTER TABLE volunteer_daily_logs CHANGE COLUMN employee_id volunteer_id INT NOT NULL;
ALTER TABLE volunteer_daily_logs ADD CONSTRAINT fk_vdl_vol FOREIGN KEY (volunteer_id) REFERENCES volunteers(id) ON DELETE CASCADE;
