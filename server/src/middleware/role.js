const { errorResponse } = require('../utils/response');
/**
 * Authorize specified roles
 * @param  {...string} allowedRoles
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required before role verification.', 401);
    }
    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Access denied. Requires one of roles: [${allowedRoles.join(', ')}]. Current role: ${req.user.role}`,
        403
      );
    }
    next();
  };
};
module.exports = {
  authorize
};