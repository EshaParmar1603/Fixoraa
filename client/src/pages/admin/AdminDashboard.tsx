import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  IndianRupee,
  Users,
  Calendar,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { adminApi } from '../../services/api';
import { AdminStats } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return <LoadingSpinner message="Calculating marketplace analytics & revenue totals..." fullScreen />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-700 mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Platform Administrator Oversight</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Marketplace Operations Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Real-time metrics on gross transaction volume, active jobs, dispute cases, and user verification
        </p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <IndianRupee className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Gross Marketplace Revenue
          </span>
          <span className="text-2xl sm:text-3xl font-black text-slate-900">
            ₹{stats.totalRevenue.toLocaleString('en-IN')}
          </span>
          <span className="text-xs text-emerald-600 font-semibold block flex items-center">
            <TrendingUp className="w-3.5 h-3.5 mr-1" /> +14.2% vs last month
          </span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Active Bookings
          </span>
          <span className="text-2xl sm:text-3xl font-black text-brand-600">
            {stats.activeBookings}
          </span>
          <span className="text-xs text-slate-500 block">
            {stats.totalBookings} cumulative all-time
          </span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Registered Users
          </span>
          <span className="text-2xl sm:text-3xl font-black text-slate-900">
            {stats.totalUsers}
          </span>
          <span className="text-xs text-slate-500 block">
            {stats.totalCustomers} Customers • {stats.totalProviders} Technicians
          </span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Open Disputes
          </span>
          <span className="text-2xl sm:text-3xl font-black text-rose-600">
            {stats.pendingComplaints}
          </span>
          <span className="text-xs text-slate-500 block">
            Requires admin resolution review
          </span>
        </div>
      </div>

      {/* RECENT BOOKINGS TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Recent Service Orders</h3>
            <p className="text-xs text-slate-500">Live order stream across all categories</p>
          </div>
          <Link
            to="/admin/bookings"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
          >
            <span>View All Bookings</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-bold">
                <th className="pb-3">Order #</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Service</th>
                <th className="pb-3">Technician</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.recentBookings?.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 font-mono font-bold text-brand-600">{b.bookingNumber}</td>
                  <td className="py-3.5 font-semibold text-slate-800">{b.customer?.name || 'Customer'}</td>
                  <td className="py-3.5 text-slate-600 font-medium">{b.service?.name}</td>
                  <td className="py-3.5 text-slate-600">{b.provider?.user?.name || 'Unassigned'}</td>
                  <td className="py-3.5 font-bold text-slate-900">₹{b.totalPrice?.toLocaleString('en-IN')}</td>
                  <td className="py-3.5"><StatusBadge status={b.status} size="sm" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADMIN NAVIGATION SHORTCUTS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/admin/users"
          className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all group flex items-center justify-between"
        >
          <div>
            <h4 className="font-bold text-slate-900 text-base group-hover:text-brand-600 transition-colors">
              User Permissions & Verification
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Verify technician licenses, modify roles, or deactivate fraudulent accounts.
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          to="/admin/bookings"
          className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all group flex items-center justify-between"
        >
          <div>
            <h4 className="font-bold text-slate-900 text-base group-hover:text-brand-600 transition-colors">
              Global Order Oversight
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Filter by status, search by booking code, view payments and cancellation reasons.
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          to="/admin/complaints"
          className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all group flex items-center justify-between"
        >
          <div>
            <h4 className="font-bold text-slate-900 text-base group-hover:text-brand-600 transition-colors">
              Dispute Investigation Desk
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Mediate customer tickets, add formal resolution notes, and issue refunds.
            </p>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>
    </div>
  );
};
