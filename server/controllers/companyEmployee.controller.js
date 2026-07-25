const companyEmployeeService = require('../services/companyEmployee.service');
const { sendSuccess } = require('../utils/response.util');
const HTTP_STATUS = require('../utils/httpStatus.util');

class CompanyEmployeeController {
  async getEmployees(req, res, next) {
    try {
      const result = await companyEmployeeService.getEmployees(req.companyId, req.query);
      return sendSuccess(res, 'Employees retrieved successfully', result, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async getEmployeeById(req, res, next) {
    try {
      const emp = await companyEmployeeService.getEmployeeById(req.params.id, req.companyId);
      return sendSuccess(res, 'Employee details retrieved successfully', emp, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async createEmployee(req, res, next) {
    try {
      const photoFile = req.file ? req.file : null;
      const emp = await companyEmployeeService.createEmployee(
        req.companyId,
        req.user.id,
        req.ip,
        req.body,
        photoFile
      );
      return sendSuccess(res, 'Employee added successfully', emp, HTTP_STATUS.CREATED);
    } catch (error) {
      next(error);
    }
  }

  async updateEmployee(req, res, next) {
    try {
      const photoFile = req.file ? req.file : null;
      const updated = await companyEmployeeService.updateEmployee(
        req.params.id,
        req.companyId,
        req.user.id,
        req.ip,
        req.body,
        photoFile
      );
      return sendSuccess(res, 'Employee updated successfully', updated, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async updateEmployeeStatus(req, res, next) {
    try {
      const { employeeId, status } = req.body;
      const updated = await companyEmployeeService.updateEmployeeStatus(employeeId, req.companyId, status);
      return sendSuccess(res, `Employee status updated to ${status}`, updated, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async deleteEmployee(req, res, next) {
    try {
      await companyEmployeeService.deleteEmployee(req.params.id, req.companyId, req.user.id, req.ip);
      return sendSuccess(res, 'Employee deleted successfully', {}, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CompanyEmployeeController();
