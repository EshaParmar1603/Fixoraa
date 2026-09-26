const prisma = require('../config/db');
const { successResponse, createdResponse, errorResponse } = require('../utils/response');
const getMyDocuments = async (req, res, next) => {
  try {
    const { documentType, applianceId } = req.query;
    const where = { userId: req.user.id };
    if (documentType) {
      where.documentType = documentType;
    }
    if (applianceId) {
      where.applianceId = applianceId;
    }
    const documents = await prisma.billWarranty.findMany({
      where,
      include: { appliance: true },
      orderBy: { createdAt: 'desc' }
    });
    return successResponse(res, documents);
  } catch (error) {
    next(error);
  }
};
const getDocumentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const document = await prisma.billWarranty.findFirst({
      where: { id, userId: req.user.id },
      include: { appliance: true }
    });
    if (!document) {
      return errorResponse(res, 'Document not found', 404);
    }
        return successResponse(res, document);
  } catch (error) {
    next(error);
  }
};
const createDocument = async (req, res, next) => {
  try {
    const {
      title,
      documentType,
      documentUrl,
      fileType,
       vendor,
      amount,
      purchaseDate,
      expiryDate,
      notes,
      applianceId
    } = req.body;
    const document = await prisma.billWarranty.create({
      data: {
        userId: req.user.id,
        applianceId: applianceId || null,
        title,
        documentType: documentType || 'WARRANTY',
        documentUrl,
        fileType,
        fileSize: fileSize ? parseInt(fileSize, 10) : null,
        vendor,
        amount: amount ? parseFloat(amount) : null,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        notes
      },
      include: { appliance: true }
    });
    return createdResponse(res, document, 'Document uploaded and registered successfully');
  } catch (error) {
    next(error);
  }
};
const updateDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      documentType,
      documentUrl,
      fileType,
      fileSize,
      vendor,
      amount,
      purchaseDate,
      expiryDate,
      notes,
      applianceId
    } = req.body;
    const existing = await prisma.billWarranty.findFirst({
      where: { id, userId: req.user.id }
    });
    if (!existing) {
      return errorResponse(res, 'Document not found or access denied', 404);
    }
    const updated = await prisma.billWarranty.update({
      where: { id },
      data: {
        title,
        documentType,
        documentUrl,
        fileType,
        fileSize: fileSize ? parseInt(fileSize, 10) : undefined,
        vendor,
        amount: amount !== undefined ? parseFloat(amount) : undefined,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
 applianceId: applianceId !== undefined ? applianceId : undefined
      },
      include: { appliance: true }
    });
    return successResponse(res, updated, 'Document updated successfully');
  } catch (error) {
    next(error);
  }
};
const deleteDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.billWarranty.findFirst({
      where: { id, userId: req.user.id }
    });
    if (!existing) {
      return errorResponse(res, 'Document not found or access denied', 404);
    }
    await prisma.billWarranty.delete({ where: { id } });
    return successResponse(res, null, 'Document deleted successfully');
  } catch (error) {
    next(error);
  }
};
module.exports = {
  getMyDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument
};
