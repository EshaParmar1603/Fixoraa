const bookingService = require('../services/bookingService');
const { BOOKING_STATUS } = require('../utils/constants');
const { successResponse, createdResponse, paginatedResponse, errorResponse } = require('../utils/response');
const createBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.createBooking(req.user.id, req.body);
    return createdResponse(res, booking, 'Booking created successfully');
  } catch (error) {
    next(error);
  }



};
const getMyBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    if (req.user.role === 'PROVIDER') {
      const profile = req.user.providerProfile;
      if (!profile) {
        return errorResponse(res, 'Provider profile not configured', 400);
      }
      const { bookings, total } = await bookingService.getProviderBookings(profile.id, { page, limit, status });
      return paginatedResponse(res, bookings, page, limit, total);
    } else {
      const { bookings, total } = await bookingService.getCustomerBookings(req.user.id, { page, limit, status });
      return paginatedResponse(res, bookings, page, limit, total);
    }
  } catch (error) {
    next(error);
  }
};
const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    if (!status) {
      return errorResponse(res, 'Status is required', 400);
    }
    const updated = await bookingService.updateBookingStatus(id, status, req.user.id, notes);
    return successResponse(res, updated, `Booking status updated to ${status}`);
  } catch (error) {
    next(error);
  }
};
const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const updated = await bookingService.updateBookingStatus(
      id,
      BOOKING_STATUS.CANCELLED,
      req.user.id,
      reason || 'Cancelled by user'
    );
    return successResponse(res, updated, 'Booking cancelled successfully');
  } catch (error) {
    next(error);
  }
};
module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  updateStatus,
  cancelBooking
};
