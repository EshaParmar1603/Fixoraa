const env = require('../config/env');
const { errorResponse } = require('../utils/response');
const notFoundHandler = (req, res, next) => {
  return errorResponse(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
};
const errorHandler = (err, req, res, next) => {
  console.error('[Error caught by global handler]:', err);
  // Prisma Unique Constraint Violation
  if (err.code === 'P2002') {
    const fields = err.meta?.target ? err.meta.target.join(', ') : 'field';
    return errorResponse(res, `A record with this ${fields} already exists.`, 409);
  }
  // Prisma Record Not Found
  if (err.code === 'P2025') {
    return errorResponse(res, err.meta?.cause || 'The requested resource was not found.', 404);
  }
  // Prisma Foreign Key Constraint Failure
  if (err.code === 'P2003') {
    return errorResponse(res, 'Foreign key constraint failed. Related record does not exist.', 400);
  }
  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 'Invalid authorization token.', 401);
  }
  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, 'Authorization token has expired. Please log in again.', 401);
  }
   const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  return errorResponse(
    res,
    message,
    statusCode,
    env.NODE_ENV === 'development' ? { stack: err.stack } : null
  );
};
module.exports = {
  notFoundHandler,
  errorHandler
};