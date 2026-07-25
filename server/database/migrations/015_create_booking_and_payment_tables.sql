CREATE TABLE IF NOT EXISTS addresses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  label VARCHAR(50) NOT NULL DEFAULT 'Home',
  contact_person VARCHAR(100) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  house_name VARCHAR(150) NOT NULL,
  street VARCHAR(255) NOT NULL,
  landmark VARCHAR(150) NULL,
  city VARCHAR(100) NOT NULL,
  district VARCHAR(100) NULL,
  state VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  latitude DECIMAL(10, 8) NULL,
  longitude DECIMAL(11, 8) NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_addresses_user (user_id),
  CONSTRAINT fk_addresses_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_number VARCHAR(50) NOT NULL UNIQUE,
  user_id INT NOT NULL,
  company_id INT NOT NULL,
  service_id INT NOT NULL,
  package_id INT NULL,
  address_id INT NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time VARCHAR(50) NOT NULL,
  estimated_end_time VARCHAR(50) NULL,
  booking_status ENUM('Pending', 'Confirmed', 'Employee Assigned', 'Scheduled', 'On The Way', 'Work Started', 'Work In Progress', 'Waiting For Customer', 'Completed', 'Cancelled', 'Rejected') NOT NULL DEFAULT 'Pending',
  payment_status ENUM('Pending', 'Paid', 'Failed', 'Refunded', 'Partial Refund') NOT NULL DEFAULT 'Pending',
  payment_method ENUM('Cash', 'Razorpay', 'UPI', 'Card', 'Net Banking', 'Wallet') NOT NULL DEFAULT 'Cash',
  special_instructions TEXT NULL,
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  cancelled_at TIMESTAMP NULL DEFAULT NULL,
  INDEX idx_bookings_user (user_id),
  INDEX idx_bookings_company (company_id),
  INDEX idx_bookings_status (booking_status),
  INDEX idx_bookings_payment_status (payment_status),
  CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_bookings_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  CONSTRAINT fk_bookings_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
  CONSTRAINT fk_bookings_address FOREIGN KEY (address_id) REFERENCES addresses(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS booking_services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  service_id INT NOT NULL,
  package_id INT NULL,
  service_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  quantity INT NOT NULL DEFAULT 1,
  total_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  INDEX idx_bs_booking (booking_id),
  CONSTRAINT fk_bs_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  CONSTRAINT fk_bs_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS booking_status_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  status VARCHAR(50) NOT NULL,
  remarks VARCHAR(255) NULL,
  changed_by VARCHAR(100) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_bsh_booking (booking_id),
  CONSTRAINT fk_bsh_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS booking_employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  employee_id INT NOT NULL,
  assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_be_booking (booking_id),
  INDEX idx_be_emp (employee_id),
  UNIQUE KEY uk_booking_emp (booking_id, employee_id),
  CONSTRAINT fk_be_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  CONSTRAINT fk_be_emp FOREIGN KEY (employee_id) REFERENCES company_employees(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  payment_reference VARCHAR(100) NOT NULL UNIQUE,
  payment_gateway VARCHAR(50) NOT NULL DEFAULT 'Razorpay',
  transaction_id VARCHAR(100) NULL,
  payment_status ENUM('Pending', 'Paid', 'Failed', 'Refunded', 'Partial Refund') NOT NULL DEFAULT 'Pending',
  amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  currency VARCHAR(10) NOT NULL DEFAULT 'USD',
  paid_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_payments_booking (booking_id),
  CONSTRAINT fk_payments_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS invoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL UNIQUE,
  invoice_number VARCHAR(50) NOT NULL UNIQUE,
  invoice_date DATE NOT NULL,
  invoice_path VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_invoices_booking (booking_id),
  CONSTRAINT fk_invoices_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notification_queue (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  company_id INT NULL,
  booking_id INT NULL,
  notification_type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  status ENUM('pending', 'sent', 'failed') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_nq_user (user_id),
  INDEX idx_nq_company (company_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
