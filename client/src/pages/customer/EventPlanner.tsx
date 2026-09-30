import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  Sparkles,
  Users,
  CheckCircle2,
  ArrowRight,
  Clock,
  IndianRupee,
  MapPin,
  Building,
  Music,
  Camera,
  Mic,
  Utensils,
  Check,
  X,
  ShieldCheck,
  Star,
  MessageSquare,
  Gift,
  Heart,
  ChevronRight,
  Phone,
  Layers,
  Award
} from 'lucide-react';
import { formatINR } from '../../utils/formatters';

export type EventType =
  | 'wedding'
  | 'birthday'
  | 'corporate'
  | 'anniversary'
  | 'housewarming'
  | 'festive';

interface EventOption {
  id: EventType;
  title: string;
  tagline: string;
  icon: string;
  image: string;
  baseBudget: number;
}

const EVENT_OPTIONS: EventOption[] = [
  {
    id: 'wedding',
    title: 'Wedding & Sangeet',
    tagline: 'Mandap decor, royal entry & sangeet stage',
    icon: '💍',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
    baseBudget: 250000,
  },
  {
    id: 'birthday',
    title: 'Birthday Celebration',
    tagline: 'Theme decor, LED backdrop & activities',
    icon: '🎂',
    image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800',
    baseBudget: 35000,
  },
  {
    id: 'corporate',
    title: 'Corporate Summit & Gala',
    tagline: 'Keynote stage, AV audio & LED walls',
    icon: '💼',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
    baseBudget: 120000,
  },
  {
    id: 'anniversary',
    title: 'Anniversary Party',
    tagline: 'Floral styling, acoustic music & dinner',
    icon: '🥂',
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800',
    baseBudget: 60000,
  },
  {
    id: 'housewarming',
    title: 'Housewarming & Puja',
    tagline: 'Traditional marigold rangoli & rituals',
    icon: '🪔',
    image: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800',
    baseBudget: 40000,
  },
  {
    id: 'festive',
    title: 'Cocktail & Festive Party',
    tagline: 'Fairy lights, live DJ & ambient lounge',
    icon: '🎆',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800',
    baseBudget: 50000,
  },
];

interface EventCoordinator {
  id: string;
  name: string;
  agency: string;
  avatar: string;
  experienceYears: number;
  eventsManaged: number;
  rating: number;
  specialty: string;
  city: string;
}

const TOP_COORDINATORS: EventCoordinator[] = [
  {
    id: 'ec-1',
    name: 'Rohan & Srishti Kapoor',
    agency: 'Celebrazio Royal Weddings & Galas',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    experienceYears: 12,
    eventsManaged: 280,
    rating: 4.95,
    specialty: 'Grand Weddings & Destination Galas',
    city: 'Bengaluru & Goa',
  },
  {
    id: 'ec-2',
    name: 'Anandita Roy',
    agency: 'Fête & Confetti Studios',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    experienceYears: 8,
    eventsManaged: 190,
    rating: 4.92,
    specialty: 'Themed Birthdays & Milestone Anniversaries',
    city: 'Mumbai & Pune',
  },
  {
    id: 'ec-3',
    name: 'Kunal Singhania',
    agency: 'Apex Corporate & Event Management',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    experienceYears: 14,
    eventsManaged: 340,
    rating: 4.98,
    specialty: 'Corporate Summits, Keynotes & Product Launches',
    city: 'Delhi-NCR',
  },
];

