CREATE TABLE IF NOT EXISTS analytics_cache (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cache_key VARCHAR(100) NOT NULL UNIQUE,
  cache_value LONGTEXT NOT NULL,
  generated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_ac_key (cache_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS employee_attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  booking_id INT NOT NULL,
  check_in_time TIMESTAMP NULL DEFAULT NULL,
  check_out_time TIMESTAMP NULL DEFAULT NULL,
  working_hours DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ea_employee (employee_id),
  INDEX idx_ea_booking (booking_id),
  CONSTRAINT fk_ea_employee FOREIGN KEY (employee_id) REFERENCES company_employees(id) ON DELETE CASCADE,
  CONSTRAINT fk_ea_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS employee_performance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL UNIQUE,
  completed_jobs INT NOT NULL DEFAULT 0,
  cancelled_jobs INT NOT NULL DEFAULT 0,
  average_rating DECIMAL(3, 2) NOT NULL DEFAULT 5.00,
  late_arrivals INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_ep_employee (employee_id),
  CONSTRAINT fk_ep_employee FOREIGN KEY (employee_id) REFERENCES company_employees(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS system_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_ss_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS system_announcements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  visible_to ENUM('all', 'companies', 'customers') NOT NULL DEFAULT 'all',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  activity VARCHAR(255) NOT NULL,
  ip_address VARCHAR(45) NULL,
  device VARCHAR(100) NULL,
  browser VARCHAR(100) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_al_user (user_id),
  INDEX idx_al_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
