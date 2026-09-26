const prisma = require('../config/db');
const { successResponse, createdResponse, errorResponse } = require('../utils/response');

const getCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      include: { _count: { select: { services: true } } }
    });
    return successResponse(res, categories);
  } catch (error) {
    next(error);
  }
};

const getCategoryBySlugOrId = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const category = await prisma.category.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }]
      },
      include: {
        services: {
          where: { isActive: true },
          include: {
            _count: { select: { reviews: true, bookings: true } }
          }
        }
      }
    });
    if (!category) {
      return errorResponse(res, 'Category not found', 404);
    }
    return successResponse(res, category);
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name, slug, description, icon, image } = req.body;
    const generatedSlug = slug || name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const category = await prisma.category.create({
      data: {
        name,
        slug: generatedSlug,
        description,
        icon,
        image
      }
    });
    return createdResponse(res, category, 'Category created successfully');
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, slug, description, icon, image, isActive } = req.body;
    const updated = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        icon,
        image,
        isActive
      }
    });
    return successResponse(res, updated, 'Category updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.category.delete({ where: { id } });
    return successResponse(res, null, 'Category deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategoryBySlugOrId,
  createCategory,
  updateCategory,
  deleteCategory
};

