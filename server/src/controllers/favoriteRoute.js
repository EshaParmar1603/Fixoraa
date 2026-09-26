const { successResponse, createdResponse, errorResponse } = require('../utils/response');
const toggleFavorite = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const { serviceId, providerId } = req.body;
    if (!serviceId && !providerId) {
      return errorResponse(res, 'Either serviceId or providerId must be provided', 400);
    }
    const existing = await prisma.favorite.findFirst({
      where: {
        customerId,
        serviceId: serviceId || null,
        providerId: providerId || null
      }
    });
    if (existing) {
      await prisma.favorite.delete({
        where: { id: existing.id }
      });
      return successResponse(res, { favorited: false }, 'Removed from favorites');
    } else {
      const fav = await prisma.favorite.create({
        data: {
          customerId,
          serviceId: serviceId || null,
          providerId: providerId || null
        }
      });
      return createdResponse(res, { favorited: true, favorite: fav }, 'Added to favorites');
    }
  } catch (error) {
    next(error);
  }
};

const getMyFavorites = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const favorites = await prisma.favorite.findMany({
      where: { customerId },
      include: {
        service: {
          include: { category: true }
        },
        provider: {
          include: {
            user: { select: { id: true, name: true, avatar: true, phone: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return successResponse(res, favorites);
  } catch (error) {
    next(error);
  }
};
module.exports = {
  toggleFavorite,
  getMyFavorites
};