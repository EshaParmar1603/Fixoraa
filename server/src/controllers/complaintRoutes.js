const prisma = require('../config/db');
const { COMPLAINT_STATUS } = require('../utils/constants');
const { successResponse, createdResponse, paginatedResponse, errorResponse } = require('../utils/response');
const notificationService = require('../services/notificationService');
const generateTicketNumber = () => {
  const timestamp = Date.now().toString().slice(-6);
  return `CMP-${timestamp}`;
};
const createComplaint = async (req, res, next) => {
  try {
    const { providerId, bookingId, subject, description, priority } = req.body;
    const ticketNumber = generateTicketNumber();
    const complaint = await prisma.complaint.create({
      data: {
        ticketNumber,
        customerId: req.user.id,
        providerId: providerId || null,
        bookingId: bookingId || null,
        subject,
        description,
        priority: priority || 'MEDIUM',
        status: COMPLAINT_STATUS.OPEN
      },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        provider: { select: { id: true, name: true, email: true } },
        booking: { select: { id: true, bookingNumber: true } }
      }
    });
    await notificationService.createNotification({
      userId: req.user.id,
      title: `Complaint #${complaint.ticketNumber} Received`,
      message: 'Your complaint has been submitted and is being reviewed.',
      type: 'SYSTEM',
      referenceId: complaint.id,
      link: `/complaints/${complaint.id}`
    });
    return createdResponse(res, complaint, 'Complaint submitted successfully');
  } catch (error) {
    next(error);
  }
};
const getMyComplaints = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;
    const where = {};
    if (req.user.role === 'CUSTOMER') {
      where.customerId = req.user.id;
    } else if (req.user.role === 'PROVIDER') {
      where.providerId = req.user.id;
    }
    if (status) {
      where.status = status;
    }
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
const getComplaintById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const where = { id };
    if (req.user.role === 'CUSTOMER') {
      where.customerId = req.user.id;
    } else if (req.user.role === 'PROVIDER') {
      where.providerId = req.user.id;
    }
    const complaint = await prisma.complaint.findFirst({
      where,
      include: {
        customer: { select: { id: true, name: true, email: true } },
        provider: { select: { id: true, name: true, email: true } },
        booking: { select: { id: true, bookingNumber: true } }
      }
    });
    if (!complaint) {
      return errorResponse(res, 'Complaint not found', 404);
    }
    return successResponse(res, complaint);
  } catch (error) {
    next(error);
  }
};
const updateComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, resolutionNotes, priority } = req.body;
    const data = {};
    if (status) {
      data.status = status;
      if (status === COMPLAINT_STATUS.RESOLVED || status === COMPLAINT_STATUS.CLOSED) {
        data.resolvedAt = new Date();
      }
    }
    if (resolutionNotes) data.resolutionNotes = resolutionNotes;
    if (priority) data.priority = priority;
    const updated = await prisma.complaint.update({
      where: { id },
      data,
      include: {
        customer: { select: { id: true, name: true, email: true } }
      }
    });
    
    await notificationService.createNotification({
      userId: updated.customerId,
      title: `Complaint #${updated.ticketNumber} Update`,
      message: `Your complaint status has changed to: ${updated.status}`,
      type: 'SYSTEM',
      referenceId: updated.id,
      link: `/complaints/${updated.id}`
    });
    return successResponse(res, updated, 'Complaint updated successfully');
  } catch (error) {
    next(error);
  }
};
module.exports = {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  updateComplaint
};
