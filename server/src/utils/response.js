const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};
const createdResponse = (res, data = null, message = 'Resource created successfully') => {
  return successResponse(res, data, message, 201);
};
const paginatedResponse = (res, items = [], page = 1, limit = 10, total = 0, message = 'Success') => {
  const totalPages = Math.ceil(total / limit) || 1;
  return res.status(200).json({
    success: true,
    message,
    data: items,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: Number(total),
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  });
};
const errorResponse = (res, message = 'An error occurred', statusCode = 500, errors = null) => {
  const payload = {
    success: false,
    message
  };
  if (errors) {
    payload.errors = errors;
  }
  return res.status(statusCode).json(payload);
};
module.exports = {
  successResponse,
  createdResponse,
  paginatedResponse,
  errorResponse
};
