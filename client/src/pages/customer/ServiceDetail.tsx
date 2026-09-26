import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Clock,
  ShieldCheck,
  Star,
  CheckCircle,
  ArrowRight,
  UserCheck,
  ArrowLeft,
  Calendar,
  Sparkles
} from 'lucide-react';
import { servicesApi, providersApi } from '../../services/api';
import { Service, ProviderProfile } from '../../types';
import { ProviderCard } from '../../components/cards/ProviderCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const ServiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [providers, setProviders] = useState<ProviderProfile[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await servicesApi.getServiceByIdOrSlug(id);
        setService(data);

        // Fetch available providers
        const provs = await providersApi.getProviders();
        setProviders(provs || []);
        if (provs && provs.length > 0) {
          setSelectedProvider(provs[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading || !service) {
    return <LoadingSpinner message="Loading service details and assigned technicians..." fullScreen />;
  }

  const includedPerks = [
    'Complete pre-service diagnostic check & amperage measurement',
    'High-pressure equipment & eco-friendly coil sanitizers',
    '30-day post-service warranty with free technician recall',
    'Genuine OEM replacement spare parts available with digital bill',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Back button */}
      <Link
        to="/services"
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Services List</span>
      </Link>

      {/* Main Hero Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left 2 Cols: Service Image & Details */}
        <div className="lg:col-span-2 space-y-8">
          <div className="relative rounded-3xl overflow-hidden shadow-md bg-slate-900 aspect-video max-h-96">
            <img
              src={
                service.image ||
                'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800'
              }
              alt={service.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
              <span className="px-3 py-1 bg-brand-600/90 backdrop-blur-md rounded-lg text-xs font-bold uppercase tracking-wider">
                {service.category?.name || 'Home Appliance Service'}
              </span>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                {service.name}
              </h1>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Service Overview</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{service.description}</p>
            </div>

            {/* What is Included */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-brand-600" />
                <span>What's Included in This Package</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {includedPerks.map((perk, idx) => (
                  <div key={idx} className="flex items-start space-x-2.5 text-xs text-slate-600">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{perk}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Provider Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Choose Technician</h3>
                <p className="text-xs text-slate-500">Pick a background-verified specialist for your appointment</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {providers.map((p) => (
                <ProviderCard
                  key={p.id}
                  provider={p}
                  selected={selectedProvider?.id === p.id}
                  onSelect={() => setSelectedProvider(p)}
                />
              ))}
            </div>
          </div>

          {/* Customer Reviews Section */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Customer Verified Reviews</h3>
              <div className="flex items-center space-x-1.5 text-sm font-bold text-slate-900">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>4.9 / 5.0</span>
                <span className="text-slate-400 font-normal">({service._count?.reviews || 24} reviews)</span>
              </div>
            </div>

            <div className="space-y-4 divide-y divide-slate-100">
              {(service.reviews && service.reviews.length > 0
                ? service.reviews
                : [
                    {
                      id: 'rev-sample-1',
                      rating: 5,
                      comment:
                        'The technician arrived promptly with high pressure jet pumps. The air conditioner cooling is icy cold now!',
                      createdAt: '2 days ago',
                      customer: { name: 'Sophia M.' },
                    },
                    {
                      id: 'rev-sample-2',
                      rating: 5,
                      comment:
                        'Very polite, covered my furniture before starting, and left the room spotless. Highly recommended.',
                      createdAt: '1 week ago',
                      customer: { name: 'David K.' },
                    },
                  ]
              ).map((rev: any, idx: number) => (
                <div key={idx} className="pt-4 first:pt-0 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{rev.customer?.name || 'Verified User'}</span>
                    <div className="flex items-center text-amber-400">
                      {[...Array(rev.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Sticky Booking Breakdown Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xl space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs text-slate-400 font-semibold block">Total Service Price</span>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-3xl font-black text-slate-900">₹{service.basePrice.toLocaleString('en-IN')}</span>
                <span className="text-xs text-slate-400">fixed upfront</span>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="flex items-center space-x-2 text-slate-500">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Est. Duration</span>
                </span>
                <span className="font-semibold text-slate-800">~{service.durationMinutes || 60} Minutes</span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="flex items-center space-x-2 text-slate-500">
                  <UserCheck className="w-4 h-4 text-slate-400" />
                  <span>Selected Pro</span>
                </span>
                <span className="font-semibold text-brand-600 truncate max-w-[140px]">
                  {selectedProvider?.user?.name || 'First Available'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="flex items-center space-x-2 text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Guarantee</span>
                </span>
                <span className="font-semibold text-emerald-600">30 Days Included</span>
              </div>
            </div>

            {/* Direct Proceed Button */}
            <button
              onClick={() =>
                navigate(`/book/${service.id}${selectedProvider ? `?providerId=${selectedProvider.id}` : ''}`)
              }
              className="w-full py-3.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 text-sm"
            >
              <Calendar className="w-4 h-4" />
              <span>Proceed to Scheduling</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[11px] text-center text-slate-400 leading-normal">
              Zero cancellation fee up to 2 hours before scheduled slot. Cash or online card payment accepted.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
