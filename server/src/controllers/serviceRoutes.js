const prisma = require('../config/db');
const { successResponse, createdResponse, paginatedResponse, errorResponse } = require('../utils/response');
const getServices = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      categoryId,
      categorySlug,
      search,
      minPrice,
      maxPrice,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;
    const skip = (page - 1) * limit;
    const where = { isActive: true };
    if (categoryId) {
      where.categoryId = categoryId;
    }

     if (categorySlug) {
      where.category = { slug: categorySlug };
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (minPrice || maxPrice) {
      where.basePrice = {};
      if (minPrice) where.basePrice.gte = parseFloat(minPrice);
      if (maxPrice) where.basePrice.lte = parseFloat(maxPrice);
    }
const orderBy = {};
    if (sortBy === 'price') {
      orderBy.basePrice = sortOrder.toLowerCase() === 'desc' ? 'desc' : 'asc';
    } else if (sortBy === 'createdAt') {
      orderBy.createdAt = sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';
    } else {
      orderBy.name = sortOrder.toLowerCase() === 'desc' ? 'desc' : 'asc';
    }
    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy,
        include: {
          category: {
            select: { id: true, name: true, slug: true, icon: true }
          },
          _count: {
            select: { reviews: true, bookings: true }
          }
        }
      }),
      prisma.service.count({ where })
    ]);
     return paginatedResponse(res, services, page, limit, total);
  } catch (error) {
    next(error);
  }
};
const getServiceBySlugOrId = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const service = await prisma.service.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }]
      },
      include: {
        category: true,
        providers: {
          include: {
            provider: {
              include: {
                user: { select: { id: true, name: true, avatar: true, phone: true } },
                availabilities: true
              }
            }
          }
        },
        reviews: {
          include: {
            customer: { select: { id: true, name: true, avatar: true } }
          },
          take: 10,
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: { reviews: true, bookings: true }
        }
      }
    });
    if (!service) {
      return errorResponse(res, 'Service not found', 404);
    }
    return successResponse(res, service);
  } catch (error) {
    next(error);
  }
};
const createService = async (req, res, next) => {
  try {
    const { categoryId, name, slug, description, basePrice, durationMinutes, image } = req.body;
    const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const service = await prisma.service.create({
      data: {
        categoryId,
        name,
        slug: generatedSlug,
        description,
        basePrice: parseFloat(basePrice),
        durationMinutes: durationMinutes ? parseInt(durationMinutes, 10) : 60,
        image
      },
      include: { category: true }
    });
    return createdResponse(res, service, 'Service created successfully');
  } catch (error) {
    next(error);
  }
};
const updateService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { categoryId, name, slug, description, basePrice, durationMinutes, image, isActive } = req.body;
    const updated = await prisma.service.update({
      where: { id },
      data: {
        categoryId,
        name,
        slug,
        description,
        basePrice: basePrice !== undefined ? parseFloat(basePrice) : undefined,
        durationMinutes: durationMinutes !== undefined ? parseInt(durationMinutes, 10) : undefined,
        image,
        isActive
      },
      include: { category: true }
    });

return successResponse(res, updated, 'Service updated successfully');
  } catch (error) {
    next(error);
  }
};
const deleteService = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.service.delete({ where: { id } });
    return successResponse(res, null, 'Service deleted successfully');
  } catch (error) {
    next(error);
  }
};
module.exports = {
  getServices,
  getServiceBySlugOrId,
  createService,
  updateService,
  deleteService
};
