const prisma = require('../config/db');
const { BOOKING_STATUS } = require('../utils/constants');
const { successResponse, createdResponse, paginatedResponse, errorResponse } = require('../utils/response');
const notificationService = require('../services/notificationService');
const createReview = async (req, res, next) => {
  try {
    const { bookingId, rating, comment } = req.body;
    const customerId = req.user.id;
    if (!rating || rating < 1 || rating > 5) {
      return errorResponse(res, 'Rating must be an integer between 1 and 5', 400);
    }
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        provider: true,
        review: true
      }
    });
    if (!booking) {
      return errorResponse(res, 'Booking not found', 404);
    }
    if (booking.customerId !== customerId) {
      return errorResponse(res, 'You can only review your own bookings', 403);
    }
    if (booking.status !== BOOKING_STATUS.COMPLETED) {
      return errorResponse(res, 'You can only review bookings that have been completed', 400);
    }
    if (booking.review) {
      return errorResponse(res, 'You have already submitted a review for this booking', 400);
    }
 if (!booking.providerId) {
      return errorResponse(res, 'Cannot review a booking without an assigned provider', 400);
    }
    const review = await prisma.$transaction(async (tx) => {
      // 1. Create review
      const newReview = await tx.review.create({
        data: {
          bookingId,
          customerId,
          providerId: booking.providerId,
          serviceId: booking.serviceId,
          rating: parseInt(rating, 10),
          comment: comment || ''
        },
        include: {
          customer: { select: { id: true, name: true, avatar: true } },
          service: { select: { id: true, name: true } }
        }
      });

       const agg = await tx.review.aggregate({
        where: { providerId: booking.providerId },
        _avg: { rating: true },
        _count: { rating: true }
      });
      await tx.providerProfile.update({
        where: { id: booking.providerId },
        data: {
          rating: parseFloat((agg._avg.rating || 0).toFixed(1)),
          reviewCount: agg._count.rating || 0
        }
      });
      return newReview;
    });
    // Notify provider
    if (booking.provider?.userId) {
      await notificationService.createNotification({
        userId: booking.provider.userId,
        title: 'New Customer Review',
        message: `${req.user.name} rated your service ${rating}/5 stars: "${comment}"`,
        type: 'SYSTEM',
        referenceId: review.id,
        link: `/provider/reviews`
      });
    }
    return createdResponse(res, review, 'Review submitted successfully');
  } catch (error) {
    next(error);
  }
};
const getReviewsByProvider = async (req, res, next) => {
  try {
    const { providerId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { providerId },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, name: true, avatar: true } },
          service: { select: { id: true, name: true } }
        }
      }),
      prisma.review.count({ where: { providerId } })
    ]);
     return paginatedResponse(res, reviews, page, limit, total);
  } catch (error) {
    next(error);
  }
};
const getReviewsByService = async (req, res, next) => {
  try {
    const { serviceId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { serviceId },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, name: true, avatar: true } }
        }
      }),
      prisma.review.count({ where: { serviceId } })
    ]);
      return paginatedResponse(res, reviews, page, limit, total);
  } catch (error) {
    next(error);
  }
};
module.exports = {
  createReview,
  getReviewsByProvider,
  getReviewsByService
};