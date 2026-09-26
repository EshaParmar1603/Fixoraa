const paymentService = require('../services/paymentService');
const prisma = require('../config/db');
const { successResponse, createdResponse, paginatedResponse, errorResponse } = require('../utils/response');
const processPayment = async (req, res, next) => {
  try {
    const payment = await paymentService.processMockPayment(req.user.id, req.body);
    return createdResponse(res, payment, 'Payment processed successfully');
  } catch (error) {
    next(error);
  }
};
const getPaymentByBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const payment = await paymentService.getPaymentByBooking(bookingId, req.user.id, req.user.role);
    return successResponse(res, payment);
  } catch (error) {
    next(error);
  }
};

const getMyPayments = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where: { customerId: req.user.id },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          booking: {
            include: {
              service: true,
              provider: { include: { user: { select: { id: true, name: true } } } }
            }
          }
        }
      }),
      prisma.payment.count({ where: { customerId: req.user.id } })
    ]);
    return paginatedResponse(res, payments, page, limit, total);
  } catch (error) {
    next(error);
  }
};
module.exports = {
  processPayment,
  getPaymentByBooking,
  getMyPayments
};
