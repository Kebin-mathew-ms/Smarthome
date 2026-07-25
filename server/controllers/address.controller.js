const addressService = require('../services/address.service');
const { sendSuccess } = require('../utils/response.util');
const HTTP_STATUS = require('../utils/httpStatus.util');

class AddressController {
  async getAddresses(req, res, next) {
    try {
      const list = await addressService.getAddresses(req.user.id);
      return sendSuccess(res, 'User addresses retrieved successfully', list, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async getAddressById(req, res, next) {
    try {
      const addr = await addressService.getAddressById(req.params.id, req.user.id);
      return sendSuccess(res, 'Address details retrieved successfully', addr, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async createAddress(req, res, next) {
    try {
      const created = await addressService.createAddress(req.user.id, req.body);
      return sendSuccess(res, 'Address created successfully', created, HTTP_STATUS.CREATED);
    } catch (error) {
      next(error);
    }
  }

  async updateAddress(req, res, next) {
    try {
      const updated = await addressService.updateAddress(req.params.id, req.user.id, req.body);
      return sendSuccess(res, 'Address updated successfully', updated, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async deleteAddress(req, res, next) {
    try {
      await addressService.deleteAddress(req.params.id, req.user.id);
      return sendSuccess(res, 'Address deleted successfully', {}, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  async setDefaultAddress(req, res, next) {
    try {
      const updated = await addressService.setDefaultAddress(req.params.id, req.user.id);
      return sendSuccess(res, 'Default address updated', updated, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AddressController();