export const EventPlanner: React.FC = () => {
  // Questionnaire State
  const [eventType, setEventType] = useState<EventType>('wedding');
  const [guestCount, setGuestCount] = useState<number>(150);
  const [venueType, setVenueType] = useState<string>('Banquet Hall');
  const [selectedServices, setSelectedServices] = useState<string[]>([
    'Theme & Floral Decor',
    'DJ, Sound & Ambient Lighting',
    'Professional Photography & Video',
    'End-to-End On-Site Coordination'
  ]);
  const [budgetTier, setBudgetTier] = useState<'standard' | 'premium' | 'royal'>('premium');
  const [eventDate, setEventDate] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('Bengaluru');
  const [customNotes, setCustomNotes] = useState<string>('');

  // Booking Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');

  const navigate = useNavigate();

  // Current selected event object
  const currentEvent = useMemo(() => {
    return EVENT_OPTIONS.find((e) => e.id === eventType) || EVENT_OPTIONS[0];
  }, [eventType]);

  // Service toggle handler
  const toggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
    );
  };

  // Dynamic cost calculation based on answers
  const estimatedCost = useMemo(() => {
    let multiplier = 1;
    if (budgetTier === 'standard') multiplier = 0.8;
    if (budgetTier === 'royal') multiplier = 1.6;

    const guestFactor = Math.max(1, guestCount / 100);
    const servicesFactor = 1 + selectedServices.length * 0.15;

    const total = currentEvent.baseBudget * multiplier * guestFactor * servicesFactor * 0.55;
    return Math.round(total / 1000) * 1000;
  }, [currentEvent, budgetTier, guestCount, selectedServices]);

  // Cost breakdown
  const breakdown = useMemo(() => {
    return {
      decor: Math.round(estimatedCost * 0.42),
      soundAndLighting: Math.round(estimatedCost * 0.22),
      photoVideo: Math.round(estimatedCost * 0.18),
      coordination: Math.round(estimatedCost * 0.18),
    };
  }, [estimatedCost]);

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setIsModalOpen(false);
      setClientName('');
      setClientPhone('');
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-slate-50/80 pb-24 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* HERO BANNER */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-rose-950 via-slate-900 to-indigo-950 text-white p-8 sm:p-12 shadow-2xl border border-rose-900/40">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-rose-300">
              <Sparkles className="w-4 h-4 text-rose-400" />
              <span>Fixora Bespoke Event Planning & Production Studio</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Craft Unforgettable Celebrations With{' '}
              <span className="bg-gradient-to-r from-rose-400 via-amber-300 to-pink-300 bg-clip-text text-transparent">
                Certified Event Directors
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Answer our 6-step planning questionnaire to generate instant custom budgets, preview theme decor, and secure dedicated event planners for weddings, birthdays, galas, and festive gatherings.
            </p>

            <div className="flex flex-wrap items-center gap-5 pt-2 text-xs font-semibold text-slate-300">
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-rose-400" />
                <span>100% On-Time Execution Guarantee</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-rose-400" />
                <span>Transparent Itemized Vendor Invoicing</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-rose-400" />
                <span>Dedicated Single Point of Contact (SPOC)</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2-COLUMN LAYOUT: QUESTIONNAIRE & LIVE ESTIMATOR */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: INTERACTIVE QUESTIONNAIRE (7 Cols) */}
          <div className="lg:col-span-7 space-y-8">
            {/* STEP 1: EVENT TYPE */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-5">
              <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
                <span className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-black text-sm">
                  1
                </span>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    What Type of Event Are You Hosting?
                  </h2>
                  <p className="text-xs text-slate-500">
                    Select your occasion to tailor themes, stage setups, and specialized vendors
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {EVENT_OPTIONS.map((opt) => {
                  const isSelected = eventType === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setEventType(opt.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 ${
                        isSelected
                          ? 'border-rose-600 bg-rose-50/60 ring-2 ring-rose-500/20 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">{opt.icon}</span>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                          {opt.title}
                        </h4>
                        <span className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                          {opt.tagline}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 2: GUEST COUNT & VENUE */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-5">
              <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
                <span className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-black text-sm">
                  2
                </span>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    Expected Headcount & Venue Type
                  </h2>
                  <p className="text-xs text-slate-500">
                    Help us calculate seating arrangements, acoustics, and crowd flow
                  </p>
                </div>
              </div>

              {/* Guest Count Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Expected Guests
                  </span>
                  <div className="px-3 py-1 bg-rose-50 border border-rose-200 text-rose-700 font-black text-sm rounded-xl flex items-center space-x-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <span>{guestCount} Guests</span>
                  </div>
                </div>

                <input
                  type="range"
                  min="20"
                  max="1000"
                  step="10"
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="w-full accent-rose-600 cursor-pointer"
                />

                {/* Quick Presets for Guest Count */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {[
                    { label: '50 (Intimate)', val: 50 },
                    { label: '150 (Medium)', val: 150 },
                    { label: '350 (Grand)', val: 350 },
                    { label: '600+ (Royal)', val: 600 }
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => setGuestCount(preset.val)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                        guestCount === preset.val
                          ? 'bg-rose-50 border-rose-400 text-rose-700'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Venue Type Pills */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Venue Space
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-semibold">
                  {[
                    'Banquet Hall',
                    'Open Lawn / Farmhouse',
                    'Private Villa / Home',
                    '5-Star Ballroom',
                    'Rooftop Terrace',
                    'Need Venue Help'
                  ].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setVenueType(v)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        venueType === v
                          ? 'border-rose-600 bg-rose-600 text-white shadow-sm font-bold'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* STEP 3: SPECIALIZED SERVICES REQUIRED */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-5">
              <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
                <span className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-black text-sm">
                  3
                </span>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    Which Production Elements Do You Need?
                  </h2>
                  <p className="text-xs text-slate-500">
                    Pick as many services as required for complete turn-key management
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {[
                  { name: 'Theme & Floral Decor', desc: 'Custom stage, entrance arch, table centerpieces & props', icon: Sparkles },
                  { name: 'DJ, Sound & Ambient Lighting', desc: 'Bass sound systems, moving heads, wireless mics & smoke', icon: Music },
                  { name: 'Professional Photography & Video', desc: 'Candid photographer, 4K cinematic trailer & drone shoot', icon: Camera },
                  { name: 'Celebrity Anchor & Live Artists', desc: 'Engaging master of ceremonies, folk dance & live band', icon: Mic },
                  { name: 'End-to-End On-Site Coordination', desc: 'Dedicated coordinator squad ensuring zero schedule delays', icon: ShieldCheck },
                  { name: 'Return Gifts & Welcome Hostesses', desc: 'Curated gift hampers, guest hospitality & ushering', icon: Gift },
                ].map((serv) => {
                  const active = selectedServices.includes(serv.name);
                  const Icon = serv.icon;
                  return (
                    <button
                      key={serv.name}
                      type="button"
                      onClick={() => toggleService(serv.name)}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex items-start space-x-3 ${
                        active
                          ? 'border-rose-600 bg-rose-50/50 ring-2 ring-rose-500/20 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                          active ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{serv.name}</span>
                          {active && <Check className="w-3.5 h-3.5 text-rose-600" />}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                          {serv.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 4: BUDGET TIER, DATE & NOTES */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-5">
              <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
                <span className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-black text-sm">
                  4
                </span>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    Execution Scale & Date Logistics
                  </h2>
                  <p className="text-xs text-slate-500">
                    Specify your budget tier, target date, and city for coordinator allocation
                  </p>
                </div>
              </div>

              {/* Budget Tier Buttons */}
              <div>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Package Tier
                </span>
                <div className="grid grid-cols-3 gap-2.5 text-xs font-bold">
                  {[
                    { id: 'standard', title: 'Standard', note: 'Essential & Clean' },
                    { id: 'premium', title: 'Premium', note: 'Most Popular Choice' },
                    { id: 'royal', title: 'Royal Luxury', note: 'VIP Opulence' },
                  ].map((tier) => (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setBudgetTier(tier.id as any)}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        budgetTier === tier.id
                          ? 'border-rose-600 bg-rose-50 text-rose-800 ring-2 ring-rose-500/20 shadow-sm'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span className="block">{tier.title}</span>
                      <span className="text-[10px] text-slate-400 font-normal mt-0.5 block">
                        {tier.note}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date & City Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Event Date
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    City Location
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  >
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Delhi-NCR">Delhi-NCR</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Pune">Pune</option>
                    <option value="Chennai">Chennai</option>
                    <option value="Kolkata">Kolkata</option>
                    <option value="Goa">Goa (Destination)</option>
                  </select>
                </div>
              </div>

              {/* Custom Theme Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Specific Theme or Custom Request (Optional)
                </label>
                <textarea
                  rows={2}
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="e.g. Pastel floral arch with fairy light canopy, retro 90s bollywood sound, welcome mocktail bar..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs leading-relaxed focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* RIGHT: LIVE ESTIMATE & COORDINATOR ALLOCATION (5 Cols) */}
          <div className="lg:col-span-5 space-y-6 sticky top-24">
            {/* LIVE BUDGET ESTIMATE CARD */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">
                    Instant Smart Estimator
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    Live Event Package Forecast
                  </h3>
                </div>
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <IndianRupee className="w-4 h-4" />
                </div>
              </div>

              {/* Grand Total Callout */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-900 via-rose-950 to-slate-950 text-white shadow-md space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-300">
                  Estimated Turnkey Budget
                </span>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-black text-white">
                    {formatINR(estimatedCost)}
                  </span>
                  <span className="text-xs text-rose-200">
                    (₹{Math.round(estimatedCost / guestCount)}/guest)
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 pt-1 border-t border-white/10">
                  Includes {selectedServices.length} selected services for {guestCount} guests at {venueType}.
                </p>
              </div>

              {/* Itemized Cost Breakdown */}
              <div className="space-y-2.5 text-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Budget Allocation Breakdown
                </span>

                <div className="flex justify-between text-slate-700">
                  <span>Theme & Stage Decor (42%):</span>
                  <span className="font-bold text-slate-900">{formatINR(breakdown.decor)}</span>
                </div>

                <div className="flex justify-between text-slate-700">
                  <span>Sound, DJ & FX Lighting (22%):</span>
                  <span className="font-bold text-slate-900">{formatINR(breakdown.soundAndLighting)}</span>
                </div>

                <div className="flex justify-between text-slate-700">
                  <span>Photography & Cinematic Video (18%):</span>
                  <span className="font-bold text-slate-900">{formatINR(breakdown.photoVideo)}</span>
                </div>

                <div className="flex justify-between text-slate-700">
                  <span>On-Site Crew & Coordination (18%):</span>
                  <span className="font-bold text-rose-600">{formatINR(breakdown.coordination)}</span>
                </div>
              </div>

              {/* Call to action button */}
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center space-x-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Certified Event Planner</span>
              </button>
            </div>

            {/* ASSIGNED TOP EVENT COORDINATOR */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Recommended Lead Coordinator
                  </span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Available for {selectedCity}
                </span>
              </div>

              <div className="flex items-start space-x-3.5">
                <img
                  src={TOP_COORDINATORS[0].avatar}
                  alt={TOP_COORDINATORS[0].name}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-rose-100 shadow-sm"
                />
                <div className="space-y-0.5">
                  <h4 className="font-black text-slate-900 text-sm">
                    {TOP_COORDINATORS[0].name}
                  </h4>
                  <span className="text-xs font-semibold text-rose-600 block">
                    {TOP_COORDINATORS[0].agency}
                  </span>
                  <div className="flex items-center space-x-2 text-[11px] text-slate-500 pt-0.5">
                    <span className="flex items-center font-bold text-slate-900">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-1" />
                      {TOP_COORDINATORS[0].rating}
                    </span>
                    <span>•</span>
                    <span>{TOP_COORDINATORS[0].experienceYears} yrs exp</span>
                    <span>•</span>
                    <span>{TOP_COORDINATORS[0].eventsManaged}+ events</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 flex items-center justify-between">
                <span>Free Initial Concept Call</span>
                <span className="font-bold text-emerald-600">₹0 Fee Included</span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="flex-1 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors"
                >
                  Schedule Consultation
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/chat')}
                  className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
                  title="Direct Message"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RECENT REAL EVENT SHOWCASE STRIP */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
                Proof of Work & Real Production
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                Recent Masterpiece Celebrations Managed By Fixora
              </h3>
            </div>
            <Link
              to="/caterers"
              className="text-xs sm:text-sm font-bold text-rose-600 hover:text-rose-700 flex items-center space-x-1"
            >
              <span>Explore Catering & Food Stations</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Royal Indiranagar Wedding Reception',
                type: '500 Guests • Indiranagar Club Lawn',
                image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600',
                cost: '₹4,80,000',
                highlights: 'Mogra flower ceiling, LED violin band, live nitrogen chaat bar'
              },
              {
                title: 'Tech Summit & Neon Afterparty',
                type: '350 Pax • JW Marriott Grand Ballroom',
                image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600',
                cost: '₹2,90,000',
                highlights: 'Curved 4K LED backdrop, silent disco setup, keynote staging'
              },
              {
                title: 'Boho Garden 1st Birthday Carnival',
                type: '120 Guests • Palm Meadows Villa Deck',
                image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600',
                cost: '₹75,000',
                highlights: 'Pastel balloon castle, puppet show, live popcorn & candyfloss'
              }
            ].map((p, idx) => (
              <div
                key={idx}
                className="group rounded-2xl overflow-hidden border border-slate-200/80 bg-white hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-950/70 backdrop-blur-md text-white text-[11px] font-bold">
                    {p.type}
                  </span>
                </div>
                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{p.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">{p.highlights}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                    <span className="text-slate-400">Production Cost:</span>
                    <span className="font-black text-rose-600">{p.cost}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BOOKING MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">
                  Fixora Event Studio
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  Reserve Event Planning Lead
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            {bookingSuccess ? (
              <div className="py-8 text-center space-y-3 animate-in fade-in">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-black text-slate-900">
                  Event Request Confirmed!
                </h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                  Our Lead Coordinator <strong>{TOP_COORDINATORS[0].name}</strong> has received your questionnaire. You will receive an itemized moodboard and quote on WhatsApp shortly!
                </p>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div className="p-3.5 bg-rose-50/50 rounded-2xl border border-rose-100 text-xs space-y-1">
                  <div className="flex justify-between font-semibold text-slate-700">
                    <span>Occasion:</span>
                    <span className="text-slate-900 font-bold">{currentEvent.title}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-slate-700">
                    <span>Guests & Scale:</span>
                    <span className="text-rose-700 font-bold">
                      {guestCount} Pax • {budgetTier.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold text-slate-700">
                    <span>Estimated Cost:</span>
                    <span className="text-slate-900 font-bold">{formatINR(estimatedCost)}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Priya Sundaram"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    WhatsApp Number (For Moodboards & Live Quotes)
                  </label>
                  <input
                    type="tel"
                    required
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-colors"
                  >
                    Confirm & Send Questionnaire
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
