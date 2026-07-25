CREATE TABLE IF NOT EXISTS services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  category_id INT NOT NULL,
  subcategory_id INT NOT NULL,
  service_name VARCHAR(200) NOT NULL,
  short_description VARCHAR(500) NULL,
  full_description TEXT NULL,
  starting_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  estimated_duration VARCHAR(100) NULL,
  service_type ENUM('on_site', 'remote', 'consultation') NOT NULL DEFAULT 'on_site',
  thumbnail VARCHAR(255) NULL,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_services_company (company_id),
  INDEX idx_services_category (category_id),
  INDEX idx_services_subcategory (subcategory_id),
  INDEX idx_services_status (status),
  CONSTRAINT fk_services_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  CONSTRAINT fk_services_category FOREIGN KEY (category_id) REFERENCES service_categories(id) ON DELETE CASCADE,
  CONSTRAINT fk_services_subcategory FOREIGN KEY (subcategory_id) REFERENCES service_subcategories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS service_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  service_id INT NOT NULL,
  image_path VARCHAR(255) NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_service_images_service (service_id),
  CONSTRAINT fk_service_images_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS service_features (
  id INT AUTO_INCREMENT PRIMARY KEY,
  service_id INT NOT NULL,
  feature_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_service_features_service (service_id),
  CONSTRAINT fk_service_features_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS service_packages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  service_id INT NOT NULL,
  package_name VARCHAR(150) NOT NULL,
  package_description TEXT NULL,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  estimated_duration VARCHAR(100) NULL,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_service_packages_service (service_id),
  CONSTRAINT fk_service_packages_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
