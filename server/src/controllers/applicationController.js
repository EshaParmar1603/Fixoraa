
const prisma = require('../config/db');
const { successResponse, createdResponse, errorResponse } = require('../utils/response');
const getMyAppliances = async (req, res, next) => {
  try {
    const appliances = await prisma.appliance.findMany({
      where: { userId: req.user.id },
      include: {
        reminders: { orderBy: { dueDate: 'asc' } },
        billsAndWarranties: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return successResponse(res, appliances);
  } catch (error) {
    next(error);
  }
};
const getApplianceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const appliance = await prisma.appliance.findFirst({
      where: { id, userId: req.user.id },
      include: {
        reminders: { orderBy: { dueDate: 'asc' } },
        billsAndWarranties: true
      }
    });
    if (!appliance) {
      return errorResponse(res, 'Appliance not found', 404);
    }
    return successResponse(res, appliance);
  } catch (error) {
    next(error);
  }
};
const createAppliance = async (req, res, next) => {
  try {
    const { name, brand, modelNumber, serialNumber, category, purchaseDate, warrantyExpiryDate, location, notes } = req.body;
    const appliance = await prisma.appliance.create({
      data: {
        userId: req.user.id,
        name,
        brand,
        modelNumber,
        serialNumber,
        category,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
        warrantyExpiryDate: warrantyExpiryDate ? new Date(warrantyExpiryDate) : undefined,
        location,
        notes
      }
    });
    return createdResponse(res, appliance, 'Appliance added successfully');
  } catch (error) {
    next(error);
  }
};
const updateAppliance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, brand, modelNumber, serialNumber, category, purchaseDate, warrantyExpiryDate, location, notes } = req.body;
    const existing = await prisma.appliance.findFirst({ where: { id, userId: req.user.id } });
    if (!existing) {
      return errorResponse(res, 'Appliance not found', 404);
    }
    const updated = await prisma.appliance.update({
      where: { id },
      data: {
        name,
        brand,
        modelNumber,
        serialNumber,
        category,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
        warrantyExpiryDate: warrantyExpiryDate ? new Date(warrantyExpiryDate) : undefined,
        location,
        notes
      }
    });
    return successResponse(res, updated, 'Appliance updated successfully');
  } catch (error) {
    next(error);
  }
};
const deleteAppliance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.appliance.findFirst({
      where: { id, userId: req.user.id }
    });
    if (!existing) {
      return errorResponse(res, 'Appliance not found', 404);
    }
    await prisma.appliance.delete({ where: { id } });
    return successResponse(res, null, 'Appliance deleted successfully');
  } catch (error) {
    next(error);
  }
};
// Reminders
const getReminders = async (req, res, next) => {
  try {
    const reminders = await prisma.serviceReminder.findMany({
      where: { userId: req.user.id },
      include: { appliance: true },
      orderBy: { dueDate: 'asc' }
    });
    return successResponse(res, reminders);
  } catch (error) {
    next(error);
  }
};
const createReminder = async (req, res, next) => {
  try {
    const { applianceId, serviceType, dueDate, frequencyMonths, notes } = req.body;
    const reminder = await prisma.serviceReminder.create({
      data: {
        userId: req.user.id,
        applianceId: applianceId || null,
        serviceType,
        dueDate: new Date(dueDate),
        frequencyMonths: frequencyMonths ? parseInt(frequencyMonths, 10) : 6,
        notes
      },
      include: { appliance: true }
    });
    return createdResponse(res, reminder, 'Service reminder scheduled successfully');
  } catch (error) {
    next(error);
  }
};
const updateReminderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, lastServicedAt, nextDueDate } = req.body;
    const existing = await prisma.serviceReminder.findFirst({
      where: { id, userId: req.user.id }
    });
    if (!existing) {
      return errorResponse(res, 'Reminder not found or access denied', 404);
    }
    const data = {
      status,
      lastServicedAt: lastServicedAt ? new Date(lastServicedAt) : undefined,
      nextDueDate: nextDueDate ? new Date(nextDueDate) : undefined
    };
    const updated = await prisma.serviceReminder.update({
      where: { id },
      data,
      include: { appliance: true }
    });
    return successResponse(res, updated, 'Reminder status updated successfully');
  } catch (error) {
    next(error);
  }
};
const deleteReminder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.serviceReminder.findFirst({
      where: { id, userId: req.user.id }
    });
    if (!existing) {
      return errorResponse(res, 'Reminder not found or access denied', 404);
    }
    await prisma.serviceReminder.delete({ where: { id } });
    return successResponse(res, null, 'Reminder deleted successfully');
  } catch (error) {
    next(error);
  }
};
module.exports = {
  getMyAppliances,
  getApplianceById,
  createAppliance,
  updateAppliance,
  deleteAppliance,
  getReminders,
  createReminder,
  updateReminderStatus,
  deleteReminder
};