import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Calendar,
  CreditCard,
  Star,
  CheckCircle2,
  X,
  AlertCircle,
  QrCode,
  DollarSign
} from 'lucide-react';
import { bookingsApi, paymentsApi, reviewsApi } from '../../services/api';
import { Booking, BookingStatus } from '../../types';
import { BookingCard } from '../../components/cards/BookingCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

export const MyBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [paymentModalBooking, setPaymentModalBooking] = useState<Booking | null>(null);
  const [reviewModalBooking, setReviewModalBooking] = useState<Booking | null>(null);

  // Payment form state
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'UPI' | 'NETBANKING' | 'CASH'>('CARD');
  const [processingPayment, setProcessingPayment] = useState(false);

  // Review form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Notification banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const location = useLocation();

  useEffect(() => {
    if ((location.state as any)?.bookingSuccess) {
      setToastMessage('Your booking has been placed successfully! The technician has been notified.');
    }
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await bookingsApi.getMyBookings();
      setBookings(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await bookingsApi.cancelBooking(bookingId, 'Cancelled by customer');
        setToastMessage('Booking cancelled.');
        fetchBookings();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleProcessPayment = async () => {
    if (!paymentModalBooking) return;
    try {
      setProcessingPayment(true);
      await paymentsApi.processPayment({
        bookingId: paymentModalBooking.id,
        amount: paymentModalBooking.totalPrice,
        method: paymentMethod,
      });
      setToastMessage('Payment completed successfully! Digital receipt generated.');
      setPaymentModalBooking(null);
      fetchBookings();
    } catch (err: any) {
      alert(err.message || 'Payment processing failed');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalBooking) return;
    try {
      setSubmittingReview(true);
      await reviewsApi.createReview({
        bookingId: reviewModalBooking.id,
        rating,
        comment,
      });
      setToastMessage('Thank you! Your verified technician review has been published.');
      setReviewModalBooking(null);
      fetchBookings();
    } catch (err: any) {
      alert(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const tabs: { label: string; value: string }[] = [
    { label: 'All Bookings', value: 'ALL' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Confirmed', value: 'CONFIRMED' },
    { label: 'In Progress', value: 'IN_PROGRESS' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  const filteredBookings = bookings.filter((b) => {
    if (selectedTab === 'ALL') return true;
    return b.status === selectedTab;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold rounded-2xl flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          My Service Bookings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Monitor your technician appointments, process mock payments, and share feedback
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setSelectedTab(tab.value)}
            className={`py-2 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedTab === tab.value
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <LoadingSpinner message="Retrieving your bookings and technician statuses..." />
      ) : filteredBookings.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No bookings found"
          description={`There are currently no bookings with status "${selectedTab.toLowerCase()}".`}
        />
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              onPayNow={(booking) => setPaymentModalBooking(booking)}
              onWriteReview={(booking) => setReviewModalBooking(booking)}
              onCancel={(id) => handleCancelBooking(id)}
            />
          ))}
        </div>
      )}

      {/* ==================================================== */}
      {/* MOCK PAYMENT MODAL */}
      {/* ==================================================== */}
      {paymentModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-brand-600" />
                <span>Fixora Secure Checkout</span>
              </h3>
              <button
                onClick={() => setPaymentModalBooking(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 block">
                Order #{paymentModalBooking.bookingNumber}
              </span>
              <p className="text-sm font-bold text-slate-900">{paymentModalBooking.service?.name}</p>
              <div className="flex items-baseline justify-between pt-2">
                <span className="text-xs text-slate-500 font-medium">Total Payable</span>
                <span className="text-2xl font-black text-brand-600">
                  ₹{paymentModalBooking.totalPrice.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Select Payment Method</label>
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CARD')}
                  className={`p-3 rounded-xl border flex items-center space-x-2 transition-all ${
                    paymentMethod === 'CARD'
                      ? 'border-brand-600 bg-brand-50 text-brand-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Debit / Credit Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-3 rounded-xl border flex items-center space-x-2 transition-all ${
                    paymentMethod === 'UPI'
                      ? 'border-brand-600 bg-brand-50 text-brand-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>Instant UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('NETBANKING')}
                  className={`p-3 rounded-xl border flex items-center space-x-2 transition-all ${
                    paymentMethod === 'NETBANKING'
                      ? 'border-brand-600 bg-brand-50 text-brand-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Netbanking</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`p-3 rounded-xl border flex items-center space-x-2 transition-all ${
                    paymentMethod === 'CASH'
                      ? 'border-brand-600 bg-brand-50 text-brand-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Cash on Service</span>
                </button>
              </div>
            </div>

            {paymentMethod === 'CARD' && (
              <div className="space-y-3 text-xs">
                <input
                  type="text"
                  readOnly
                  value="•••• •••• •••• 4242"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 font-mono"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    readOnly
                    value="12/28"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 font-mono"
                  />
                  <input
                    type="text"
                    readOnly
                    value="CVC: 888"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 font-mono"
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleProcessPayment}
              disabled={processingPayment}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg transition-all text-sm disabled:opacity-50"
            >
              {processingPayment
                ? 'Authorizing Mock Transaction...'
                : `Authorize & Pay ₹${paymentModalBooking.totalPrice.toLocaleString('en-IN')}`}
            </button>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* REVIEW SUBMISSION MODAL */}
      {/* ==================================================== */}
      {reviewModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <span>Write Customer Review</span>
              </h3>
              <button
                onClick={() => setReviewModalBooking(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <p className="text-xs text-slate-500">How was your service experience with</p>
                <p className="text-sm font-bold text-slate-900">
                  {reviewModalBooking.provider?.user?.name || 'Assigned Technician'} for{' '}
                  {reviewModalBooking.service?.name}?
                </p>
              </div>

              {/* Star Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Overall Rating</label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 text-amber-400 hover:scale-125 transition-transform"
                    >
                      <Star
                        className={`w-7 h-7 ${star <= rating ? 'fill-amber-400' : 'text-slate-200'}`}
                      />
                    </button>
                  ))}
                  <span className="text-sm font-bold text-slate-800 ml-2">{rating} of 5 Stars</span>
                </div>
              </div>

              {/* Comment text */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Your Detailed Review
                </label>
                <textarea
                  rows={3}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Did the technician arrive on time? Was the appliance tested before leaving? Did they clean up the work area?..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-600"
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl shadow-md transition-all text-sm disabled:opacity-50"
              >
                {submittingReview ? 'Submitting Review...' : 'Publish Verified Review'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
