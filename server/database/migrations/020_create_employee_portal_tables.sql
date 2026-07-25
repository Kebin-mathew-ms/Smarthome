CREATE TABLE IF NOT EXISTS employee_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  login_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  logout_time TIMESTAMP NULL DEFAULT NULL,
  device VARCHAR(100) NULL,
  browser VARCHAR(100) NULL,
  ip_address VARCHAR(45) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_es_employee (employee_id),
  CONSTRAINT fk_es_employee FOREIGN KEY (employee_id) REFERENCES company_employees(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS employee_checkins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  employee_id INT NOT NULL,
  check_in_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  check_out_time TIMESTAMP NULL DEFAULT NULL,
  latitude DECIMAL(10, 8) NULL,
  longitude DECIMAL(11, 8) NULL,
  address VARCHAR(255) NULL,
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ec_booking (booking_id),
  INDEX idx_ec_employee (employee_id),
  CONSTRAINT fk_ec_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  CONSTRAINT fk_ec_employee FOREIGN KEY (employee_id) REFERENCES company_employees(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS employee_signatures (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL UNIQUE,
  employee_id INT NOT NULL,
  customer_signature LONGTEXT NOT NULL,
  signed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_esig_booking (booking_id),
  INDEX idx_esig_employee (employee_id),
  CONSTRAINT fk_esig_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  CONSTRAINT fk_esig_employee FOREIGN KEY (employee_id) REFERENCES company_employees(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS employee_daily_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  booking_id INT NOT NULL,
  work_summary TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_edl_employee (employee_id),
  INDEX idx_edl_booking (booking_id),
  CONSTRAINT fk_edl_employee FOREIGN KEY (employee_id) REFERENCES company_employees(id) ON DELETE CASCADE,
  CONSTRAINT fk_edl_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
