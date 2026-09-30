import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Wrench,
  Snowflake,
  Refrigerator,
  Waves,
  Utensils,
  Droplet,
  Zap,
  ArrowRight,
  ShieldCheck,
  Star,
  CheckCircle2,
  Tv,
  FileText,
  Clock,
  Sparkles,
  Palette,
  Calendar
} from 'lucide-react';
import { ServiceCard } from '../../components/cards/ServiceCard';
import { ProviderCard } from '../../components/cards/ProviderCard';
import { servicesApi, categoriesApi, providersApi } from '../../services/api';
import { Service, Category, ProviderProfile } from '../../types';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const Home: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);
  const [topProviders, setTopProviders] = useState<ProviderProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const [cats, servs, provs] = await Promise.all([
          categoriesApi.getCategories(),
          servicesApi.getServices({ sortBy: 'popular' }),
          providersApi.getProviders({ limit: 3 })
        ]);
        setCategories(cats || []);
        setFeaturedServices(servs?.slice(0, 6) || []);
        setTopProviders(provs?.slice(0, 3) || []);
      } catch (err) {
        console.error('Failed to load home data', err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/services?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getCategoryIcon = (iconName?: string | null) => {
    switch (iconName?.toLowerCase()) {
      case 'snowflake': return <Snowflake className="w-6 h-6 text-sky-500" />;
      case 'refrigerator': return <Refrigerator className="w-6 h-6 text-blue-500" />;
      case 'waves': return <Waves className="w-6 h-6 text-teal-500" />;
      case 'utensils': return <Utensils className="w-6 h-6 text-orange-500" />;
      case 'droplet': return <Droplet className="w-6 h-6 text-cyan-500" />;
      case 'zap': return <Zap className="w-6 h-6 text-amber-500" />;
      default: return <Wrench className="w-6 h-6 text-brand-500" />;
    }
  };

  if (loading) {
    return <LoadingSpinner message="Curating available services & verified technicians..." fullScreen />;
  }

  return (
    <div className="space-y-16 pb-20">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-950 via-slate-900 to-slate-900 text-white pt-20 pb-28 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-7xl mx-auto relative z-10 text-center space-y-8">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-brand-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>On-Demand Verified Appliance Repairs & Digital Warranty Vault</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight max-w-4xl mx-auto leading-tight">
            Fix Any Home Appliance With{' '}
            <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-teal-300 bg-clip-text text-transparent">
              Certified Technicians
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Book background-verified specialists in under 60 seconds. Fixed transparent prices, 30-day service guarantee, and zero inspection surprises.
          </p>

          {/* Hero Search Bar */}
          <form
            onSubmit={handleSearch}
            className="max-w-2xl mx-auto bg-white/95 backdrop-blur-md rounded-2xl p-2 shadow-2xl flex items-center border border-white/40 focus-within:ring-4 focus-within:ring-brand-500/30 transition-all"
          >
            <div className="pl-4 text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search AC Jet Clean, Refrigerator Gas Leak, Washing Machine..."
              className="flex-1 px-3 py-3 text-slate-900 text-sm placeholder-slate-400 bg-transparent focus:outline-none"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center space-x-1.5"
            >
              <span>Find Tech</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Categories Bar */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs font-medium text-slate-300">
            <span className="text-slate-400">Popular:</span>
            {['AC Service', 'Double Door Fridge', 'Drum Overhaul', 'RO Membrane', 'Chimney Degrease'].map((tag) => (
              <button
                key={tag}
                onClick={() => navigate(`/services?search=${encodeURIComponent(tag)}`)}
                className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-all border border-white/10"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Strip */}
        <div className="max-w-5xl mx-auto mt-16 pt-8 border-t border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <span className="text-2xl sm:text-3xl font-black text-white">4.9/5</span>
            <span className="block text-xs text-slate-400 mt-1">Average Customer Rating</span>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-white">25,000+</span>
            <span className="block text-xs text-slate-400 mt-1">Repairs Completed</span>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-white">100%</span>
            <span className="block text-xs text-slate-400 mt-1">Verified Backgrounds</span>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-white">30 Days</span>
            <span className="block text-xs text-slate-400 mt-1">Free Re-service Guarantee</span>
          </div>
        </div>
      </section>

      {/* CATEGORIES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Explore Capabilities</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Popular Service Categories
            </h2>
          </div>
          <Link
            to="/services"
            className="text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/services?category=${cat.slug}`}
              className="group p-5 bg-white rounded-2xl border border-slate-200/80 hover:border-brand-500/50 hover:shadow-lg transition-all duration-200 text-center flex flex-col items-center justify-center space-y-3"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-50 group-hover:bg-brand-50 flex items-center justify-center transition-colors">
                {getCategoryIcon(cat.icon)}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm group-hover:text-brand-600 transition-colors">
                  {cat.name}
                </h4>
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  {cat._count?.services || 3} options
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED SERVICES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Most Requested</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Top Rated Repair Packages
            </h2>
          </div>
          <Link
            to="/services"
            className="text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
          >
            <span>All Packages</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </section>

      {/* APPLIANCE VAULT VALUE PROP BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-brand-900 via-indigo-900 to-slate-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl space-y-5">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-brand-500/20 border border-brand-400/30 text-xs font-bold text-brand-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Fixora Digital Document Locker</span>
            </span>

            <h3 className="text-3xl sm:text-4xl font-black tracking-tight leading-snug">
              Never hunt for paper receipts or expired warranties again.
            </h3>

            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              Store your appliance serial numbers, store purchase invoices, and warranty expiry dates in one safe vault. We automatically notify you before warranties lapse and schedule timely filter and compressor maintenance.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                to="/appliances"
                className="px-5 py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center space-x-2"
              >
                <Tv className="w-4 h-4" />
                <span>Open Appliance Registry</span>
              </Link>
              <Link
                to="/warranties"
                className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-xl border border-white/20 transition-all flex items-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span>Upload Bill or Warranty</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* TOP VERIFIED TECHNICIANS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Certified Pros</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Top Rated Local Technicians
            </h2>
          </div>
          <Link
            to="/services"
            className="text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
          >
            <span>Book A Specialist</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topProviders.map((provider) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              onSelect={() => navigate(`/services`)}
            />
          ))}
        </div>
      </section>

      {/* EXPLORE MORE OF OUR SERVICES (SPECIALIZED LIFESTYLE & EVENT SERVICES) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="mb-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-xs font-bold text-brand-800 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>Specialized Services</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Explore More of Our Services
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Tailored lifestyle solutions, smart utility calculators, and verified experts for your home.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Smart Electricity Bill Predictor */}
          <Link
            to="/bill-predictor"
            className="group rounded-3xl overflow-hidden border border-slate-200/90 bg-white hover:border-amber-400 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="relative h-44 overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-amber-700 p-5 flex flex-col justify-between text-slate-950">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 text-amber-300 text-[10px] font-black uppercase tracking-wider backdrop-blur-md">
                    Tariff Engine
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-slate-950 shadow-inner group-hover:scale-110 transition-transform">
                    <Zap className="w-4 h-4 fill-slate-950" />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-black text-white leading-tight drop-shadow-sm">
                    Electricity Bill Predictor
                  </h3>
                  <span className="text-xs text-amber-100 font-medium block mt-0.5">
                    Forecast bills & split rent in ₹
                  </span>
                </div>
              </div>

              {/* Clear Options Checklist */}
              <div className="p-5 space-y-2.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Included Capabilities
                </span>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Live State DISCOM Tariff Slabs</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>AC & Appliance Hourly Simulator</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>1-Click WhatsApp Roommate Split</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-5 pt-0">
              <div className="py-2.5 px-4 rounded-xl bg-amber-50 group-hover:bg-amber-500 text-amber-800 group-hover:text-slate-950 font-bold text-xs transition-colors flex items-center justify-between">
                <span>Calculate My Bill</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Card 2: Bespoke Event Planner */}
          <Link
            to="/event-planner"
            className="group rounded-3xl overflow-hidden border border-slate-200/90 bg-white hover:border-rose-400 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="relative h-44 overflow-hidden bg-slate-900">
                <img
                  src="https://images.unsplash.com/photo-1519741497674-611481863552?w=600"
                  alt="Event Planner"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-rose-600/90 text-white text-[10px] font-black uppercase tracking-wider backdrop-blur-md">
                    Planning Studio
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner group-hover:scale-110 transition-transform">
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>

                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <h3 className="text-lg font-black leading-tight drop-shadow-sm">
                    Bespoke Event Planner
                  </h3>
                  <span className="text-xs text-rose-200 font-medium block mt-0.5">
                    Plan celebrations in 4 simple steps
                  </span>
                </div>
              </div>

              {/* Clear Options Checklist */}
              <div className="p-5 space-y-2.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Included Capabilities
                </span>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>Custom Event Questionnaire</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>Live Dynamic Budget Calculator</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>Theme Decor & Stage Production</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-5 pt-0">
              <div className="py-2.5 px-4 rounded-xl bg-rose-50 group-hover:bg-rose-600 text-rose-800 group-hover:text-white font-bold text-xs transition-colors flex items-center justify-between">
                <span>Start Event Questionnaire</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Card 3: Gourmet Caterers */}
          <Link
            to="/caterers"
            className="group rounded-3xl overflow-hidden border border-slate-200/90 bg-white hover:border-amber-500 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="relative h-44 overflow-hidden bg-slate-900">
                <img
                  src="https://images.unsplash.com/photo-1555244162-803834f70033?w=600"
                  alt="Gourmet Caterers"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-amber-600/90 text-white text-[10px] font-black uppercase tracking-wider backdrop-blur-md">
                    Gourmet Dining
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner group-hover:scale-110 transition-transform">
                    <Utensils className="w-4 h-4" />
                  </div>
                </div>

                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <h3 className="text-lg font-black leading-tight drop-shadow-sm">
                    Gourmet Caterers
                  </h3>
                  <span className="text-xs text-amber-200 font-medium block mt-0.5">
                    Banquet menus & live stalls
                  </span>
                </div>
              </div>

              {/* Clear Options Checklist */}
              <div className="p-5 space-y-2.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Included Capabilities
                </span>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Real Banquet & Food Setup Photos</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Verified Instagram Profiles & Reels</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Complimentary Tasting Sessions</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-5 pt-0">
              <div className="py-2.5 px-4 rounded-xl bg-amber-50 group-hover:bg-amber-600 text-amber-800 group-hover:text-white font-bold text-xs transition-colors flex items-center justify-between">
                <span>Browse Caterers & Menus</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Card 4: Architectural Interior Design & Renovation */}
          <Link
            to="/interior-design"
            className="group rounded-3xl overflow-hidden border border-slate-200/90 bg-white hover:border-brand-500 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="relative h-44 overflow-hidden bg-slate-900">
                <img
                  src="/interiors/simple_minimalist.jpg"
                  alt="Interior Design"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-brand-600/90 text-white text-[10px] font-black uppercase tracking-wider backdrop-blur-md">
                    Turnkey Studio
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner group-hover:scale-110 transition-transform">
                    <Palette className="w-4 h-4" />
                  </div>
                </div>

                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <h3 className="text-lg font-black leading-tight drop-shadow-sm">
                    Interior Design & Makeover
                  </h3>
                  <span className="text-xs text-brand-200 font-medium block mt-0.5">
                    See real work before booking
                  </span>
                </div>
              </div>

              {/* Clear Options Checklist */}
              <div className="p-5 space-y-2.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Included Capabilities
                </span>
                <ul className="space-y-2 text-xs text-slate-700">
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                    <span>Completed Flat Handover Portfolios</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                    <span>Interactive 3D Architectural Renders</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                    <span>Free Designer Site Consultation</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-5 pt-0">
              <div className="py-2.5 px-4 rounded-xl bg-brand-50 group-hover:bg-brand-600 text-brand-800 group-hover:text-white font-bold text-xs transition-colors flex items-center justify-between">
                <span>View Portfolios & Designs</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
};
