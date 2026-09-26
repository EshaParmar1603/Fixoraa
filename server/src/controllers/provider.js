const prisma = require('../config/db');
const { successResponse, paginatedResponse, errorResponse } = require('../utils/response');
const getProviders = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      serviceId,
      city,
      minRating,
      availableOnly = 'false'
    } = req.query;
    const skip = (page - 1) * limit;
    const where = {};
    if (availableOnly === 'true') {
      where.isAvailable = true;
    }
    if (minRating) {
      where.rating = { gte: parseFloat(minRating) };
    }

    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }
    if (serviceId) {
      where.services = {
        some: { serviceId }
      };
    }
    const [providers, total] = await Promise.all([
      prisma.providerProfile.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: [{ rating: 'desc' }, { reviewCount: 'desc' }],
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true, avatar: true }
          },
          services: {
            include: {
              service: {
                select: { id: true, name: true, slug: true, basePrice: true, category: true }
              }
            }
          },
          availabilities: true
        }
      }),
      prisma.providerProfile.count({ where })
    ]);
     return paginatedResponse(res, providers, page, limit, total);
  } catch (error) {
    next(error);
  }
};
const getProviderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const provider = await prisma.providerProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true, avatar: true, city: true, state: true }
        },
        services: {
          include: {
            service: { include: { category: true } }
          }
        },
        availabilities: {
          orderBy: { dayOfWeek: 'asc' }
        },
        reviews: {
          include: {
            customer: { select: { id: true, name: true, avatar: true } },
            service: { select: { id: true, name: true } }
          },
          take: 10,
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    if (!provider) {
      return errorResponse(res, 'Provider profile does not exist for this user', 404);
    }
    return successResponse(res, provider);
  } catch (error) {
    next(error);
  }
};
const updateAvailability = async (req, res, next) => {
  try {
    const { schedules } = req.body; // Array of { dayOfWeek: 0-6, startTime: "09:00", endTime: "18:00", isAvailable: true }
    if (!Array.isArray(schedules)) {
      return errorResponse(res, 'Schedules must be an array of daily availability objects', 400);
    }
    const provider = await prisma.providerProfile.findUnique({
      where: { userId: req.user.id }
    });
    if (!provider) {
      return errorResponse(res, 'Provider profile not configured', 404);
    }
    const updated = await prisma.providerProfile.update({
      where: { id: provider.id },
      data: {
        availabilities: {
          deleteMany: {},
          create: schedules
        }
      },
      include: { availabilities: { orderBy: { dayOfWeek: 'asc' } } }
    });
    return successResponse(res, updated.availabilities, 'Availability updated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProviders,
  getProviderById,
  updateAvailability
};