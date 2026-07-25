CREATE TABLE IF NOT EXISTS company_gallery (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  image_path VARCHAR(255) NOT NULL,
  caption VARCHAR(255) NULL,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_gallery_company (company_id),
  CONSTRAINT fk_gallery_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS company_reviews_summary (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL UNIQUE,
  average_rating DECIMAL(3, 2) NOT NULL DEFAULT 5.00,
  total_reviews INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_reviews_company (company_id),
  CONSTRAINT fk_reviews_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
