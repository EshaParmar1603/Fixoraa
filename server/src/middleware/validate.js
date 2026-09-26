const { validationResult } = require('express-validator');
const { errorResponse } = require('../utils/response');
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value
    }));
    return errorResponse(res, 'Validation failed. Please verify your inputs.', 422, formattedErrors);
  }
  next();
};
module.exports = {
  validate
};