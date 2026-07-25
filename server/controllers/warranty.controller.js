const warrantyService = require('../services/warranty.service');
const { sendSuccess } = require('../utils/response.util');
const HTTP_STATUS = require('../utils/httpStatus.util');

class WarrantyController {
  async issueWarranty(req, res, next) {
    try {
      const warranty = await warrantyService.issueWarranty(req.user, req.ip, req.body);
      return sendSuccess(res, 'Warranty issued successfully', warranty, HTTP_STATUS.CREATED);
    } catch (error) {
      next(error);
    }
  }

  async getWarranties(req, res, next) {
    try {
      let list = [];
      if (req.user.role === 'Company') {
        list = await warrantyService.getCompanyWarranties(req.user.companyId || req.user.id);
      } else {
        list = await warrantyService.getUserWarranties(req.user.id);
      }
      return sendSuccess(res, 'Warranties retrieved', list, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async getWarrantyByBookingId(req, res, next) {
    try {
      const warranty = await warrantyService.getWarrantyByBookingId(req.params.bookingId);
      return sendSuccess(res, 'Warranty details retrieved', warranty, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new WarrantyController();
