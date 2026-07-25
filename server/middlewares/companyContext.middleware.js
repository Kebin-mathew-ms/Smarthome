const companyUserRepository = require('../repositories/companyUser.repository');
const { sendError } = require('../utils/response.util');
const HTTP_STATUS = require('../utils/httpStatus.util');

const requireCompanyContext = async (req, res, next) => {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required.', ['User missing from request context'], HTTP_STATUS.UNAUTHORIZED);
    }

    if (req.user.role !== 'Company') {
      return sendError(res, 'Access forbidden. Only company users are permitted.', ['Forbidden role access'], HTTP_STATUS.FORBIDDEN);
    }

    const companyUser = await companyUserRepository.findCompanyByUserId(req.user.id);
    if (!companyUser) {
      return sendError(res, 'No service company linked to your account.', ['Company context not found'], HTTP_STATUS.FORBIDDEN);
    }

    if (companyUser.status !== 'active') {
      return sendError(res, 'Your company profile is currently inactive or pending approval.', ['Company status inactive'], HTTP_STATUS.FORBIDDEN);
    }

    req.companyId = companyUser.company_id;
    req.company = companyUser;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = requireCompanyContext;
