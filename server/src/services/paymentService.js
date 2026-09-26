const prisma = require('../config/db');
const { PAYMENT_STATUS } = require('../utils/constants');
const notificationService = require('./notificationService');
const { emitToUser } = require('../sockets/socketHandler');
class PaymentService {
  generateTransactionId() {
    return 'TXN_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  async processMockPayment(customerId, { bookingId, amount, method = 'CARD', currency = 'INR' }) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: true,
        provider: { include: { user: true } },
        service: true
      }
    });
 if (!booking) {
      const err = new Error('Booking not found.');
      err.statusCode = 404;
      throw err;
    }
    if (booking.customerId !== customerId) {
      const err = new Error('Unauthorized to pay for this booking.');
      err.statusCode = 403;
      throw err;
    }
    if (booking.paymentStatus === PAYMENT_STATUS.PAID) {
      const err = new Error('This booking is already paid.');
      err.statusCode = 400;
      throw err;
    }
    const transactionId = this.generateTransactionId();
    const mockReceipt = `https://fixora.local/receipts/${transactionId}.pdf`;
    const payment = await prisma.$transaction(async (tx) => {
      // 1. Create or update payment
      const newPayment = await tx.payment.upsert({
        where: { bookingId },
        update: {
          amount: parseFloat(amount) || booking.totalPrice,
          currency,
          method,
          status: PAYMENT_STATUS.PAID,
          transactionId,
          mockReceiptUrl: mockReceipt,
          paidAt: new Date()
        },
        create: {
          bookingId,
          customerId,
          amount: parseFloat(amount) || booking.totalPrice,
          currency,
          method,
          status: PAYMENT_STATUS.PAID,
          transactionId,
          mockReceiptUrl: mockReceipt,
          paidAt: new Date()
        }
      });

            return newPayment;
    });
    // Notify Customer
    await notificationService.createNotification({
      userId: customerId,
      title: 'Payment Successful',
      message: `Your payment of ${currency} ${payment.amount} for booking #${booking.bookingNumber} was successful.`,
      type: 'PAYMENT',
      referenceId: payment.id,
      link: `/bookings/${bookingId}`
    });
    // Notify Provider if assigned
    if (booking.provider?.userId) {
      await notificationService.createNotification({
        userId: booking.provider.userId,
        title: 'Payment Received',
        message: `Payment of ${currency} ${payment.amount} received for booking #${booking.bookingNumber}.`,
        type: 'PAYMENT',
        referenceId: payment.id,
        link: `/provider/bookings/${bookingId}`
      });
      emitToUser(booking.provider.userId, 'payment_received', { bookingId, payment });
    }
    return payment;
  }
 async getPaymentByBooking(bookingId, userId, userRole) {
    const payment = await prisma.payment.findUnique({
      where: { bookingId },
      include: {
        booking: {
          include: {
            customer: { select: { id: true, name: true, email: true } },
            service: true
          }
        }
      }
    });
    if (!payment) {
      const err = new Error('No payment record found for this booking.');
      err.statusCode = 404;
      throw err;
    }

        if (userRole !== 'ADMIN' && payment.customerId !== userId) {
      const err = new Error('Access denied to view this payment.');
      err.statusCode = 403;
      throw err;
    }
    return payment;
  }
}
module.exports = new PaymentService();