class CompanyDocument {
  constructor({ id, company_id, document_name, document_path, document_type, uploaded_at }) {
    this.id = id;
    this.company_id = company_id;
    this.document_name = document_name;
    this.document_path = document_path;
    this.document_type = document_type;
    this.uploaded_at = uploaded_at;
  }
}

module.exports = CompanyDocument;
