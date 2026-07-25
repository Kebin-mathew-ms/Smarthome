CREATE TABLE IF NOT EXISTS company_documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  document_name VARCHAR(255) NOT NULL,
  document_path VARCHAR(255) NOT NULL,
  document_type VARCHAR(100) NOT NULL,
  uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_company_docs_company (company_id),
  CONSTRAINT fk_company_docs_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
