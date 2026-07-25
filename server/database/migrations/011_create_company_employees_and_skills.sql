CREATE TABLE IF NOT EXISTS company_employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  employee_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  designation VARCHAR(100) NOT NULL,
  profile_photo VARCHAR(255) NULL,
  address TEXT NULL,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_employees_company (company_id),
  INDEX idx_employees_email (email),
  CONSTRAINT fk_employees_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS employee_skills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  subcategory_id INT NOT NULL,
  experience_years INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_emp_skills_emp (employee_id),
  INDEX idx_emp_skills_sub (subcategory_id),
  UNIQUE KEY uk_employee_skill (employee_id, subcategory_id),
  CONSTRAINT fk_emp_skills_emp FOREIGN KEY (employee_id) REFERENCES company_employees(id) ON DELETE CASCADE,
  CONSTRAINT fk_emp_skills_sub FOREIGN KEY (subcategory_id) REFERENCES service_subcategories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
