import React, { useState, useEffect } from 'react';
import {
  Calendar,
  CheckCircle,
  Play,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Search,
  MessageSquare
} from 'lucide-react';
import { bookingsApi } from '../../services/api';
import { Booking, BookingStatus } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { useNavigate } from 'react-router-dom';

export const ProviderBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
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

  const handleUpdateStatus = async (bookingId: string, status: BookingStatus) => {
    try {
      await bookingsApi.updateStatus(bookingId, status);
      fetchBookings();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = bookings.filter((b) => {
    if (selectedStatus !== 'ALL' && b.status !== selectedStatus) return false;
    if (searchTerm) {
      const matchNum = b.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCust = b.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchServ = b.service?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchNum || matchCust || matchServ;
    }
    return true;
  });

  if (loading) {
    return <LoadingSpinner message="Loading technician work orders..." fullScreen />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Technician Job Pipeline
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Track and advance assigned repair appointments: Confirm → Start Work → Complete
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by order #, customer, or service..."
            className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-600"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['ALL', 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedStatus === st
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Queue */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No jobs found"
          description="There are currently no assigned appointments matching this filter."
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <span className="text-xs font-bold text-brand-600 tracking-wider">
                    ORDER #{b.bookingNumber}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">{b.service?.name}</h3>
                </div>

                <div className="flex items-center space-x-2">
                  <StatusBadge status={b.status} />
                  <StatusBadge status={b.paymentStatus} size="sm" />
                </div>
              </div>

              {/* Customer and Schedule Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Customer</span>
                  <p className="font-bold text-slate-900">{b.customer?.name || 'Customer'}</p>
                  <p className="flex items-center text-slate-500">
                    <Phone className="w-3.5 h-3.5 mr-1" />
                    {b.customer?.phone || '+1 (555) 000-0000'}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Service Location</span>
                  <p className="font-semibold text-slate-900 flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
                    {b.address}
                  </p>
                  <p className="text-slate-500 pl-4.5">{b.city || 'Standard Area'}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Appointment Time</span>
                  <p className="font-semibold text-slate-900 flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {new Date(b.scheduledAt).toLocaleDateString()}
                  </p>
                  <p className="text-slate-500 pl-4.5">
                    {new Date(b.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {b.notes && (
                <div className="p-3 bg-slate-50 rounded-2xl text-xs text-slate-600">
                  <span className="font-bold text-slate-700">Access Instructions: </span>
                  {b.notes}
                </div>
              )}

              {/* Pipeline Progression Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-400">Total Payout:</span>
                  <span className="text-base font-extrabold text-slate-900">
                    ₹{b.totalPrice.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => navigate('/chat')}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center space-x-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Chat Customer</span>
                  </button>

                  {/* Stage 1: PENDING -> CONFIRMED */}
                  {b.status === 'PENDING' && (
                    <button
                      onClick={() => handleUpdateStatus(b.id, 'CONFIRMED')}
                      className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center space-x-1.5"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Confirm & Accept</span>
                    </button>
                  )}

                  {/* Stage 2: CONFIRMED -> IN_PROGRESS */}
                  {b.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleUpdateStatus(b.id, 'IN_PROGRESS')}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center space-x-1.5"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Start On-Site Work</span>
                    </button>
                  )}

                  {/* Stage 3: IN_PROGRESS -> COMPLETED */}
                  {b.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => handleUpdateStatus(b.id, 'COMPLETED')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center space-x-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Work Completed</span>
                    </button>
                  )}

                  {b.status === 'COMPLETED' && (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center space-x-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Job Finished</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
