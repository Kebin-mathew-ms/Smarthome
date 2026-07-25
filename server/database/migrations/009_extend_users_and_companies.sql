ALTER TABLE companies MODIFY COLUMN status ENUM('pending', 'active', 'inactive', 'blocked', 'rejected') NOT NULL DEFAULT 'pending';

ALTER TABLE users MODIFY COLUMN role ENUM('Admin', 'Company', 'User', 'Employee') NOT NULL DEFAULT 'User';
ALTER TABLE users ADD COLUMN profile_photo VARCHAR(255) NULL AFTER phone;
ALTER TABLE users ADD COLUMN last_login TIMESTAMP NULL AFTER status;
ALTER TABLE users ADD COLUMN full_name VARCHAR(255) GENERATED ALWAYS AS (CONCAT(first_name, ' ', last_name)) VIRTUAL;

