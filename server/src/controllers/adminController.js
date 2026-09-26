const prisma = require('../config/db');
const { BOOKING_STATUS, COMPLAINT_STATUS } = require('../utils/constants');
const { successResponse, paginatedResponse, errorResponse } = require('../utils/response');
const notificationService = require('../services/notificationService');
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalCustomers,
      totalProviders,
      totalBookings,
      activeBookings,
      completedBookings,
      revenueResult,
      pendingComplaints,
      recentBookings
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.user.count({ where: { role: 'PROVIDER' } }),
      prisma.booking.count(),
      prisma.booking.count({
        where: {
          status: { in: [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.IN_PROGRESS] }
        }
      }),
      prisma.booking.count({ where: { status: BOOKING_STATUS.COMPLETED } }),
      prisma.booking.aggregate({ _sum: { amount: true } }),
      prisma.complaint.count({
        where: { status: { in: [COMPLAINT_STATUS.OPEN, COMPLAINT_STATUS.IN_INVESTIGATION] } }
      }),
      prisma.booking.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, name: true, email: true } },
          service: { select: { id: true, name: true } },
          provider: { include: { user: { select: { id: true, name: true } } } }
        }
      })
    ]);
    const stats = {
      totalUsers,
      totalCustomers,
      totalProviders,
      totalBookings,
      activeBookings,
      completedBookings,
      totalRevenue: revenueResult._sum.amount || 0,
      pendingComplaints,
      recentBookings
    };
    return successResponse(res, stats, 'Admin dashboard statistics retrieved');
  } catch (error) {
    next(error);
  }
};
const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role, search, isActive } = req.query;
    const skip = (page - 1) * limit;
    const where = {};
    if (role) where.role = role;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ];
    }
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          avatar: true,
          role: true,
          isActive: true,
          city: true,
          createdAt: true,
          providerProfile: {
            select: { id: true, isVerified: true, rating: true, reviewCount: true }
          },
          _count: {
            select: { bookings: true }
          }
        }
      }),
      prisma.user.count({ where })
    ]);
    return paginatedResponse(res, users, page, limit, total);
  } catch (error) {
    next(error);
  }
};
const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }
    if (user.role === 'ADMIN') {
      return errorResponse(res, 'Cannot change status of an Administrator account', 400);
    }
    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: isActive !== undefined ? isActive : !user.isActive },
      select: { id: true, email: true, name: true, isActive: true }
    });
    return successResponse(res, updated, 'User status updated');
  } catch (error) {
    next(error);
  }
};
const changeUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!['CUSTOMER', 'PROVIDER', 'ADMIN'].includes(role)) {
      return errorResponse(res, 'Invalid role specified', 400);
    }
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }
    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, name: true, role: true }
    });
    return successResponse(res, updated, 'User role updated');
  } catch (error) {
    next(error);
  }
};
const verifyProvider = async (req, res, next) => {
  try {
    const { providerId } = req.params;
    const { isVerified = true } = req.body;
    const provider = await prisma.providerProfile.findUnique({
      where: { id: providerId },
      include: { user: true }
    });
    if (!provider) {
      return errorResponse(res, 'Provider not found', 404);
    }
    const updated = await prisma.providerProfile.update({
      where: { id: providerId },
      data: { isVerified: Boolean(isVerified) },
      include: { user: { select: { id: true, name: true, email: true } } }
    });
     await notificationService.createNotification({
      userId: provider.userId,
      title: isVerified ? 'Provider Profile Verified!' : 'Provider Verification Revoked',
      message: isVerified
        ? 'Congratulations! Your Fixora provider profile has been officially verified.'
        : 'Your provider verification badge has been revoked. Contact support for details.',
      type: 'SYSTEM',
      referenceId: providerId,
      link: '/provider/profile'
    });
    return successResponse(res, updated, `Provider verification updated`);
  } catch (error) {
    next(error);
  }
};
const getAllBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 15, status, search } = req.query;
    const skip = (page - 1) * limit;
    const where = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { bookingNumber: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { customer: { email: { contains: search, mode: 'insensitive' } } }
      ];
    }
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, name: true, email: true } },
          service: { select: { id: true, name: true } },
          provider: { include: { user: { select: { id: true, name: true } } } }
        }
      }),
      prisma.booking.count({ where })
    ]);
    return paginatedResponse(res, bookings, page, limit, total);
  } catch (error) {
    next(error);
  }
};
const getAllComplaints = async (req, res, next) => {
  try {
    const { page = 1, limit = 15, status, priority } = req.query;
    const skip = (page - 1) * limit;
    const where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    const [complaints, total] = await Promise.all([
      prisma.complaint.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, name: true, email: true } },
          provider: { select: { id: true, name: true, email: true } },
          booking: { select: { id: true, bookingNumber: true } }
        }
      }),
      prisma.complaint.count({ where })
    ]);

     return paginatedResponse(res, complaints, page, limit, total);
  } catch (error) {
    next(error);
  }
};
module.exports = {
  getDashboardStats,
  getUsers,
  toggleUserStatus,
  changeUserRole,
  verifyProvider,
  getAllBookings,
  getAllComplaints
};
