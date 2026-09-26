import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  FileText,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { servicesApi, providersApi, bookingsApi } from '../../services/api';
import { Service, ProviderProfile } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const BookService: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const [searchParams] = useSearchParams();
  const providerIdParam = searchParams.get('providerId');

  const [service, setService] = useState<Service | null>(null);
  const [provider, setProvider] = useState<ProviderProfile | null>(null);

  // Form states
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('10:00 AM - 12:00 PM');
  const [address, setAddress] = useState('742 Evergreen Terrace, Apt 4B');
  const [city, setCity] = useState('New York');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!serviceId) return;
      try {
        setLoading(true);
        const serv = await servicesApi.getServiceByIdOrSlug(serviceId);
        setService(serv);

        if (providerIdParam) {
          const prov = await providersApi.getProviderById(providerIdParam);
          setProvider(prov);
        } else if (serv.providers && serv.providers.length > 0) {
          setProvider(serv.providers[0].provider);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [serviceId, providerIdParam]);

  const timeSlots = [
    '09:00 AM - 11:00 AM',
    '11:00 AM - 01:00 PM',
    '02:00 PM - 04:00 PM',
    '04:00 PM - 06:00 PM',
    '06:00 PM - 08:00 PM'
  ];

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!service) return;
    setError(null);
    setSubmitting(true);

    try {
      const scheduledDateTime = new Date(`${selectedDate}T${selectedTimeSlot.slice(0, 5)}:00`).toISOString();

      await bookingsApi.createBooking({
        serviceId: service.id,
        providerId: provider?.id || null,
        scheduledAt: scheduledDateTime,
        address,
        city,
        notes,
      });

      navigate('/my-bookings', { state: { bookingSuccess: true } });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to place booking. Please check details.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !service) {
    return <LoadingSpinner message="Configuring appointment scheduler..." fullScreen />;
  }

  const basePrice = service.basePrice || 499;
  const platformFee = 49;
  const total = basePrice + platformFee;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <Link
        to={`/services/${service.id}`}
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Service Details</span>
      </Link>

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Schedule Appointment
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Pick your preferred date, address, and technician visit window
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmitBooking} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left 2 Cols: Schedule & Address Form */}
        <div className="md:col-span-2 space-y-6">
          {/* Step 1: Date & Slot */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-brand-600" />
              <span>1. Choose Appointment Date & Time Window</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Service Date
              </label>
              <input
                type="date"
                required
                value={selectedDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Available Arrival Window
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedTimeSlot(slot)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all text-left flex items-center justify-between ${
                      selectedTimeSlot === slot
                        ? 'border-brand-600 bg-brand-50 text-brand-700 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{slot}</span>
                    {selectedTimeSlot === slot && (
                      <CheckCircle className="w-4 h-4 text-brand-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step 2: Address */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-brand-600" />
              <span>2. Service Location & Access</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City / Region</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. New York, NY"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address & Flat / House #</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="742 Evergreen Terrace, Apt 4B"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Technician Notes / Issue Details (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Mention specific appliance brand (e.g. LG Inverter), outdoor unit location, ladder requirement, or parking gate code..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-600"
              />
            </div>
          </div>
        </div>

        {/* Right Col: Order Breakdown & Confirm */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xl space-y-5">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Order Breakdown
            </h3>

            <div className="space-y-3 text-xs text-slate-600">
              <div>
                <span className="font-bold text-slate-900 block">{service.name}</span>
                <span className="text-[11px] text-slate-400">1x Scheduled Service Call</span>
              </div>

              <div className="flex justify-between py-1 border-t border-slate-100">
                <span className="text-slate-500">Service Base Price</span>
                <span className="font-semibold text-slate-800">₹{basePrice.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between py-1 border-t border-slate-100">
                <span className="text-slate-500">Safety & Platform Fee</span>
                <span className="font-semibold text-slate-800">₹{platformFee.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between py-2 border-t border-slate-200 text-sm font-bold text-slate-900">
                <span>Total Payable</span>
                <span className="text-brand-600 font-black text-lg">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-[11px] space-y-1">
              <div className="flex items-center font-bold">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                <span>30-Day Fix Guarantee Included</span>
              </div>
              <p className="text-[10px] text-emerald-700">
                Pay online now or in cash after work completion.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
            >
              <span>{submitting ? 'Placing Order...' : 'Confirm Booking'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
