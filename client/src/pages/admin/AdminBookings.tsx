import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Search,
  CheckCircle,
  Clock,
  DollarSign,
  MapPin,
  User,
  CreditCard,
  X
} from 'lucide-react';
import { adminApi, bookingsApi } from '../../services/api';
import { Booking, BookingStatus } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const AdminBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAllBookings();
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
      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking((prev) => (prev ? { ...prev, status } : null));
      }
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
    return <LoadingSpinner message="Loading global booking registry..." fullScreen />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
          <Calendar className="w-8 h-8 text-brand-600" />
          <span>Global Order Oversight</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Complete cross-category visibility into all customer bookings, technician assignments, and transaction states
        </p>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by order #, customer, service..."
            className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-600"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['ALL', 'PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((st) => (
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

      {/* Global Bookings Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold uppercase tracking-wider">Order Code</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider">Service</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider">Technician</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 font-bold uppercase tracking-wider text-right">Inspection</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-brand-600">{b.bookingNumber}</td>
                  <td className="px-6 py-4 font-semibold text-slate-800">{b.customer?.name || 'Customer'}</td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{b.service?.name}</td>
                  <td className="px-6 py-4 text-slate-600">{b.provider?.user?.name || 'Unassigned'}</td>
                  <td className="px-6 py-4 font-black text-slate-900">₹{b.totalPrice?.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-1.5">
                      <StatusBadge status={b.status} size="sm" />
                      <StatusBadge status={b.paymentStatus} size="sm" />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedBooking(b)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 font-bold text-slate-700 transition-colors"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* INSPECT ORDER MODAL */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-brand-600 tracking-wider">
                  #{selectedBooking.bookingNumber}
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedBooking.service?.name}
                </h3>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400">Scheduled Date:</span>
                <span className="font-semibold text-slate-800">
                  {new Date(selectedBooking.scheduledAt).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400">Customer Name & Phone:</span>
                <span className="font-semibold text-slate-800">
                  {selectedBooking.customer?.name} ({selectedBooking.customer?.phone || 'No phone'})
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400">Service Location:</span>
                <span className="font-semibold text-slate-800">{selectedBooking.address}</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400">Assigned Technician:</span>
                <span className="font-semibold text-slate-800">
                  {selectedBooking.provider?.user?.name || 'Unassigned'}
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-400">Payment Status:</span>
                <StatusBadge status={selectedBooking.paymentStatus} size="sm" />
              </div>
            </div>

            {/* Admin Override Controls */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <label className="block text-xs font-bold text-slate-700">Admin Status Override:</label>
              <div className="flex flex-wrap gap-2 text-xs">
                {(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as BookingStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdateStatus(selectedBooking.id, st)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                      selectedBooking.status === st
                        ? 'bg-slate-900 text-white'
                        : 'border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
