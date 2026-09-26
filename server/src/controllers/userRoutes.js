const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        avatar: true,
        city: true,
        state: true,
        role: true,
        createdAt: true,
        providerProfile: {
          select: {
            id: true,
            bio: true,
            rating: true,
            reviewCount: true,
             experienceYears: true,
            hourlyRate: true,
            isVerified: true,
            isAvailable: true
          }
        }
      }
    });
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }
    return successResponse(res, user);
  } catch (error) {
    next(error);
  }
};
const updateAvatar = async (req, res, next) => {
  try {
    const { avatar } = req.body;
    if (!avatar) {
      return errorResponse(res, 'Avatar URL is required', 400);
    }
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { avatar },
      select: { id: true, name: true, email: true, avatar: true }
    });
    return successResponse(res, updated, 'Avatar updated successfully');
  } catch (error) {
    next(error);
  }
};
module.exports = {
  getUserById,
  updateAvatar
};
