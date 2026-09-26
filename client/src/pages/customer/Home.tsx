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
  Palette
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

      {/* BILL PREDICTOR FEATURE BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-brand-900 via-indigo-950 to-slate-900 rounded-3xl p-7 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Zap className="w-56 h-56 text-brand-400" />
          </div>
          <div className="space-y-3 max-w-2xl relative z-10">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-amber-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>New Feature: Real-Time Power & Flat Sharing Engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Predict Your Exact Electricity Bill & Split Rent With Flatmates
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Select your Indian city DISCOM tariff, specify AC & appliance hours, calculate rooftop solar net-metering offsets, and generate 1-click WhatsApp splits for your roommates in Indian Rupees (₹).
            </p>
          </div>
          <div className="shrink-0 relative z-10 flex flex-col sm:flex-row gap-3">
            <Link
              to="/bill-predictor"
              className="px-6 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center space-x-2"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>Launch Bill Predictor</span>
            </Link>
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

      {/* AI INTERIOR DESIGN & RENOVATION SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Architectural Interior & Renovation Studio</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Designing a New Home or Renovating?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Select your signature theme (Modest, Simple, Office Look), calculate turnkey budgets, and get allocated certified designers.
            </p>
          </div>
          <Link
            to="/interior-design"
            className="text-xs sm:text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center space-x-1 shrink-0"
          >
            <span>Explore All Themes & Renders</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Theme Card 1: Simple & Minimalist */}
          <Link
            to="/interior-design"
            className="group rounded-3xl overflow-hidden border border-slate-200/80 bg-white hover:shadow-xl transition-all duration-300 flex flex-col"
          >
            <div className="relative h-56 overflow-hidden bg-slate-100">
              <img
                src="/interiors/simple_minimalist.jpg"
                alt="Simple Minimalist Interior"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-slate-950/70 backdrop-blur-md text-white text-xs font-bold">
                🌿 Simple & Minimalist
              </span>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                  Clean Scandinavian & Light Oak
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  Concealed storage, bouclé neutral upholstery, fluted TV panels, and warm indirect cove lighting.
                </p>
              </div>
              <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100 font-bold text-brand-600">
                <span>View 3D Inspo & Rates</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Theme Card 2: Modest & Indian Modern */}
          <Link
            to="/interior-design"
            className="group rounded-3xl overflow-hidden border border-slate-200/80 bg-white hover:shadow-xl transition-all duration-300 flex flex-col"
          >
            <div className="relative h-56 overflow-hidden bg-slate-100">
              <img
                src="/interiors/modest_indian.jpg"
                alt="Modest Indian Modern Interior"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-slate-950/70 backdrop-blur-md text-white text-xs font-bold">
                🪔 Modest & Indian Contemporary
              </span>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                  Teakwood, Brass & Jaali Partitions
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  Warm mustard and terracotta tones, geometric cane screens, and authentic Indian family comfort.
                </p>
              </div>
              <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100 font-bold text-brand-600">
                <span>View 3D Inspo & Rates</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          {/* Theme Card 3: Office Look */}
          <Link
            to="/interior-design"
            className="group rounded-3xl overflow-hidden border border-slate-200/80 bg-white hover:shadow-xl transition-all duration-300 flex flex-col"
          >
            <div className="relative h-56 overflow-hidden bg-slate-100">
              <img
                src="/interiors/office_look.jpg"
                alt="Executive Home Office Look"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-slate-950/70 backdrop-blur-md text-white text-xs font-bold">
                💼 Executive Office Look
              </span>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                  Acoustic Slats & Ergonomic Study
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  Dark walnut wall panels, floating bookshelves, anti-glare task lighting, and executive study desks.
                </p>
              </div>
              <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100 font-bold text-brand-600">
                <span>View 3D Inspo & Rates</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
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
    </div>
  );
};
