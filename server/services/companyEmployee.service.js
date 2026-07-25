const employeeRepository = require('../repositories/employee.repository');
const auditLogService = require('./auditLog.service');
const Employee = require('../models/employee.model');

class CompanyEmployeeService {
  async getEmployees(companyId, query) {
    const result = await employeeRepository.findAll(companyId, query);
    return {
      ...result,
      items: result.items.map(Employee.toResponse)
    };
  }

  async getEmployeeById(employeeId, companyId) {
    const emp = await employeeRepository.findById(employeeId, companyId);
    if (!emp) {
      const error = new Error('Employee not found or unauthorized access.');
      error.statusCode = 404;
      throw error;
    }
    return Employee.toResponse(emp);
  }

  async createEmployee(companyId, userId, ipAddress, data, photoFile = null) {
    const existing = await employeeRepository.findByEmail(data.email, companyId);
    if (existing) {
      const error = new Error('An employee with this email already exists in your company.');
      error.statusCode = 409;
      throw error;
    }

    const photoPath = photoFile ? photoFile.path : null;

    const employeeId = await employeeRepository.create({
      company_id: companyId,
      employee_name: data.employee_name,
      email: data.email,
      phone: data.phone,
      designation: data.designation,
      profile_photo: photoPath,
      address: data.address || null,
      status: data.status || 'active'
    });

    if (data.skills) {
      const skillsArray = typeof data.skills === 'string' ? JSON.parse(data.skills) : data.skills;
      if (Array.isArray(skillsArray) && skillsArray.length) {
        await employeeRepository.setSkills(employeeId, skillsArray);
      }
    }

    await auditLogService.log({
      user_id: userId,
      action: 'Employee Added',
      table_name: 'company_employees',
      record_id: employeeId,
      ip_address: ipAddress
    });

    return await employeeRepository.findById(employeeId, companyId);
  }

  async updateEmployee(employeeId, companyId, userId, ipAddress, data, photoFile = null) {
    const emp = await employeeRepository.findById(employeeId, companyId);
    if (!emp) {
      const error = new Error('Employee not found or unauthorized access.');
      error.statusCode = 404;
      throw error;
    }

    const photoPath = photoFile ? photoFile.path : undefined;

    const updated = await employeeRepository.update(employeeId, companyId, {
      employee_name: data.employee_name,
      email: data.email,
      phone: data.phone,
      designation: data.designation,
      profile_photo: photoPath,
      address: data.address,
      status: data.status
    });

    if (data.skills !== undefined) {
      const skillsArray = typeof data.skills === 'string' ? JSON.parse(data.skills) : data.skills;
      await employeeRepository.setSkills(employeeId, Array.isArray(skillsArray) ? skillsArray : []);
    }

    await auditLogService.log({
      user_id: userId,
      action: 'Employee Updated',
      table_name: 'company_employees',
      record_id: employeeId,
      ip_address: ipAddress
    });

    return await employeeRepository.findById(employeeId, companyId);
  }

  async updateEmployeeStatus(employeeId, companyId, status) {
    const emp = await employeeRepository.findById(employeeId, companyId);
    if (!emp) {
      const error = new Error('Employee not found or unauthorized access.');
      error.statusCode = 404;
      throw error;
    }
    return await employeeRepository.updateStatus(employeeId, companyId, status);
  }

  async deleteEmployee(employeeId, companyId, userId, ipAddress) {
    const emp = await employeeRepository.findById(employeeId, companyId);
    if (!emp) {
      const error = new Error('Employee not found or unauthorized access.');
      error.statusCode = 404;
      throw error;
    }

    const deleted = await employeeRepository.softDelete(employeeId, companyId);

    await auditLogService.log({
      user_id: userId,
      action: 'Employee Deleted',
      table_name: 'company_employees',
      record_id: employeeId,
      ip_address: ipAddress
    });

    return deleted;
  }
}

module.exports = new CompanyEmployeeService();
