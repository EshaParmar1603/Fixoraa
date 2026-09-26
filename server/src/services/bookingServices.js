const prisma = require('../config/db');
const { BOOKING_STATUS } = require('../utils/constants');
const notificationService = require('./notificationService');
const { emitToUser } = require('../sockets/socketHandler');
class BookingService {
  generateBookingNumber() {
    const random = Math.floor(100000 + Math.random() * 900000);
    return `FIX-${random}`;
  }
  async createBooking(customerId, bookingData) {
    const { serviceId, providerId, scheduledAt, address, city, notes } = bookingData;
const service = await prisma.service.findUnique({
      where: { id: serviceId }
    });
    if (!service || !service.isActive) {
      const err = new Error('Selected service is not available.');
      err.statusCode = 404;
      throw err;
    }
    let provider = null;
    let totalPrice = service.basePrice;
    if (providerId) {
      provider = await prisma.providerProfile.findUnique({
        where: { id: providerId },
        include: { user: true, services: true }
      });
      if (!provider || !provider.isAvailable) {
        const err = new Error('Selected service provider is currently unavailable.');
        err.statusCode = 400;
        throw err;
      }
      // Check for custom price
      const providerCustomService = provider.services.find(s => s.serviceId === serviceId);
      if (providerCustomService && providerCustomService.customPrice) {
        totalPrice = providerCustomService.customPrice;
      }
    }
    const bookingNumber = this.generateBookingNumber();
    const booking = await prisma.$transaction(async (tx) => {
      const createdBooking = await tx.booking.create({
        data: {
          bookingNumber,
          customerId,
          providerId: provider ? provider.id : null,
          serviceId,
          scheduledAt: new Date(scheduledAt),
          address,
          city: city || null,
          notes: notes || null,
          totalPrice,
          status: BOOKING_STATUS.PENDING
        },
        include: {
          customer: { select: { id: true, name: true, email: true, phone: true } },
          service: true,
          provider: { include: { user: { select: { id: true, name: true, phone: true, avatar: true } } } }
        }
      });
      await tx.bookingStatusHistory.create({
        data: {
          bookingId: createdBooking.id,
          status: BOOKING_STATUS.PENDING,
          changedBy: customerId,
          notes: 'Booking created by customer.'
        }
      });
      // Automatically create a conversation between customer and provider if provider is assigned
      if (provider) {
        await tx.conversation.upsert({
          where: {
            customerId_providerId_bookingId: {
              customerId,
              providerId: provider.userId,
              bookingId: createdBooking.id
            }
          },
          update: {},
          create: {
            customerId,
            providerId: provider.userId,
            bookingId: createdBooking.id
          }
        });
      }
      return createdBooking;
    });
    // Notify Customer
    await notificationService.createNotification({
      userId: customerId,
      title: 'Booking Placed',
      message: `Your booking #${booking.bookingNumber} for ${service.name} has been placed.`,
      type: 'BOOKING',
      referenceId: booking.id,
      link: `/bookings/${booking.id}`
    });
    // Notify Provider if assigned
    if (provider) {
      await notificationService.createNotification({
        userId: provider.userId,
        title: 'New Service Request',
        message: `You received a new booking request #${booking.bookingNumber} for ${service.name}.`,
        type: 'BOOKING',
        referenceId: booking.id,
        link: `/provider/bookings/${booking.id}`
      });
      emitToUser(provider.userId, 'new_booking_request', booking);
    }
    return booking;
  }
  async updateBookingStatus(bookingId, newStatus, changedByUserId, notes) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
        include: {
        customer: true,
        service: true,
        provider: { include: { user: true } }
      }
    });
    if (!booking) {
      const err = new Error('Booking not found.');
      err.statusCode = 404;
      throw err;
    }
    if (!Object.values(BOOKING_STATUS).includes(newStatus)) {
      const err = new Error(`Invalid status: ${newStatus}`);
      err.statusCode = 400;
      throw err;
    }
        const updated = await prisma.$transaction(async (tx) => {
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: newStatus,
          ...(newStatus === BOOKING_STATUS.COMPLETED && booking.paymentStatus === 'PAID' ? {} : {})
        },
        include: {
          customer: { select: { id: true, name: true, email: true, phone: true } },
          service: true,
          provider: { include: { user: { select: { id: true, name: true, phone: true, avatar: true } } } }
        }
      });
      await tx.bookingStatusHistory.create({
        data: {
          bookingId,
          status: newStatus,
          changedBy: changedByUserId,
          notes: notes || `Status changed to ${newStatus}`
        }
      });
      return updatedBooking;
    });
 emitToUser(booking.customerId, 'booking_status_updated', {
      bookingId,
      status: newStatus,
      booking: updated
    });
    if (booking.provider?.userId) {
      emitToUser(booking.provider.userId, 'booking_status_updated', {
        bookingId,
        status: newStatus,
        booking: updated
      });
    }
    // Notifications
    await notificationService.createNotification({
      userId: booking.customerId,
      title: `Booking ${newStatus}`,
      message: `Booking #${booking.bookingNumber} status is now: ${newStatus}.`,
      type: 'BOOKING',
      referenceId: bookingId,
      link: `/bookings/${bookingId}`
    });
    if (booking.provider?.userId && booking.provider.userId !== booking.customerId) {
      await notificationService.createNotification({
        userId: booking.provider.userId,
        title: `Booking ${newStatus}`,
        message: `Booking #${booking.bookingNumber} status is now: ${newStatus}.`,
        type: 'BOOKING',
        referenceId: bookingId,
        link: `/provider/bookings/${bookingId}`
      });
    }
    return updated;
  }
  async getCustomerBookings(customerId, { page = 1, limit = 10, status }) {
    const skip = (page - 1) * limit;
    const where = { customerId };
    if (status) where.status = status;
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { scheduledAt: 'desc' },
        include: {
          service: true,
          provider: { include: { user: { select: { id: true, name: true, avatar: true, phone: true } } } },
          review: true,
          payment: true,
          statusHistory: { orderBy: { createdAt: 'desc' } }
        }
      }),
      prisma.booking.count({ where })
    ]);
    return { bookings, total };
  }
  async getProviderBookings(providerProfileId, { page = 1, limit = 10, status }) {
    const skip = (page - 1) * limit;
    const where = { providerId: providerProfileId };
    if (status) where.status = status;
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { scheduledAt: 'desc' },
        include: {
          customer: { select: { id: true, name: true, phone: true, avatar: true, address: true, city: true } },
          service: true,
          review: true,
          payment: true,
          statusHistory: { orderBy: { createdAt: 'desc' } }
        }
      }),
      prisma.booking.count({ where })
    ]);
    return { bookings, total };
  }
   async getBookingById(bookingId, requestingUser) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true, avatar: true, address: true, city: true } },
        provider: { include: { user: { select: { id: true, name: true, email: true, phone: true, avatar: true } } } },
        service: { include: { category: true } },
        review: true,
        payment: true,
        statusHistory: { orderBy: { createdAt: 'desc' } },
        conversation: true
      }
    });
    if (!booking) {
      const err = new Error('Booking not found.');
      err.statusCode = 404;
      throw err;
    }
        if (requestingUser.role === 'CUSTOMER' && booking.customerId !== requestingUser.id) {
      const err = new Error('You do not have permission to view this booking.');
      err.statusCode = 403;
      throw err;
    }
    if (requestingUser.role === 'PROVIDER' && booking.provider?.userId !== requestingUser.id) {
      const err = new Error('You do not have permission to view this booking.');
      err.statusCode = 403;
      throw err;
    }
    return booking;
  }
}
module.exports = new BookingService();

