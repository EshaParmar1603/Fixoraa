import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Search,
  CheckCircle2,
  Clock,
  User,
  Calendar,
  X,
  ShieldCheck,
  Send
} from 'lucide-react';
import { adminApi, complaintsApi } from '../../services/api';
import { Complaint, ComplaintStatus, ComplaintPriority } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const AdminComplaints: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  // Investigation modal
  const [activeComplaint, setActiveComplaint] = useState<Complaint | null>(null);
  const [resolutionStatus, setResolutionStatus] = useState<ComplaintStatus>('RESOLVED');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [savingResolution, setSavingResolution] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getAllComplaints();
      setComplaints(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeComplaint) return;
    try {
      setSavingResolution(true);
      await complaintsApi.updateComplaint(activeComplaint.id, {
        status: resolutionStatus,
        resolutionNotes,
      });
      setActiveComplaint(null);
      setResolutionNotes('');
      fetchComplaints();
    } catch (err) {
      console.error(err);
    } finally {
      setSavingResolution(false);
    }
  };

  const filtered = complaints.filter((c) => {
    if (selectedStatus !== 'ALL' && c.status !== selectedStatus) return false;
    if (searchTerm) {
      const matchSub = c.subject.toLowerCase().includes(searchTerm.toLowerCase());
      const matchNum = c.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCust = c.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchSub || matchNum || matchCust;
    }
    return true;
  });

  if (loading) {
    return <LoadingSpinner message="Loading dispute investigation queue..." fullScreen />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
          <AlertTriangle className="w-8 h-8 text-rose-600" />
          <span>Dispute Investigation Desk</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review customer service dissatisfaction, mediate repairs, and attach formal resolution notes
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
            placeholder="Search by ticket #, subject, or customer..."
            className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-600"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['ALL', 'OPEN', 'IN_INVESTIGATION', 'RESOLVED', 'CLOSED'].map((st) => (
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

      {/* Complaints Grid */}
      <div className="space-y-4">
        {filtered.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-rose-600 tracking-wider">
                  TICKET #{c.ticketNumber}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">{c.subject}</h3>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                  Priority: {c.priority}
                </span>
                <StatusBadge status={c.status} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Customer</span>
                <p className="font-bold text-slate-900">{c.customer?.name}</p>
                <p className="text-slate-400">{c.customer?.email}</p>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Booking Link</span>
                <p className="font-semibold text-brand-600">
                  {c.booking ? `#${c.booking.bookingNumber}` : 'General platform complaint'}
                </p>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Submission Date</span>
                <p className="font-medium text-slate-700">
                  {new Date(c.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl">
              <span className="font-bold text-slate-700 block mb-1">Customer Grievance:</span>
              {c.description}
            </p>

            {c.resolutionNotes && (
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900">
                <span className="font-bold">Official Resolution: </span>
                {c.resolutionNotes}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  setActiveComplaint(c);
                  setResolutionStatus(c.status === 'RESOLVED' ? 'CLOSED' : 'RESOLVED');
                  setResolutionNotes(c.resolutionNotes || '');
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
              >
                Investigate & Resolve
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* RESOLUTION INVESTIGATION MODAL */}
      {activeComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-rose-600">
                  #{activeComplaint.ticketNumber}
                </span>
                <h3 className="text-base font-bold text-slate-900">{activeComplaint.subject}</h3>
              </div>
              <button onClick={() => setActiveComplaint(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResolve} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Update Status</label>
                <select
                  value={resolutionStatus}
                  onChange={(e) => setResolutionStatus(e.target.value as ComplaintStatus)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="IN_INVESTIGATION">IN INVESTIGATION (Contacting Technician)</option>
                  <option value="RESOLVED">RESOLVED (Customer Remedied / Re-visit scheduled)</option>
                  <option value="CLOSED">CLOSED (Case Completed)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Investigation & Resolution Notes
                </label>
                <textarea
                  rows={4}
                  required
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Detail admin findings, contact with technician, warranty parts dispatched, or refund amount credited..."
                  className="w-full p-3 rounded-xl border border-slate-200 leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={savingResolution}
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl shadow-md transition-all text-sm disabled:opacity-50"
              >
                {savingResolution ? 'Saving Resolution...' : 'Submit Official Resolution'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
