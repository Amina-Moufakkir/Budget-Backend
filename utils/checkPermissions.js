const UnAuthenticatedError = require('../error-helpers/UnAuthenticatedError');

const checkPermissions = (requestUser, resourceUserId) => {
  if (requestUser.userId === resourceUserId._id.toString()) return;
  throw new UnAuthenticatedError('Access denied');
};

module.exports = checkPermissions;
