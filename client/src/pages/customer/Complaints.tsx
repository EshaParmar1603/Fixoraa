import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  Plus,
  Clock,
  CheckCircle2,
  X,
  MessageSquare,
  ShieldAlert,
  FileQuestion,
  Calendar
} from 'lucide-react';
import { complaintsApi, bookingsApi } from '../../services/api';
import { Complaint, Booking, ComplaintPriority } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';

export const Complaints: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // New Complaint modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<ComplaintPriority>('MEDIUM');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cmps, bks] = await Promise.all([
        complaintsApi.getMyComplaints(),
        bookingsApi.getMyBookings()
      ]);
      setComplaints(cmps || []);
      setBookings(bks || []);
      if (bks && bks.length > 0) {
        setBookingId(bks[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await complaintsApi.createComplaint({
        bookingId: bookingId || null,
        subject,
        description,
        priority,
      });
      setIsModalOpen(false);
      setSubject('');
      setDescription('');
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your dispute center & support tickets..." fullScreen />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2.5">
            <ShieldAlert className="w-8 h-8 text-rose-500" />
            <span>Dispute Center & Ticket Tracker</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Fixora guarantees satisfaction. Report any issue, service defect, or technician conduct for immediate admin mediation.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>File a Complaint / Dispute</span>
        </button>
      </div>

      {/* Trust Guarantee callout */}
      <div className="bg-brand-50/60 rounded-2xl p-4 border border-brand-200/60 flex items-start space-x-3 text-xs text-brand-900">
        <CheckCircle2 className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Our 30-Day Fix Guarantee Promise:</span>
          <p className="text-slate-600 mt-0.5 leading-relaxed">
            All complaints submitted within 30 days of service completion receive free priority technician revisit or a 100% full refund supervised by platform admins.
          </p>
        </div>
      </div>

      {/* Tickets List */}
      {complaints.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No open disputes or complaints"
          description="All your service bookings have been satisfied! If you ever face an issue with a technician or repair quality, report it here."
        />
      ) : (
        <div className="space-y-4">
          {complaints.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Ticket #{c.ticketNumber}
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

              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl">
                {c.description}
              </p>

              {/* Admin Resolution Notes if present */}
              {c.resolutionNotes && (
                <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                  <div className="font-bold flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Admin Resolution Note:</span>
                  </div>
                  <p className="text-slate-700 pl-5.5">{c.resolutionNotes}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
                <div className="flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Filed on {new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
                {c.booking && (
                  <span className="font-semibold text-brand-600">
                    Linked to Booking #{c.booking.bookingNumber}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ==================================================== */}
      {/* FILE COMPLAINT MODAL */}
      {/* ==================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-rose-600" />
                <span>Submit Dispute Ticket</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateComplaint} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Related Booking</label>
                <select
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="">General Support / No Specific Booking</option>
                  {bookings.map((b) => (
                    <option key={b.id} value={b.id}>
                      #{b.bookingNumber} - {b.service?.name} ({b.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Priority Level</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as ComplaintPriority)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="LOW">Low (Minor cosmetic issue or general inquiry)</option>
                  <option value="MEDIUM">Medium (Service delay or partial repair)</option>
                  <option value="HIGH">High (Appliance not working post-service)</option>
                  <option value="CRITICAL">Critical (Gas leak, electrical hazard, water damage)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Complaint Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. AC cooling stopped 2 days after jet-clean"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Detailed Description of the Problem</label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please describe what happened, technician actions, error codes on the appliance, or parts that malfunctioned..."
                  className="w-full p-3 rounded-xl border border-slate-200 leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl shadow-md transition-all text-sm disabled:opacity-50"
              >
                {submitting ? 'Submitting Ticket...' : 'File Official Dispute'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
