const crypto = require('crypto');
const companyRepository = require('../repositories/company.repository');
const companySettingRepository = require('../repositories/companySetting.repository');
const companyDocumentRepository = require('../repositories/companyDocument.repository');
const userRepository = require('../repositories/user.repository');
const companyUserRepository = require('../repositories/companyUser.repository');
const { hashPassword } = require('../utils/password.util');
const Company = require('../models/company.model');

class CompanyService {
  generateTemporaryPassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = 'Comp@';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  async createCompany(companyData, creatorId) {
    const existing = await companyRepository.findByEmail(companyData.company_email);
    if (existing) {
      const error = new Error('A company with this email address already exists.');
      error.statusCode = 409;
      throw error;
    }

    // Check if user already exists with this company email
    const existingUser = await userRepository.findByEmail(companyData.company_email);
    if (existingUser) {
      const error = new Error('A user account with this email address already exists.');
      error.statusCode = 409;
      throw error;
    }

    // 1. Create Company record
    const company = await companyRepository.create({
      company_name: companyData.company_name,
      company_email: companyData.company_email,
      company_phone: companyData.company_phone,
      logo: companyData.logo || null,
      address: companyData.address,
      city: companyData.city,
      district: companyData.district || null,
      state: companyData.state,
      postal_code: companyData.postal_code,
      description: companyData.description || null,
      status: companyData.status || 'pending',
      created_by: creatorId
    });

    // 2. Create Company Settings record
    const settings = await companySettingRepository.upsert(company.id, {
      working_hours: companyData.working_hours,
      working_days: companyData.working_days,
      service_radius: companyData.service_radius,
      minimum_booking_amount: companyData.minimum_booking_amount,
      company_status: company.status
    });

    // 3. Automatically generate Company Login User & Temporary Password
    const temporaryPassword = this.generateTemporaryPassword();
    const hashedPassword = await hashPassword(temporaryPassword);

    const nameParts = companyData.company_name.trim().split(' ');
    const firstName = nameParts[0] || 'Company';
    const lastName = nameParts.slice(1).join(' ') || 'Admin';

    const companyUser = await userRepository.create({
      first_name: firstName,
      last_name: lastName,
      email: companyData.company_email,
      phone: companyData.company_phone,
      password: hashedPassword,
      role: 'Company',
      status: company.status === 'active' ? 'active' : 'inactive'
    });

    // 4. Link User to Company
    await companyUserRepository.linkUserToCompany(company.id, companyUser.id, 'Manager');

    return {
      company: Company.toResponse(company),
      settings,
      credentials: {
        email: companyData.company_email,
        temporaryPassword
      }
    };
  }

  async getCompanies(query) {
    const result = await companyRepository.findAll(query);
    return {
      ...result,
      items: result.items.map(Company.toResponse)
    };
  }

  async getCompanyById(id) {
    const company = await companyRepository.findById(id);
    if (!company) {
      const error = new Error('Company not found.');
      error.statusCode = 404;
      throw error;
    }
    const settings = await companySettingRepository.findByCompanyId(id);
    const documents = await companyDocumentRepository.findByCompanyId(id);
    const employees = await companyUserRepository.findUsersByCompanyId(id);

    return {
      ...Company.toResponse(company),
      settings,
      documents,
      employeesCount: employees.length,
      servicesCount: 0,
      bookingsCount: 0,
      revenue: 0
    };
  }

  async updateCompany(id, companyData) {
    const company = await companyRepository.findById(id);
    if (!company) {
      const error = new Error('Company not found.');
      error.statusCode = 404;
      throw error;
    }

    const updated = await companyRepository.update(id, companyData);

    if (companyData.working_hours || companyData.working_days || companyData.service_radius || companyData.minimum_booking_amount) {
      await companySettingRepository.upsert(id, {
        working_hours: companyData.working_hours,
        working_days: companyData.working_days,
        service_radius: companyData.service_radius,
        minimum_booking_amount: companyData.minimum_booking_amount,
        company_status: companyData.status || company.status
      });
    }

    return Company.toResponse(updated);
  }

  async updateCompanyStatus(id, status) {
    const company = await companyRepository.findById(id);
    if (!company) {
      const error = new Error('Company not found.');
      error.statusCode = 404;
      throw error;
    }

    const updated = await companyRepository.updateStatus(id, status);

    // Sync company user status
    const companyUserLink = await companyUserRepository.findUsersByCompanyId(id);
    if (companyUserLink && companyUserLink.length > 0) {
      const targetUserStatus = status === 'active' ? 'active' : 'inactive';
      for (const u of companyUserLink) {
        await userRepository.updateStatus(u.user_id, targetUserStatus);
      }
    }

    return Company.toResponse(updated);
  }

  async resetCompanyPassword(companyId) {
    const company = await companyRepository.findById(companyId);
    if (!company) {
      const error = new Error('Company not found.');
      error.statusCode = 404;
      throw error;
    }

    const companyUser = await userRepository.findByEmail(company.company_email);
    if (!companyUser) {
      const error = new Error('Company user account not found for credential reset.');
      error.statusCode = 404;
      throw error;
    }

    const temporaryPassword = this.generateTemporaryPassword();
    const hashedPassword = await hashPassword(temporaryPassword);

    await userRepository.updatePassword(companyUser.id, hashedPassword);

    return {
      companyId: company.id,
      email: company.company_email,
      temporaryPassword
    };
  }

  async deleteCompany(id) {
    const company = await companyRepository.findById(id);
    if (!company) {
      const error = new Error('Company not found.');
      error.statusCode = 404;
      throw error;
    }

    return await companyRepository.softDelete(id);
  }

  async addDocument(companyId, { document_name, document_path, document_type }) {
    return await companyDocumentRepository.create({
      company_id: companyId,
      document_name,
      document_path,
      document_type
    });
  }
}

module.exports = new CompanyService();
