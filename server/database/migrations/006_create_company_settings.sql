CREATE TABLE IF NOT EXISTS company_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL UNIQUE,
  working_hours VARCHAR(100) NULL DEFAULT '09:00 - 18:00',
  working_days VARCHAR(255) NULL DEFAULT 'Monday - Saturday',
  service_radius DECIMAL(10, 2) NULL DEFAULT 25.00,
  minimum_booking_amount DECIMAL(10, 2) NULL DEFAULT 0.00,
  company_status ENUM('pending', 'active', 'inactive', 'blocked', 'rejected') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_company_settings_company (company_id),
  CONSTRAINT fk_company_settings_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
