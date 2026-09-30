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
  ArrowRight,
  Palette,
  Utensils,
  Wrench,
  Sparkles,
  Plus,
  Trash2,
  ExternalLink,
  IndianRupee,
  Layers,
  Award,
  Upload,
  Camera,
  X,
  ChefHat,
  Home,
  Check,
  Building
} from 'lucide-react';
import { bookingsApi, providersApi } from '../../services/api';
import {
  Booking,
  BookingStatus,
  ProviderProfile,
  ProviderProfession,
  PortfolioProject,
  CatererMenu
} from '../../types';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatINR } from '../../utils/formatters';
import {
  getProviderExtra,
  saveProviderExtra,
  ProviderExtraData,
  DEFAULT_DESIGNER_PORTFOLIO,
  DEFAULT_CATERER_MENUS
} from '../../utils/providerStorage';

export const ProviderDashboard: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);

  // Active Profession & Specialized Data
  const [profession, setProfession] = useState<ProviderProfession>('technician');
  const [providerExtra, setProviderExtra] = useState<ProviderExtraData | null>(null);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'bookings' | 'portfolio' | 'rates'>('bookings');

  // Modals for adding projects / menus
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectTheme, setNewProjectTheme] = useState('Simple & Minimalist');
  const [newProjectSqFt, setNewProjectSqFt] = useState('1600');
  const [newProjectCost, setNewProjectCost] = useState('2800000');
  const [newProjectImage, setNewProjectImage] = useState('/interiors/simple_minimalist.jpg');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  const [showAddMenuModal, setShowAddMenuModal] = useState(false);
  const [newMenuName, setNewMenuName] = useState('');
  const [newMenuCategory, setNewMenuCategory] = useState<'starter' | 'main' | 'dessert' | 'live_counter'>('main');
  const [newMenuDiet, setNewMenuDiet] = useState<'veg' | 'non-veg' | 'jain'>('veg');
  const [newMenuPrice, setNewMenuPrice] = useState('550');
  const [newMenuImage, setNewMenuImage] = useState('https://images.unsplash.com/photo-1544025162-d76694265947?w=500');
  const [newMenuDesc, setNewMenuDesc] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

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

      // Load extra metadata
      const idKey = user?.email || user?.id || 'demo_pro';
      const extra = getProviderExtra(idKey);
      setProviderExtra(extra);
      setProfession(extra.profession);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfessionSwitch = (newProf: ProviderProfession) => {
    setProfession(newProf);
    const idKey = user?.email || user?.id || 'demo_pro';
    const updated = saveProviderExtra(idKey, { profession: newProf });
    setProviderExtra(updated);
  };

  const handleStatusChange = async (bookingId: string, status: BookingStatus) => {
    await bookingsApi.updateStatus(bookingId, status);
    fetchDashboardData();
  };

  // Add Project handler
  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectTitle) return;

    const newProject: PortfolioProject = {
      id: `proj-${Date.now()}`,
      title: newProjectTitle,
      theme: newProjectTheme,
      areaSqFt: parseInt(newProjectSqFt, 10) || 1200,
      cost: parseInt(newProjectCost, 10) || 1800000,
      imageUrl: newProjectImage,
      clientName: user?.name || 'Verified Client',
      completionDate: 'Just Added',
      description: newProjectDesc || 'Custom turnkey execution with BWP 710 plywood cabinetry.',
      tags: [newProjectTheme, 'Turnkey']
    };

    const idKey = user?.email || user?.id || 'demo_pro';
    const updatedProjects = [newProject, ...(providerExtra?.portfolioProjects || DEFAULT_DESIGNER_PORTFOLIO)];
    const saved = saveProviderExtra(idKey, { portfolioProjects: updatedProjects });
    setProviderExtra(saved);
    setShowAddProjectModal(false);
    setNewProjectTitle('');
    setNewProjectDesc('');
  };

  // Add Menu handler
  const handleAddMenu = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMenuName) return;

    const newMenu: CatererMenu = {
      id: `dish-${Date.now()}`,
      name: newMenuName,
      category: newMenuCategory,
      dietType: newMenuDiet,
      pricePerPlate: parseInt(newMenuPrice, 10) || 450,
      imageUrl: newMenuImage,
      description: newMenuDesc || 'Prepared fresh with cold-pressed oils and royal spices.'
    };

    const idKey = user?.email || user?.id || 'demo_pro';
    const updatedMenus = [newMenu, ...(providerExtra?.catererMenus || DEFAULT_CATERER_MENUS)];
    const saved = saveProviderExtra(idKey, { catererMenus: updatedMenus });
    setProviderExtra(saved);
    setShowAddMenuModal(false);
    setNewMenuName('');
    setNewMenuDesc('');
  };

  // Delete project
  const handleDeleteProject = (projId: string) => {
    const idKey = user?.email || user?.id || 'demo_pro';
    const updated = providerExtra?.portfolioProjects.filter((p) => p.id !== projId) || [];
    const saved = saveProviderExtra(idKey, { portfolioProjects: updated });
    setProviderExtra(saved);
  };

  // Delete menu item
  const handleDeleteMenu = (dishId: string) => {
    const idKey = user?.email || user?.id || 'demo_pro';
    const updated = providerExtra?.catererMenus.filter((m) => m.id !== dishId) || [];
    const saved = saveProviderExtra(idKey, { catererMenus: updated });
    setProviderExtra(saved);
  };

  const pendingBookings = bookings.filter((b) => b.status === 'PENDING');
  const activeBookings = bookings.filter((b) => ['CONFIRMED', 'IN_PROGRESS'].includes(b.status));
  const completedBookings = bookings.filter((b) => b.status === 'COMPLETED');
  const totalEarnings = completedBookings.reduce((sum, b) => sum + (b.totalPrice || 2450), 0) + 12850;

  if (loading) {
    return <LoadingSpinner message="Loading partner operations studio..." fullScreen />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* ======================================================== */}
      {/* 1. TOP HEADER & MULTI-PROFESSION SWITCHER */}
      {/* ======================================================== */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <img
              src={
                user?.avatar ||
                profile?.user?.avatar ||
                (profession === 'designer'
                  ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                  : profession === 'caterer'
                  ? 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150'
                  : 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150')
              }
              alt="Provider Avatar"
              className="w-16 h-16 rounded-2xl object-cover ring-4 ring-brand-50 shadow-sm"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                  {user?.name || profile?.user?.name || 'Fixora Partner Studio'}
                </h1>

                {/* Profession Badge */}
                {profession === 'designer' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300">
                    <Palette className="w-3.5 h-3.5 mr-1 text-amber-600" />
                    Council Architect & Interior Designer
                  </span>
                )}
                {profession === 'caterer' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                    <Utensils className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    FSSAI Verified Executive Caterer
                  </span>
                )}
                {profession === 'technician' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-300">
                    <Wrench className="w-3.5 h-3.5 mr-1 text-blue-600" />
                    Master Certified Technician
                  </span>
                )}
                {profession === 'event_planner' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-800 border border-purple-300">
                    <Sparkles className="w-3.5 h-3.5 mr-1 text-purple-600" />
                    Luxury Event & Wedding Planner
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500 mt-1 max-w-xl">
                {profession === 'designer'
                  ? `Council Registration: ${providerExtra?.councilRegistration || 'CA/2021/84729'} • Base Rate: ₹${providerExtra?.pricePerSqFt || 1850}/sq.ft • 45-Day Handover Guaranteed`
                  : profession === 'caterer'
                  ? `FSSAI License: ${providerExtra?.fssaiNumber || '11223344556677'} • Base Plate: ₹${providerExtra?.pricePerPlate || 650} • Food Tasting Sessions Active`
                  : profession === 'technician'
                  ? `Fixed Diagnostic Base: ₹${providerExtra?.hourlyRate || 450} • 30-Day Re-service Guarantee • Calibrated Digital Manifold`
                  : `Empaneled with 35+ Floral & DJ Partners • Custom 3D Stage Visualizations`}
              </p>
            </div>
          </div>

          {/* Availability Toggle */}
          <div className="flex items-center space-x-4 bg-slate-50 p-3 rounded-2xl border border-slate-200/60 self-start md:self-auto">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">
                Partner Dispatching
              </span>
              <span className={`text-xs font-bold ${isAvailable ? 'text-emerald-600' : 'text-slate-500'}`}>
                {isAvailable ? 'Online (Accepting Requests)' : 'Offline (Busy)'}
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

        {/* Demo / Interactive Profession Mode Switcher */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-bold">Active Profession View:</span>
            <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => handleProfessionSwitch('designer')}
                className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center space-x-1 ${
                  profession === 'designer'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Palette className="w-3 h-3" />
                <span>Interior Designer</span>
              </button>
              <button
                onClick={() => handleProfessionSwitch('caterer')}
                className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center space-x-1 ${
                  profession === 'caterer'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Utensils className="w-3 h-3" />
                <span>Gourmet Caterer</span>
              </button>
              <button
                onClick={() => handleProfessionSwitch('technician')}
                className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center space-x-1 ${
                  profession === 'technician'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Wrench className="w-3 h-3" />
                <span>Appliance Pro</span>
              </button>
              <button
                onClick={() => handleProfessionSwitch('event_planner')}
                className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center space-x-1 ${
                  profession === 'event_planner'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>Event Planner</span>
              </button>
            </div>
          </div>

          {/* Quick link to preview live customer page */}
          <Link
            to={
              profession === 'designer'
                ? '/interior-design'
                : profession === 'caterer'
                ? '/caterers'
                : profession === 'event_planner'
                ? '/event-planner'
                : '/services'
            }
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
          >
            <span>Preview Client Studio</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. TAILORED KPI METRICS STRIP */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {profession === 'designer' ? (
          <>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Portfolio Projects
              </span>
              <span className="text-2xl sm:text-3xl font-black text-slate-900">
                {providerExtra?.portfolioProjects.length || 4}
              </span>
              <span className="text-[11px] text-amber-600 font-semibold block flex items-center">
                <Award className="w-3.5 h-3.5 mr-1" /> 100% Verified Renders
              </span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Average Rate
              </span>
              <span className="text-2xl sm:text-3xl font-black text-brand-600">
                ₹{providerExtra?.pricePerSqFt || 1850}
              </span>
              <span className="text-[11px] text-slate-500 block">per square foot</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Consultation Pipeline
              </span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-600">8 Requests</span>
              <span className="text-[11px] text-slate-500 block">Zero-fee site visits</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Architect Rating
              </span>
              <div className="flex items-center space-x-1.5">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">4.9</span>
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              </div>
              <span className="text-[11px] text-slate-500 block">From 42 verified homes</span>
            </div>
          </>
        ) : profession === 'caterer' ? (
          <>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Menu Offerings
              </span>
              <span className="text-2xl sm:text-3xl font-black text-slate-900">
                {providerExtra?.catererMenus.length || 5}
              </span>
              <span className="text-[11px] text-emerald-600 font-semibold block flex items-center">
                <ChefHat className="w-3.5 h-3.5 mr-1" /> FSSAI Food Tested
              </span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Base Plate Rate
              </span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-600">
                ₹{providerExtra?.pricePerPlate || 650}
              </span>
              <span className="text-[11px] text-slate-500 block">Min. {providerExtra?.minGuests || 30} guests</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Tasting Inquiries
              </span>
              <span className="text-2xl sm:text-3xl font-black text-brand-600">5 Sessions</span>
              <span className="text-[11px] text-slate-500 block">Pre-event sample boxes</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Food Safety Rating
              </span>
              <div className="flex items-center space-x-1.5">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">5.0</span>
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              </div>
              <span className="text-[11px] text-slate-500 block">100% Hygiene Score</span>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Completed Repairs
              </span>
              <span className="text-2xl sm:text-3xl font-black text-slate-900">
                {completedBookings.length + 24}
              </span>
              <span className="text-[11px] text-emerald-600 font-semibold block flex items-center">
                <TrendingUp className="w-3.5 h-3.5 mr-1" /> 100% On-time fix
              </span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Active Queue
              </span>
              <span className="text-2xl sm:text-3xl font-black text-brand-600">
                {activeBookings.length + pendingBookings.length}
              </span>
              <span className="text-[11px] text-slate-500 block">In progress or pending</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Estimated Payout
              </span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-600">
                ₹{totalEarnings.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] text-slate-500 block">Direct bank deposit</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Quality Rating
              </span>
              <div className="flex items-center space-x-1.5">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">4.9</span>
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              </div>
              <span className="text-[11px] text-slate-500 block">From 148 reviews</span>
            </div>
          </>
        )}
      </div>

      {/* ======================================================== */}
      {/* 3. DASHBOARD MAIN NAVIGATION TABS */}
      {/* ======================================================== */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'bookings'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Client Bookings & Requests ({pendingBookings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('portfolio')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'portfolio'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          {profession === 'designer' ? (
            <>
              <Palette className="w-4 h-4" />
              <span>Portfolio Projects ({providerExtra?.portfolioProjects.length || 0})</span>
            </>
          ) : profession === 'caterer' ? (
            <>
              <Utensils className="w-4 h-4" />
              <span>Culinary Menus & Tastings ({providerExtra?.catererMenus.length || 0})</span>
            </>
          ) : (
            <>
              <Wrench className="w-4 h-4" />
              <span>Diagnostic Capabilities & Tools</span>
            </>
          )}
        </button>

        <button
          onClick={() => setActiveTab('rates')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
            activeTab === 'rates'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <IndianRupee className="w-4 h-4" />
          <span>Rates & Operating Schedule</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: CLIENT BOOKINGS & REQUESTS */}
      {/* ======================================================== */}
      {activeTab === 'bookings' && (
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
              <span>View Full Queue</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {pendingBookings.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="text-sm font-bold text-slate-800">You're all caught up!</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No new unconfirmed requests. You will receive instant notifications whenever a client books a service, consultation, or food tasting.
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
                      <span>Accept & Confirm</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: PORTFOLIO & SPECIALIZATIONS (DESIGNER / CATERER / TECH) */}
      {/* ======================================================== */}
      {activeTab === 'portfolio' && (
        <div className="space-y-6">
          {/* --- DESIGNER PORTFOLIO VIEW --- */}
          {profession === 'designer' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    My Architectural & Interior Design Showcase
                  </h2>
                  <p className="text-xs text-slate-500">
                    These projects appear in Fixora's Interior Design Studio so clients can explore your work and request consultations.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddProjectModal(true)}
                  className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Upload New Portfolio Project</span>
                </button>
              </div>

              {/* Projects Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(providerExtra?.portfolioProjects || DEFAULT_DESIGNER_PORTFOLIO).map((proj) => (
                  <div
                    key={proj.id}
                    className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="relative h-48 overflow-hidden bg-slate-100">
                        <img
                          src={proj.imageUrl}
                          alt={proj.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-bold text-slate-900 border border-white/50">
                          {proj.theme}
                        </span>
                        <button
                          onClick={() => handleDeleteProject(proj.id)}
                          className="absolute top-3 right-3 p-1.5 rounded-full bg-rose-600/80 text-white hover:bg-rose-700 transition-colors"
                          title="Delete Project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="p-5 space-y-3">
                        <h3 className="font-bold text-slate-900 text-sm leading-snug">
                          {proj.title}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-2">
                          {proj.description}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {proj.tags?.map((t) => (
                            <span
                              key={t}
                              className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-semibold"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">
                          Area Sq.Ft
                        </span>
                        <span className="font-extrabold text-slate-800">
                          {proj.areaSqFt ? `${proj.areaSqFt} sq.ft` : '1,450 sq.ft'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">
                          Total Budget
                        </span>
                        <span className="font-extrabold text-emerald-600">
                          {formatINR(proj.cost || 2200000)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --- CATERER MENUS VIEW --- */}
          {profession === 'caterer' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Signature Culinary Offerings & Tasting Menus
                  </h2>
                  <p className="text-xs text-slate-500">
                    Display your specialty banquet dishes, dietary varieties (Jain, Veg, Non-Veg), and pre-event tasting options.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddMenuModal(true)}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Signature Dish</span>
                </button>
              </div>

              {/* Menu items list */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(providerExtra?.catererMenus || DEFAULT_CATERER_MENUS).map((dish) => (
                  <div
                    key={dish.id}
                    className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="relative h-44 overflow-hidden bg-slate-100">
                        <img
                          src={dish.imageUrl || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500'}
                          alt={dish.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 flex items-center space-x-1.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-md ${
                              dish.dietType === 'jain'
                                ? 'bg-amber-500/90 text-white border-amber-400'
                                : dish.dietType === 'veg'
                                ? 'bg-emerald-600/90 text-white border-emerald-400'
                                : 'bg-rose-600/90 text-white border-rose-400'
                            }`}
                          >
                            {dish.dietType.toUpperCase()}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-white/90 text-[10px] font-semibold text-slate-800 capitalize">
                            {dish.category}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteMenu(dish.id)}
                          className="absolute top-3 right-3 p-1.5 rounded-full bg-rose-600/80 text-white hover:bg-rose-700 transition-colors"
                          title="Delete Dish"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="p-5 space-y-2">
                        <h3 className="font-bold text-slate-900 text-sm">{dish.name}</h3>
                        <p className="text-xs text-slate-500 line-clamp-2">
                          {dish.description}
                        </p>
                      </div>
                    </div>

                    <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Per Plate Base:</span>
                      <span className="font-extrabold text-emerald-600 text-sm">
                        ₹{dish.pricePerPlate || 450} / guest
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --- TECHNICIAN SKILLS VIEW --- */}
          {profession === 'technician' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Diagnostic Capabilities & Supported Appliances
                </h2>
                <p className="text-xs text-slate-500">
                  Your certified appliances matrix and precision diagnostic equipment.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Supported Household Appliances
                  </span>
                  <div className="space-y-2">
                    {(providerExtra?.appliancesHandled || [
                      'Inverter Split AC',
                      'Double Door Refrigerator',
                      'Front Load Washing Machine',
                      'RO Purifier',
                      'Kitchen Chimney'
                    ]).map((app) => (
                      <div
                        key={app}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-800"
                      >
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>{app}</span>
                        </div>
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100/60 px-2 py-0.5 rounded-md">
                          Certified
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Precision Diagnostic Gear
                  </span>
                  <div className="space-y-2">
                    {(providerExtra?.toolsCertified || [
                      'Digital Manifold Gauge',
                      'High-Vacuum Micron Pump',
                      'Fluke Clamp Meter',
                      'Nitrogen Pressure Regulator'
                    ]).map((tool) => (
                      <div
                        key={tool}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-800"
                      >
                        <div className="flex items-center space-x-2">
                          <Wrench className="w-4 h-4 text-blue-600" />
                          <span>{tool}</span>
                        </div>
                        <span className="text-[10px] text-blue-700 font-bold bg-blue-100/60 px-2 py-0.5 rounded-md">
                          Calibrated
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- EVENT PLANNER VIEW --- */}
          {profession === 'event_planner' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Event Curation & Empaneled Vendor Network
                </h2>
                <p className="text-xs text-slate-500">
                  Manage stage styling, audio/visual setups, floral decor, and guest logistics.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { title: 'Weddings & Sangeet', setups: '18 Completed', rating: '5.0 ★' },
                  { title: 'Corporate Conferences', setups: '12 Completed', rating: '4.9 ★' },
                  { title: 'Themed Birthdays', setups: '25 Completed', rating: '4.8 ★' }
                ].map((item) => (
                  <div key={item.title} className="p-4 rounded-2xl bg-purple-50/50 border border-purple-200 space-y-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                    <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-purple-100">
                      <span>{item.setups}</span>
                      <span className="font-bold text-purple-700">{item.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: RATES & OPERATING SCHEDULE */}
      {/* ======================================================== */}
      {activeTab === 'rates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            to="/provider/bookings"
            className="p-6 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl hover:shadow-lg transition-all flex items-center justify-between group"
          >
            <div>
              <h3 className="font-bold text-lg">Job Progression Manager</h3>
              <p className="text-xs text-slate-300 mt-1">
                Confirm appointments, trigger live job start, and complete tasks.
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-brand-400 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to="/provider/availability"
            className="p-6 bg-gradient-to-r from-brand-900 to-slate-900 text-white rounded-3xl hover:shadow-lg transition-all flex items-center justify-between group"
          >
            <div>
              <h3 className="font-bold text-lg">Weekly Operating Schedule</h3>
              <p className="text-xs text-slate-300 mt-1">
                Configure your Monday–Sunday operating hours and break windows.
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-brand-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD PORTFOLIO PROJECT (DESIGNER) */}
      {/* ======================================================== */}
      {showAddProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Palette className="w-5 h-5 text-amber-600" />
                <h3 className="font-extrabold text-slate-900 text-base">
                  Upload Portfolio Project
                </h3>
              </div>
              <button
                onClick={() => setShowAddProjectModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProject} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  required
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  placeholder="e.g. Minimalist Villa in Koramangala"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Design Theme
                  </label>
                  <select
                    value={newProjectTheme}
                    onChange={(e) => setNewProjectTheme(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="Simple & Minimalist">Simple & Minimalist</option>
                    <option value="Modest Indian Modern">Modest Indian Modern</option>
                    <option value="Executive Office Look">Executive Office Look</option>
                    <option value="Turnkey Renovation">Turnkey Renovation</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Area (Sq.Ft)
                  </label>
                  <input
                    type="number"
                    required
                    value={newProjectSqFt}
                    onChange={(e) => setNewProjectSqFt(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Estimated Project Cost (₹)
                </label>
                <input
                  type="number"
                  required
                  value={newProjectCost}
                  onChange={(e) => setNewProjectCost(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              {/* Photo preview / presets */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Project Render Photo
                </label>
                <div className="flex items-center space-x-3 mb-2">
                  <img
                    src={newProjectImage}
                    alt="Preview"
                    className="w-20 h-14 rounded-xl object-cover border"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { name: 'Minimalist', url: '/interiors/simple_minimalist.jpg' },
                      { name: 'Indian', url: '/interiors/modest_indian.jpg' },
                      { name: 'Office', url: '/interiors/office_look.jpg' },
                      { name: 'Kitchen', url: '/interiors/renovation_kitchen.jpg' }
                    ].map((p) => (
                      <button
                        type="button"
                        key={p.name}
                        onClick={() => setNewProjectImage(p.url)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                          newProjectImage === p.url
                            ? 'bg-amber-100 text-amber-800 border-amber-400'
                            : 'bg-slate-50 text-slate-600'
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Brief Description & Key Materials
                </label>
                <textarea
                  rows={2}
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  placeholder="e.g. Full quartz kitchen island, concealed cove lighting..."
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddProjectModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold"
                >
                  Save to Portfolio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD CATERER MENU (CATERER) */}
      {/* ======================================================== */}
      {showAddMenuModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Utensils className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-slate-900 text-base">
                  Add Signature Dish / Tasting Item
                </h3>
              </div>
              <button
                onClick={() => setShowAddMenuModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMenu} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Dish / Course Name
                </label>
                <input
                  type="text"
                  required
                  value={newMenuName}
                  onChange={(e) => setNewMenuName(e.target.value)}
                  placeholder="e.g. Awadhi Murg Dum Biryani or Jain Paneer Pasanda"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Course Category
                  </label>
                  <select
                    value={newMenuCategory}
                    onChange={(e: any) => setNewMenuCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="starter">Starter</option>
                    <option value="main">Main Course</option>
                    <option value="dessert">Dessert</option>
                    <option value="live_counter">Live Counter</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Dietary Classification
                  </label>
                  <select
                    value={newMenuDiet}
                    onChange={(e: any) => setNewMenuDiet(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="veg">Vegetarian</option>
                    <option value="jain">Jain / Satvik</option>
                    <option value="non-veg">Non-Veg</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Base Price per Plate (₹)
                </label>
                <input
                  type="number"
                  required
                  min="100"
                  value={newMenuPrice}
                  onChange={(e) => setNewMenuPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Culinary Description & Ingredients
                </label>
                <textarea
                  rows={2}
                  value={newMenuDesc}
                  onChange={(e) => setNewMenuDesc(e.target.value)}
                  placeholder="e.g. Infused with saffron, royal shahi jeera, and slow dum cooked..."
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMenuModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Add Dish to Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
