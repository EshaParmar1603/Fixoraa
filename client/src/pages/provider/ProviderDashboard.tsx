import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Star,
  DollarSign,
  ShieldCheck,
  CheckCircle,
  Play,
  CheckCircle2,
  TrendingUp,
  MapPin,
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { bookingsApi, providersApi } from '../../services/api';
import { Booking, BookingStatus, ProviderProfile } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const ProviderDashboard: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [provs, myBookings] = await Promise.all([
        providersApi.getProviders(),
        bookingsApi.getMyBookings()
      ]);
      const currentProfile = provs?.find((p) => p.userId === user?.id) || provs?.[0];
      if (currentProfile) {
        setProfile(currentProfile);
        setIsAvailable(currentProfile.isAvailable);
      }
      setBookings(myBookings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId: string, status: BookingStatus) => {
    await bookingsApi.updateStatus(bookingId, status);
    fetchDashboardData();
  };

  const pendingBookings = bookings.filter((b) => b.status === 'PENDING');
  const activeBookings = bookings.filter((b) => ['CONFIRMED', 'IN_PROGRESS'].includes(b.status));
  const completedBookings = bookings.filter((b) => b.status === 'COMPLETED');
  const totalEarnings = completedBookings.reduce((sum, b) => sum + (b.totalPrice || 49.99), 0);

  if (loading) {
    return <LoadingSpinner message="Loading technician operations dashboard..." fullScreen />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Profile & Availability Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <img
            src={
              profile?.user?.avatar ||
              user?.avatar ||
              'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150'
            }
            alt="Provider Avatar"
            className="w-16 h-16 rounded-2xl object-cover ring-4 ring-brand-50"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                {profile?.user?.name || user?.name || 'Alex Vance (Technician)'}
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                Verified Pro
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-lg">
              {profile?.bio || 'EPA-certified HVAC & refrigeration master repair specialist.'}
            </p>
          </div>
        </div>

        {/* Availability Toggle */}
        <div className="flex items-center space-x-4 bg-slate-50 p-3 rounded-2xl border border-slate-200/60 self-start md:self-auto">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Job Dispatching</span>
            <span className={`text-xs font-bold ${isAvailable ? 'text-emerald-600' : 'text-slate-500'}`}>
              {isAvailable ? 'Online (Accepting Jobs)' : 'Offline (Busy)'}
            </span>
          </div>
          <button
            onClick={() => setIsAvailable(!isAvailable)}
            className={`w-12 h-7 flex items-center rounded-full p-1 transition-colors ${
              isAvailable ? 'bg-emerald-500' : 'bg-slate-300'
            }`}
          >
            <div
              className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                isAvailable ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Completed Jobs</span>
          <span className="text-2xl sm:text-3xl font-black text-slate-900">{completedBookings.length}</span>
          <span className="text-[11px] text-emerald-600 font-semibold block flex items-center">
            <TrendingUp className="w-3.5 h-3.5 mr-1" /> 100% On-time completion
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Active Pipeline</span>
          <span className="text-2xl sm:text-3xl font-black text-brand-600">{activeBookings.length}</span>
          <span className="text-[11px] text-slate-500 block">In progress or confirmed</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Estimated Payout</span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-600">₹{totalEarnings.toLocaleString('en-IN')}</span>
          <span className="text-[11px] text-slate-500 block">Direct bank deposit</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Quality Rating</span>
          <div className="flex items-center space-x-1.5">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {profile?.rating?.toFixed(1) || '4.9'}
            </span>
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
          </div>
          <span className="text-[11px] text-slate-500 block">From {profile?.reviewCount || 124} reviews</span>
        </div>
      </div>

      {/* INCOMING REQUESTS ACTION QUEUE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-600 animate-ping"></span>
            <span>Incoming Customer Booking Requests ({pendingBookings.length})</span>
          </h2>
          <Link
            to="/provider/bookings"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
          >
            <span>View All Jobs</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {pendingBookings.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="text-sm font-bold text-slate-800">You're all caught up!</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No new unconfirmed requests. You will receive real-time push alerts via Socket.IO whenever a homeowner books your services.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingBookings.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-600 tracking-wider">
                    #{b.bookingNumber}
                  </span>
                  <StatusBadge status={b.status} size="sm" />
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-base">{b.service?.name}</h3>
                  <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(b.scheduledAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="line-clamp-1">{b.address}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-base font-extrabold text-slate-900">
                    ₹{b.totalPrice.toLocaleString('en-IN')}
                  </span>
                  <button
                    onClick={() => handleStatusChange(b.id, 'CONFIRMED')}
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center space-x-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Accept & Confirm Job</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QUICK OPERATING LINKS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <Link
          to="/provider/bookings"
          className="p-6 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl hover:shadow-lg transition-all flex items-center justify-between group"
        >
          <div>
            <h3 className="font-bold text-lg">Job Progression Manager</h3>
            <p className="text-xs text-slate-300 mt-1">Confirm appointments, trigger live job start, and complete tasks.</p>
          </div>
          <ArrowRight className="w-5 h-5 text-brand-400 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          to="/provider/availability"
          className="p-6 bg-gradient-to-r from-brand-900 to-slate-900 text-white rounded-3xl hover:shadow-lg transition-all flex items-center justify-between group"
        >
          <div>
            <h3 className="font-bold text-lg">Weekly Operating Schedule</h3>
            <p className="text-xs text-slate-300 mt-1">Configure your Monday–Sunday operating hours and break windows.</p>
          </div>
          <ArrowRight className="w-5 h-5 text-brand-400 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
