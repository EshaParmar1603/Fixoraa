import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Wrench,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Briefcase,
  IndianRupee,
  ArrowRight,
  ShieldCheck,
  Palette,
  Utensils,
  Sparkles,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  FileText,
  Building,
  Award,
  Layers,
  Check,
  Eye,
  Camera
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Role, ProviderProfession, PortfolioProject, CatererMenu } from '../../types';
import { INDIAN_CITIES_DISCOM, formatINR } from '../../utils/formatters';
import {
  saveProviderExtra,
  DEFAULT_DESIGNER_PORTFOLIO,
  DEFAULT_CATERER_MENUS
} from '../../utils/providerStorage';

export const Register: React.FC = () => {
  const [role, setRole] = useState<Role>('CUSTOMER');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState(INDIAN_CITIES_DISCOM[0].city);
  const [address, setAddress] = useState('');

  // Provider Profession Selection
  const [profession, setProfession] = useState<ProviderProfession>('technician');

  // Generic Provider Fields
  const [bio, setBio] = useState('');
  const [experienceYears, setExperienceYears] = useState('5');
  const [hourlyRate, setHourlyRate] = useState('450');

  // Interior Designer Specific
  const [councilRegistration, setCouncilRegistration] = useState('CA/2022/94821');
  const [designerThemes, setDesignerThemes] = useState<string[]>([
    'Simple & Minimalist',
    'Modest Indian Modern'
  ]);
  const [pricePerSqFt, setPricePerSqFt] = useState('1850');
  const [portfolioTitle, setPortfolioTitle] = useState('Modern Minimalist 3 BHK Apartment');
  const [portfolioTheme, setPortfolioTheme] = useState('Simple & Minimalist');
  const [portfolioSqFt, setPortfolioSqFt] = useState('1450');
  const [portfolioCost, setPortfolioCost] = useState('2200000');
  const [portfolioImage, setPortfolioImage] = useState('/interiors/simple_minimalist.jpg');
  const [portfolioDesc, setPortfolioDesc] = useState('Turnkey civil & modular cabinetry with Scandinavian aesthetic and hidden storage.');

  // Gourmet Caterer Specific
  const [fssaiNumber, setFssaiNumber] = useState('11223344556677');
  const [catererCuisines, setCatererCuisines] = useState<string[]>([
    'Royal North Indian',
    'South Indian Sadhya',
    'Live Chaat & BBQ'
  ]);
  const [dietaryOptions, setDietaryOptions] = useState<string[]>([
    '100% Pure Veg',
    'Jain / Satvik Friendly',
    'Non-Veg Delicacies'
  ]);
  const [pricePerPlate, setPricePerPlate] = useState('650');
  const [minGuests, setMinGuests] = useState('30');
  const [tastingAvailable, setTastingAvailable] = useState(true);
  const [menuDishName, setMenuDishName] = useState('Kashmiri Dum Pukht Biryani & Truffle Paneer');
  const [menuDishCategory, setMenuDishCategory] = useState<'starter' | 'main' | 'dessert' | 'live_counter'>('main');
  const [menuDishDiet, setMenuDishDiet] = useState<'veg' | 'non-veg' | 'jain'>('veg');
  const [menuDishImage, setMenuDishImage] = useState('https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500');

  // Technician Specific
  const [appliancesHandled, setAppliancesHandled] = useState<string[]>([
    '1.5 Ton Inverter Split AC',
    'Double Door Refrigerator',
    'Front Load Washing Machine',
    'RO Water Purifier',
    'Kitchen Chimney'
  ]);
  const [toolsCertified, setToolsCertified] = useState<string[]>([
    'Digital Manifold',
    'Vacuum Pump',
    'Fluke Clamp Meter',
    'Insulation Megger'
  ]);
  const [guaranteeAgreed, setGuaranteeAgreed] = useState(true);

  // Event Planner Specific
  const [eventTypes, setEventTypes] = useState<string[]>([
    'Weddings & Receptions',
    'Corporate Galas',
    'Private Birthday Extravaganzas'
  ]);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Helper for image upload simulation
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'designer' | 'caterer') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (target === 'designer') {
          setPortfolioImage(reader.result as string);
        } else {
          setMenuDishImage(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleItem = (list: string[], item: string, setter: (val: string[]) => void) => {
    if (list.includes(item)) {
      setter(list.filter((x) => x !== item));
    } else {
      setter([...list, item]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload: any = {
        name,
        email,
        password,
        phone,
        city,
        address,
        role,
      };

      if (role === 'PROVIDER') {
        let compiledBio = bio;
        if (!compiledBio) {
          if (profession === 'designer') {
            compiledBio = `Council of Architecture Certified Architect (${councilRegistration}). Specializing in ${designerThemes.join(', ')} interiors at ₹${pricePerSqFt}/sq.ft.`;
          } else if (profession === 'caterer') {
            compiledBio = `FSSAI Licensed Executive Caterer (${fssaiNumber}). Crafting ${catererCuisines.join(', ')} with customizable tasting sessions. Base ₹${pricePerPlate}/plate.`;
          } else if (profession === 'technician') {
            compiledBio = `Certified Master Technician with ${experienceYears}+ years experience servicing ${appliancesHandled.join(', ')}. 30-day warranty guaranteed.`;
          } else {
            compiledBio = `Luxury Event & Wedding Curator managing end-to-end stage décor, artist bookings, and guest hospitality.`;
          }
        }

        payload.bio = compiledBio;
        payload.experienceYears = parseInt(experienceYears, 10) || 5;
        payload.hourlyRate = parseFloat(hourlyRate) || 450;
      }

      const res = await register(payload);

      // Save specialized provider metadata
      if (role === 'PROVIDER') {
        const identifier = email.toLowerCase().trim();

        // Build sample initial portfolio or menus based on registration inputs
        const initialPortfolios: PortfolioProject[] = [
          {
            id: `port-${Date.now()}`,
            title: portfolioTitle || 'Modern 3 BHK Residence',
            theme: portfolioTheme,
            areaSqFt: parseInt(portfolioSqFt, 10) || 1450,
            cost: parseInt(portfolioCost, 10) || 2200000,
            imageUrl: portfolioImage,
            clientName: name,
            completionDate: 'September 2026',
            description: portfolioDesc,
            tags: designerThemes
          },
          ...DEFAULT_DESIGNER_PORTFOLIO.slice(1)
        ];

        const initialMenus: CatererMenu[] = [
          {
            id: `menu-${Date.now()}`,
            name: menuDishName,
            category: menuDishCategory,
            dietType: menuDishDiet,
            pricePerPlate: parseInt(pricePerPlate, 10) || 650,
            imageUrl: menuDishImage,
            description: `Signature banquet preparation using organic ground spices and cold-pressed oils.`
          },
          ...DEFAULT_CATERER_MENUS.slice(1)
        ];

        saveProviderExtra(identifier, {
          profession,
          specialties:
            profession === 'designer'
              ? designerThemes
              : profession === 'caterer'
              ? catererCuisines
              : profession === 'technician'
              ? appliancesHandled
              : eventTypes,
          hourlyRate: parseFloat(hourlyRate) || 450,
          pricePerSqFt: parseFloat(pricePerSqFt) || 1850,
          pricePerPlate: parseFloat(pricePerPlate) || 650,
          fssaiNumber,
          councilRegistration,
          tastingAvailable,
          minGuests: parseInt(minGuests, 10) || 30,
          portfolioProjects: initialPortfolios,
          catererMenus: initialMenus,
          appliancesHandled,
          toolsCertified,
          eventTypes
        });

        navigate('/provider/dashboard');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 flex items-center justify-center">
      <div className={`w-full transition-all duration-300 ${role === 'PROVIDER' ? 'max-w-4xl' : 'max-w-xl'} bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-2xl space-y-8`}>
        {/* Header Title */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-blue-500 mx-auto flex items-center justify-center text-white shadow-glow">
            <Wrench className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {role === 'PROVIDER' ? 'Service Provider Partner Onboarding' : 'Create Your Fixora Account'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            {role === 'PROVIDER'
              ? 'Join India’s premier verified home services platform. Register as an Interior Designer, Gourmet Caterer, Certified Appliance Pro, or Event Planner.'
              : 'Book background-verified technicians, interior architects, and gourmet caterers with 1-click transparency.'}
          </p>
        </div>

        {/* Role Switcher Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200 max-w-md mx-auto">
          <button
            type="button"
            onClick={() => setRole('CUSTOMER')}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
              role === 'CUSTOMER'
                ? 'bg-white text-brand-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>I'm a Customer</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('PROVIDER')}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
              role === 'PROVIDER'
                ? 'bg-white text-brand-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>I'm a Service Provider</span>
          </button>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center space-x-2">
            <span className="font-bold">Error:</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 text-xs">
          {/* ======================================================== */}
          {/* PROVIDER PROFESSION SELECTOR (IF PROVIDER) */}
          {/* ======================================================== */}
          {role === 'PROVIDER' && (
            <div className="space-y-3">
              <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Select Your Profession & Service Domain:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* 1. Interior Designer */}
                <button
                  type="button"
                  onClick={() => setProfession('designer')}
                  className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between space-y-2 ${
                    profession === 'designer'
                      ? 'border-amber-400 bg-amber-50/50 shadow-md ring-2 ring-amber-400/30'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                      <Palette className="w-5 h-5" />
                    </div>
                    {profession === 'designer' && (
                      <CheckCircle2 className="w-4 h-4 text-amber-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-sm">Interior Designer</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">Upload portfolios & quote per sq.ft</p>
                  </div>
                </button>

                {/* 2. Gourmet Caterer */}
                <button
                  type="button"
                  onClick={() => setProfession('caterer')}
                  className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between space-y-2 ${
                    profession === 'caterer'
                      ? 'border-emerald-400 bg-emerald-50/50 shadow-md ring-2 ring-emerald-400/30'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Utensils className="w-5 h-5" />
                    </div>
                    {profession === 'caterer' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-sm">Gourmet Caterer</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">Upload menus, FSSAI & tastings</p>
                  </div>
                </button>

                {/* 3. Appliance Pro */}
                <button
                  type="button"
                  onClick={() => setProfession('technician')}
                  className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between space-y-2 ${
                    profession === 'technician'
                      ? 'border-blue-400 bg-blue-50/50 shadow-md ring-2 ring-blue-400/30'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                      <Wrench className="w-5 h-5" />
                    </div>
                    {profession === 'technician' && (
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-sm">Appliance Tech</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">AC, Fridge, Washing Machine</p>
                  </div>
                </button>

                {/* 4. Event Planner */}
                <button
                  type="button"
                  onClick={() => setProfession('event_planner')}
                  className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between space-y-2 ${
                    profession === 'event_planner'
                      ? 'border-purple-400 bg-purple-50/50 shadow-md ring-2 ring-purple-400/30'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    {profession === 'event_planner' && (
                      <CheckCircle2 className="w-4 h-4 text-purple-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-sm">Event & Wedding</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">Décor, stages, guest packages</p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* SECTION 1: ACCOUNT CREDENTIALS */}
          {/* ======================================================== */}
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
              1. Basic Account & Contact Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Name / Firm Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={
                      role === 'PROVIDER'
                        ? profession === 'designer'
                          ? 'e.g. Ar. Rajesh Mehta (Studio Design)'
                          : profession === 'caterer'
                          ? 'e.g. Chef Sanjeev & Shahi Caterers'
                          : 'e.g. Vikas Sharma (Master AC Tech)'
                        : 'e.g. Rahul Verma'
                    }
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="pro@fixora.in"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number (+91)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Service City (India)</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition-all"
                  >
                    {INDIAN_CITIES_DISCOM.map((c) => (
                      <option key={c.id} value={c.city}>
                        {c.city}, {c.state} ({c.discom.split(' ')[0]})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Office / Workshop Address</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Studio #402, Indiranagar 100ft Road"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition-all"
                />
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* SECTION 2: PROFESSION-SPECIFIC PORTFOLIO & CREDENTIALS */}
          {/* ======================================================== */}
          {role === 'PROVIDER' && (
            <div className="space-y-6 pt-4 border-t border-slate-100">
              {/* --- INTERIOR DESIGNER SPECIFIC FIELDS --- */}
              {profession === 'designer' && (
                <div className="p-5 sm:p-6 bg-amber-50/40 rounded-3xl border border-amber-200/70 space-y-6">
                  <div className="flex items-center space-x-2.5 border-b border-amber-200/60 pb-3">
                    <Palette className="w-5 h-5 text-amber-600" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        Interior Architecture Credentials & Portfolio Upload
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Homeowners will inspect your verified portfolio before booking zero-fee site consultations.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Council of Architecture / License ID
                      </label>
                      <input
                        type="text"
                        required
                        value={councilRegistration}
                        onChange={(e) => setCouncilRegistration(e.target.value)}
                        placeholder="e.g. CA/2021/84729"
                        className="w-full px-3.5 py-2 rounded-xl border border-amber-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Average Execution Fee (₹ / sq.ft)
                      </label>
                      <div className="relative">
                        <IndianRupee className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="number"
                          required
                          min="800"
                          value={pricePerSqFt}
                          onChange={(e) => setPricePerSqFt(e.target.value)}
                          className="w-full pl-8 pr-3.5 py-2 rounded-xl border border-amber-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Themes Multi-Select */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-2">
                      Design Themes You Specialize In:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Simple & Minimalist',
                        'Modest Indian Modern',
                        'Executive Office Look',
                        'Turnkey Renovation',
                        'Vastu Compliant',
                        'Scandinavian Warmth',
                        'Luxury Contemporary'
                      ].map((theme) => (
                        <button
                          type="button"
                          key={theme}
                          onClick={() => toggleItem(designerThemes, theme, setDesignerThemes)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                            designerThemes.includes(theme)
                              ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300'
                          }`}
                        >
                          {theme}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Portfolio Project Upload Card */}
                  <div className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Award className="w-4 h-4 text-amber-600" />
                        <span className="font-bold text-slate-900 text-xs">
                          Showcase Project #1 (Portfolio Highlight)
                        </span>
                      </div>
                      <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        Shown to Homeowners
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Project Title
                        </label>
                        <input
                          type="text"
                          required
                          value={portfolioTitle}
                          onChange={(e) => setPortfolioTitle(e.target.value)}
                          placeholder="e.g. Modern Minimalist 3 BHK Apartment"
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Area (Sq.Ft)
                        </label>
                        <input
                          type="number"
                          required
                          value={portfolioSqFt}
                          onChange={(e) => setPortfolioSqFt(e.target.value)}
                          placeholder="1450"
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200"
                        />
                      </div>
                    </div>

                    {/* Image Preview & Upload Option */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        High-Resolution 3D Render / Actual Photo:
                      </label>
                      <div className="flex items-center space-x-4">
                        <img
                          src={portfolioImage}
                          alt="Portfolio Preview"
                          className="w-24 h-16 rounded-xl object-cover border border-slate-200 shadow-xs"
                        />
                        <div className="space-y-1.5 flex-1">
                          <label className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer transition-colors text-[11px]">
                            <Camera className="w-3.5 h-3.5" />
                            <span>Upload Project Photo</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleImageFileUpload(e, 'designer')}
                            />
                          </label>
                          <span className="block text-[10px] text-slate-400">
                            Or select from presets below
                          </span>
                        </div>
                      </div>

                      {/* Quick Presets */}
                      <div className="flex items-center space-x-2 mt-2">
                        {[
                          { name: 'Minimalist', url: '/interiors/simple_minimalist.jpg' },
                          { name: 'Modest Indian', url: '/interiors/modest_indian.jpg' },
                          { name: 'Office Look', url: '/interiors/office_look.jpg' },
                          { name: 'Renovated Kitchen', url: '/interiors/renovation_kitchen.jpg' }
                        ].map((p) => (
                          <button
                            type="button"
                            key={p.name}
                            onClick={() => setPortfolioImage(p.url)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-medium border ${
                              portfolioImage === p.url
                                ? 'bg-amber-100 text-amber-800 border-amber-400 font-bold'
                                : 'bg-slate-50 text-slate-600 border-slate-200'
                            }`}
                          >
                            {p.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Design Scope Description
                      </label>
                      <textarea
                        rows={2}
                        value={portfolioDesc}
                        onChange={(e) => setPortfolioDesc(e.target.value)}
                        placeholder="Highlight materials (BWP 710 Plywood, fluted panels, profile lighting)..."
                        className="w-full p-2.5 rounded-xl border border-slate-200"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* --- GOURMET CATERER SPECIFIC FIELDS --- */}
              {profession === 'caterer' && (
                <div className="p-5 sm:p-6 bg-emerald-50/40 rounded-3xl border border-emerald-200/70 space-y-6">
                  <div className="flex items-center space-x-2.5 border-b border-emerald-200/60 pb-3">
                    <Utensils className="w-5 h-5 text-emerald-600" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        Catering Menus & Food Safety Credentials
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Clients will review your culinary portfolio, sample menus, and request pre-event food tastings.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        FSSAI License Registration Number
                      </label>
                      <input
                        type="text"
                        required
                        value={fssaiNumber}
                        onChange={(e) => setFssaiNumber(e.target.value)}
                        placeholder="e.g. 11223344556677"
                        className="w-full px-3.5 py-2 rounded-xl border border-emerald-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Starting Price per Plate (₹)
                      </label>
                      <div className="relative">
                        <IndianRupee className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="number"
                          required
                          min="200"
                          value={pricePerPlate}
                          onChange={(e) => setPricePerPlate(e.target.value)}
                          className="w-full pl-8 pr-3.5 py-2 rounded-xl border border-emerald-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Cuisines & Dietary */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-2">
                      Cuisines You Prepare:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Royal North Indian',
                        'South Indian Sadhya',
                        'Pan-Asian & Dimsums',
                        'Continental & Italian',
                        'Gujarati / Marwari Thali',
                        'Live Chaat & BBQ Counter',
                        'Artisanal Desserts & Mocktails'
                      ].map((c) => (
                        <button
                          type="button"
                          key={c}
                          onClick={() => toggleItem(catererCuisines, c, setCatererCuisines)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                            catererCuisines.includes(c)
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tasting Session Toggle */}
                  <div className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-emerald-200">
                    <div>
                      <span className="font-bold text-slate-900 block text-xs">
                        Offer Pre-Event Food Tasting Sessions?
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        Allows clients to taste test sample boxes before wedding/party bookings.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTastingAvailable(!tastingAvailable)}
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                        tastingAvailable ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          tastingAvailable ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Signature Dish Showcase Card */}
                  <div className="bg-white p-5 rounded-2xl border border-emerald-200/80 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">
                        Featured Signature Dish #1
                      </span>
                      <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Top of Menu
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Dish Name
                        </label>
                        <input
                          type="text"
                          required
                          value={menuDishName}
                          onChange={(e) => setMenuDishName(e.target.value)}
                          placeholder="e.g. Truffle Paneer or Awadhi Biryani"
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Course
                          </label>
                          <select
                            value={menuDishCategory}
                            onChange={(e: any) => setMenuDishCategory(e.target.value)}
                            className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                          >
                            <option value="starter">Starter</option>
                            <option value="main">Main Course</option>
                            <option value="dessert">Dessert</option>
                            <option value="live_counter">Live Counter</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                            Diet
                          </label>
                          <select
                            value={menuDishDiet}
                            onChange={(e: any) => setMenuDishDiet(e.target.value)}
                            className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                          >
                            <option value="veg">Vegetarian</option>
                            <option value="jain">Jain / Satvik</option>
                            <option value="non-veg">Non-Veg</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Dish photo */}
                    <div className="flex items-center space-x-4">
                      <img
                        src={menuDishImage}
                        alt="Dish Preview"
                        className="w-20 h-16 rounded-xl object-cover border border-slate-200 shadow-xs"
                      />
                      <label className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer transition-colors text-[11px]">
                        <Camera className="w-3.5 h-3.5" />
                        <span>Upload Dish Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageFileUpload(e, 'caterer')}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* --- APPLIANCE TECHNICIAN SPECIFIC FIELDS --- */}
              {profession === 'technician' && (
                <div className="p-5 sm:p-6 bg-blue-50/40 rounded-3xl border border-blue-200/70 space-y-6">
                  <div className="flex items-center space-x-2.5 border-b border-blue-200/60 pb-3">
                    <Wrench className="w-5 h-5 text-blue-600" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        Technical Specialization & Diagnostic Toolset
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Verified technicians are dispatched with digital warranty tracking and fixed transparent pricing.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Years of Appliance Repair Experience
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-blue-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Fixed Inspection & Labor Base Rate (₹)
                      </label>
                      <div className="relative">
                        <IndianRupee className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="number"
                          required
                          min="199"
                          value={hourlyRate}
                          onChange={(e) => setHourlyRate(e.target.value)}
                          className="w-full pl-8 pr-3.5 py-2 rounded-xl border border-blue-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Supported Appliances */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-2">
                      Appliances You Repair & Maintain:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        '1.5 Ton Inverter Split AC',
                        'Double Door Refrigerator',
                        'Front Load Washing Machine',
                        'RO Water Purifier',
                        'Kitchen Chimney',
                        'Convection Microwave',
                        'Geyser / Water Heater',
                        'Induction Cooktop'
                      ].map((app) => (
                        <button
                          type="button"
                          key={app}
                          onClick={() => toggleItem(appliancesHandled, app, setAppliancesHandled)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                            appliancesHandled.includes(app)
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                          }`}
                        >
                          {app}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Certified Equipment */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-2">
                      Calibrated Diagnostic Equipment Carried:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Digital Manifold',
                        'Vacuum Pump',
                        'Fluke Clamp Meter',
                        'Insulation Megger',
                        'Nitrogen Pressure Kit',
                        'Thermal Leak Camera'
                      ].map((tool) => (
                        <button
                          type="button"
                          key={tool}
                          onClick={() => toggleItem(toolsCertified, tool, setToolsCertified)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                            toolsCertified.includes(tool)
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                          }`}
                        >
                          {tool}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 30-Day Guarantee agreement */}
                  <label className="flex items-start space-x-2.5 cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={guaranteeAgreed}
                      onChange={(e) => setGuaranteeAgreed(e.target.checked)}
                      className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span className="text-slate-700 text-xs font-medium">
                      I agree to honor Fixora's <strong>30-Day Free Re-service Guarantee</strong> on all repairs completed through this account.
                    </span>
                  </label>
                </div>
              )}

              {/* --- EVENT PLANNER SPECIFIC FIELDS --- */}
              {profession === 'event_planner' && (
                <div className="p-5 sm:p-6 bg-purple-50/40 rounded-3xl border border-purple-200/70 space-y-6">
                  <div className="flex items-center space-x-2.5 border-b border-purple-200/60 pb-3">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        Event Management & Vendor Coordination
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Create memorable weddings, corporate conferences, and private celebrations.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Average Event Budget Managed (₹)
                      </label>
                      <input
                        type="text"
                        value="₹5 Lakhs – ₹50 Lakhs"
                        readOnly
                        className="w-full px-3.5 py-2 rounded-xl border border-purple-200 bg-white text-slate-600"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Vendor Partners Empaneled
                      </label>
                      <input
                        type="text"
                        value="35+ Florists, Sound, DJ, Photographers"
                        readOnly
                        className="w-full px-3.5 py-2 rounded-xl border border-purple-200 bg-white text-slate-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-2">
                      Event Specialties:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Weddings & Receptions',
                        'Corporate Galas',
                        'Cocktail & Sangeet Evenings',
                        'Private Birthday Extravaganzas',
                        'Milestone Anniversaries',
                        'Themed Product Launches'
                      ].map((ev) => (
                        <button
                          type="button"
                          key={ev}
                          onClick={() => toggleItem(eventTypes, ev, setEventTypes)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                            eventTypes.includes(ev)
                              ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300'
                          }`}
                        >
                          {ev}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
          >
            <span>
              {loading
                ? 'Registering Account...'
                : role === 'PROVIDER'
                ? `Complete Registration as ${
                    profession === 'designer'
                      ? 'Interior Designer'
                      : profession === 'caterer'
                      ? 'Gourmet Caterer'
                      : profession === 'technician'
                      ? 'Appliance Technician'
                      : 'Event Planner'
                  }`
                : 'Create Customer Account'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-brand-600 hover:text-brand-700">
            Sign In Here
          </Link>
        </p>
      </div>
    </div>
  );
};
