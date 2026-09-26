import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  MessageSquare,
  XCircle,
  CheckCircle,
  Play,
  Star,
  UserCheck
} from 'lucide-react';
import { Booking, BookingStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { useAuth } from '../../context/AuthContext';

interface BookingCardProps {
  booking: Booking;
  onPayNow?: (booking: Booking) => void;
  onWriteReview?: (booking: Booking) => void;
  onCancel?: (bookingId: string) => void;
  onStatusUpdate?: (bookingId: string, status: BookingStatus) => void;
}

export const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onPayNow,
  onWriteReview,
  onCancel,
  onStatusUpdate,
}) => {
  const { isCustomer, isProvider, isAdmin } = useAuth();
  const navigate = useNavigate();

  const formattedDate = new Date(booking.scheduledAt).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedTime = new Date(booking.scheduledAt).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all">
      {/* Top Bar: Booking Number & Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <span className="text-[11px] font-bold text-brand-600 tracking-wider uppercase block">
            {booking.bookingNumber}
          </span>
          <h4 className="text-base font-bold text-slate-900 mt-0.5">
            {booking.service?.name || 'Home Appliance Service'}
          </h4>
        </div>
        <div className="flex items-center space-x-2">
          <StatusBadge status={booking.status} />
          <StatusBadge status={booking.paymentStatus} size="sm" />
        </div>
      </div>

      {/* Middle Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 text-xs text-slate-600">
        {/* Schedule */}
        <div className="flex items-start space-x-2.5">
          <Calendar className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Scheduled For</span>
            <span className="font-semibold text-slate-800">{formattedDate}</span>
            <span className="block text-slate-500">{formattedTime}</span>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-start space-x-2.5">
          <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Service Address</span>
            <span className="font-semibold text-slate-800 line-clamp-1">{booking.address}</span>
            <span className="block text-slate-500">{booking.city || 'Standard Area'}</span>
          </div>
        </div>

        {/* Assigned Technician or Customer */}
        <div className="flex items-start space-x-2.5">
          <UserCheck className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">
              {isProvider ? 'Client' : 'Assigned Technician'}
            </span>
            <span className="font-semibold text-slate-800">
              {isProvider
                ? booking.customer?.name || 'Customer'
                : booking.provider?.user?.name || 'Certified Specialist'}
            </span>
            <span className="block text-slate-500">
              {isProvider
                ? booking.customer?.phone || 'Verified Customer'
                : 'Fixora Verified'}
            </span>
          </div>
        </div>
      </div>

      {/* Notes / Special Instructions if any */}
      {booking.notes && (
        <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600 mb-4">
          <span className="font-semibold text-slate-700">Special Notes: </span>
          {booking.notes}
        </div>
      )}

      {/* Bottom Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
        <div>
          <span className="text-[10px] text-slate-400 font-medium block">Total Amount</span>
          <span className="text-lg font-black text-slate-900">
            ₹{booking.totalPrice?.toLocaleString('en-IN') || '499'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Chat Button */}
          <button
            onClick={() => navigate('/chat')}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat</span>
          </button>

          {/* CUSTOMER ACTIONS */}
          {isCustomer && (
            <>
              {booking.paymentStatus === 'PENDING' && onPayNow && (
                <button
                  onClick={() => onPayNow(booking)}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Pay Now</span>
                </button>
              )}

              {booking.status === 'COMPLETED' && onWriteReview && (
                <button
                  onClick={() => onWriteReview(booking)}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm transition-all"
                >
                  <Star className="w-3.5 h-3.5 fill-white" />
                  <span>Write Review</span>
                </button>
              )}

              {['PENDING', 'CONFIRMED'].includes(booking.status) && onCancel && (
                <button
                  onClick={() => onCancel(booking.id)}
                  className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
              )}
            </>
          )}

          {/* PROVIDER WORKFLOW ACTIONS */}
          {(isProvider || isAdmin) && onStatusUpdate && (
            <>
              {booking.status === 'PENDING' && (
                <button
                  onClick={() => onStatusUpdate(booking.id, 'CONFIRMED')}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-sm transition-all"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Confirm Job</span>
                </button>
              )}

              {booking.status === 'CONFIRMED' && (
                <button
                  onClick={() => onStatusUpdate(booking.id, 'IN_PROGRESS')}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Start Work</span>
                </button>
              )}

              {booking.status === 'IN_PROGRESS' && (
                <button
                  onClick={() => onStatusUpdate(booking.id, 'COMPLETED')}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Mark Completed</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
