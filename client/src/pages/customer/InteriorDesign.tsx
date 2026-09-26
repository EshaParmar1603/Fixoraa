import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Palette,
  Sparkles,
  Home,
  Wrench,
  CheckCircle2,
  ArrowRight,
  Clock,
  IndianRupee,
  Sliders,
  Share2,
  Star,
  ShieldCheck,
  Briefcase,
  Layers,
  RefreshCw,
  FileText,
  Lightbulb,
  Check,
  Calendar,
  MessageSquare,
  Maximize2,
  Compass,
  MapPin,
  Download,
  Building
} from 'lucide-react';
import { formatINR, INDIAN_CITIES_DISCOM } from '../../utils/formatters';

export type ProjectScope = 'new_home' | 'renovation';
export type DesignThemeId = 'modest' | 'simple' | 'office_look' | 'luxury_contemporary';
export type HomeConfig = '1bhk' | '2bhk' | '3bhk' | '4bhk_villa' | 'studio';
export type BudgetTier = 'essential' | 'premium' | 'luxury';

interface DesignTheme {
  id: DesignThemeId;
  name: string;
  tagline: string;
  description: string;
  image: string;
  palette: { name: string; hex: string }[];
  materials: string[];
  lighting: string;
  bestFor: string;
}

const DESIGN_THEMES: DesignTheme[] = [
  {
    id: 'simple',
    name: 'Simple & Minimalist',
    tagline: 'Clean lines, airy neutrals, uncluttered Scandinavian warmth',
    description:
      'Emphasizes functional hidden storage, soft beige and light oak textures, seamless floor-to-ceiling cabinetry, and abundant natural sunlight. Zero visual clutter with maximum calm.',
    image: '/interiors/simple_minimalist.jpg',
    palette: [
      { name: 'Warm Cream', hex: '#F5F2EB' },
      { name: 'Light Oak Wood', hex: '#D2B48C' },
      { name: 'Bouclé Beige', hex: '#E6DCCF' },
      { name: 'Soft Charcoal', hex: '#3E3E3E' },
      { name: 'Sage Accents', hex: '#A3B18A' },
    ],
    materials: ['Natural Light Oak Veneer', 'Matte Anti-Fingerprint Laminate', 'Fluted MDF Paneling', 'Linen & Jute Drapes'],
    lighting: 'Concealed 3000K warm white LED cove channels & minimalist magnetic track lights',
    bestFor: 'Apartments seeking open, clutter-free, and spacious visual aesthetics.',
  },
  {
    id: 'modest',
    name: 'Modest & Indian Modern',
    tagline: 'Warm teakwood, handcrafted brass accents & subtle jaali elegance',
    description:
      'Balanced blend of traditional Indian warmth and contemporary sensibilities. Features elegant geometric wooden jaali screens, cozy mustard and earthy upholstery, brass lamps, and Vastu-optimized living flows.',
    image: '/interiors/modest_indian.jpg',
    palette: [
      { name: 'Warm Teak', hex: '#8B5A2B' },
      { name: 'Mustard Ochre', hex: '#DDAA33' },
      { name: 'Ivory Marble', hex: '#FAF9F6' },
      { name: 'Raw Brass', hex: '#C5A059' },
      { name: 'Terracotta', hex: '#C86D51' },
    ],
    materials: ['Solid Teak Wood & Cane', 'Hand-Crafted Brass Inlays', 'BWP Marine Plywood Core', 'Textured Khadi Fabric'],
    lighting: 'Atmospheric warm ceiling spots, traditional brass pendant, and layered indirect cove glow',
    bestFor: 'Families wanting culturally rooted, welcoming, and timeless Indian home comfort.',
  },
  {
    id: 'office_look',
    name: 'Office Look & Executive Study',
    tagline: 'Acoustic walnut slats, ergonomic study & corporate modern finesse',
    description:
      'Designed specifically for modern remote professionals and entrepreneurs. Features dark acoustic slatted walnut wall panelling, floating executive desks, integrated LED bookshelf displays, dual monitor cable channels, and ergonomic seating.',
    image: '/interiors/office_look.jpg',
    palette: [
      { name: 'Deep Walnut', hex: '#3B2F2F' },
      { name: 'Graphite Black', hex: '#222222' },
      { name: 'Warm Amber LED', hex: '#FFB84C' },
      { name: 'Smoke Glass', hex: '#5A6065' },
      { name: 'Cognac Leather', hex: '#9A5B32' },
    ],
    materials: ['Acoustic Slatted Wall Panels', 'Smoked Toughened Glass', 'Heavy-duty Metal Subframe', 'Full-Grain Leather Touchpoints'],
    lighting: 'Anti-glare 4000K task lighting, warm under-shelf accent strips, and dimmable smart background washes',
    bestFor: 'Techies, founders, and professionals who demand a high-productivity, executive workspace at home.',
  },
  {
    id: 'luxury_contemporary',
    name: 'Luxury Modular Renovation',
    tagline: 'Calacatta gold stone, sage acrylic cabinetry & breakfast counters',
    description:
      'Turnkey luxury remodel featuring seamless quartz countertops, fluted paneling, hydraulic soft-close Blum hardware, integrated under-cabinet lighting, and bespoke dining spaces.',
    image: '/interiors/renovation_kitchen.jpg',
    palette: [
      { name: 'Sage Green', hex: '#607263' },
      { name: 'Calacatta Gold', hex: '#ECE8DF' },
      { name: 'Natural Fluted Ash', hex: '#C2A383' },
      { name: 'Champagne Brass', hex: '#D4AF37' },
      { name: 'Matte Anthracite', hex: '#2F343B' },
    ],
    materials: ['High-Gloss Anti-Scratch Acrylic', 'Calacatta Quartz Slabs', 'Blum Soft-Close Tandem Drawers', 'Anodized Aluminum Profiles'],
    lighting: 'High-CRI 90+ architectural task LEDs and blown glass suspension pendants',
    bestFor: 'Complete home renovations, modular kitchen overhauls, and open-plan luxury homes.',
  },
];

interface DesignerProfile {
  id: string;
  name: string;
  firm: string;
  avatar: string;
  rating: number;
  experienceYears: number;
  projectsCompleted: number;
  specialization: DesignThemeId[];
  city: string;
  consultationFee: number; // in ₹ (0 for initial Fixora consultation)
  awards: string;
  phone: string;
}

const CERTIFIED_DESIGNERS: DesignerProfile[] = [
  {
    id: 'des-1',
    name: 'Ananya Deshmukh',
    firm: 'Studio Vayu Interiors',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    rating: 4.95,
    experienceYears: 11,
    projectsCompleted: 142,
    specialization: ['simple', 'office_look'],
    city: 'Bengaluru',
    consultationFee: 0,
    awards: 'IIID National Design Winner 2024',
    phone: '+91 98451 22345',
  },
  {
    id: 'des-2',
    name: 'Vikramaditya Rao',
    firm: 'Sanskriti Living & Architecture',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    rating: 4.9,
    experienceYears: 14,
    projectsCompleted: 198,
    specialization: ['modest', 'simple'],
    city: 'Mumbai',
    consultationFee: 0,
    awards: 'AD50 Most Influential Indian Architect',
    phone: '+91 98200 44567',
  },
  {
    id: 'des-3',
    name: 'Priya Nambiar',
    firm: 'ErgoWork & Loft Spaces',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    rating: 4.92,
    experienceYears: 9,
    projectsCompleted: 115,
    specialization: ['office_look', 'luxury_contemporary'],
    city: 'Hyderabad',
    consultationFee: 0,
    awards: 'Ergonomic Home Workplace Certified',
    phone: '+91 99890 88712',
  },
  {
    id: 'des-4',
    name: 'Siddharth Mehra',
    firm: 'Atelier Contemporary Living',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    rating: 4.88,
    experienceYears: 12,
    projectsCompleted: 160,
    specialization: ['luxury_contemporary', 'modest'],
    city: 'Delhi-NCR',
    consultationFee: 0,
    awards: 'Turnkey Renovation Excellence Award',
    phone: '+91 98110 99823',
  },
];

export const InteriorDesign: React.FC = () => {
  // Wizard State
  const [projectScope, setProjectScope] = useState<ProjectScope>('new_home');
  const [homeConfig, setHomeConfig] = useState<HomeConfig>('2bhk');
  const [areaSqFt, setAreaSqFt] = useState<number>(1150);
  const [selectedThemeId, setSelectedThemeId] = useState<DesignThemeId>('simple');
  const [budgetTier, setBudgetTier] = useState<BudgetTier>('premium');
  const [selectedCity, setSelectedCity] = useState<string>('Bengaluru');

  // Specific rooms selected for renovation
  const [selectedRooms, setSelectedRooms] = useState<string[]>([
    'Living Room',
    'Modular Kitchen',
    'Master Bedroom',
  ]);

  // AI Prompt Studio State
  const [customAiPrompt, setCustomAiPrompt] = useState<string>('');
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [aiGeneratedNotes, setAiGeneratedNotes] = useState<string | null>(null);

  // Booking / Consultation Modal
  const [showConsultationModal, setShowConsultationModal] = useState<boolean>(false);
  const [consultationBooked, setConsultationBooked] = useState<boolean>(false);
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [consultationDate, setConsultationDate] = useState<string>('');

  const navigate = useNavigate();

  // Current Theme Object
  const currentTheme = useMemo(() => {
    return (
      DESIGN_THEMES.find((t) => t.id === selectedThemeId) || DESIGN_THEMES[0]
    );
  }, [selectedThemeId]);

  // Automatically update area slider based on home configuration presets
  const handleConfigChange = (config: HomeConfig) => {
    setHomeConfig(config);
    if (config === 'studio') setAreaSqFt(550);
    else if (config === '1bhk') setAreaSqFt(700);
    else if (config === '2bhk') setAreaSqFt(1150);
    else if (config === '3bhk') setAreaSqFt(1650);
    else if (config === '4bhk_villa') setAreaSqFt(2600);
  };

  // Pricing calculations per sq. ft. in Indian Rupees
  // Base rates depend on Project Scope & Budget Tier:
  // New Home: Essential (₹1,050/sqft), Premium (₹1,550/sqft), Luxury (₹2,300/sqft)
  // Renovation: Essential (₹750/sqft), Premium (₹1,200/sqft), Luxury (₹1,850/sqft)
  const ratePerSqFt = useMemo(() => {
    if (projectScope === 'new_home') {
      if (budgetTier === 'essential') return 1050;
      if (budgetTier === 'premium') return 1550;
      return 2350;
    } else {
      if (budgetTier === 'essential') return 750;
      if (budgetTier === 'premium') return 1200;
      return 1850;
    }
  }, [projectScope, budgetTier]);

  const totalEstimatedCost = useMemo(() => {
    return areaSqFt * ratePerSqFt;
  }, [areaSqFt, ratePerSqFt]);

  // Cost component breakdowns
  const costBreakdown = useMemo(() => {
    return {
      modularWoodwork: Math.round(totalEstimatedCost * 0.48), // 48% woodwork, wardrobes, kitchen
      falseCeilingLighting: Math.round(totalEstimatedCost * 0.18), // 18% false ceiling & lights
      civilPaintingWallcoverings: Math.round(totalEstimatedCost * 0.16), // 16% paint & walls
      fixturesHardware: Math.round(totalEstimatedCost * 0.12), // 12% fittings, sinks, handles
      designTurnkeySupervision: Math.round(totalEstimatedCost * 0.06), // 6% 3D design & management
    };
  }, [totalEstimatedCost]);

  // Dynamic Designer Allocation matching chosen Theme and City
  const allocatedDesigner = useMemo(() => {
    // 1. Try finding designer specializing in selected theme
    const matched = CERTIFIED_DESIGNERS.find(
      (d) => d.specialization.includes(selectedThemeId) && d.city === selectedCity
    );
    if (matched) return matched;

    // 2. Try matching by specialization alone
    const matchedThemeOnly = CERTIFIED_DESIGNERS.find((d) =>
      d.specialization.includes(selectedThemeId)
    );
    if (matchedThemeOnly) return matchedThemeOnly;

    // 3. Fallback to first certified designer
    return CERTIFIED_DESIGNERS[0];
  }, [selectedThemeId, selectedCity]);

  // Toggle Renovation Room
  const handleToggleRoom = (room: string) => {
    setSelectedRooms((prev) =>
      prev.includes(room) ? prev.filter((r) => r !== room) : [...prev, room]
    );
  };

  // Simulate AI Concept Generation
  const handleGenerateAiInspo = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingAi(true);
    setAiGeneratedNotes(null);

    setTimeout(() => {
      setIsGeneratingAi(false);
      const promptText = customAiPrompt.trim()
        ? `"${customAiPrompt.trim()}"`
        : `a tailor-made ${currentTheme.name} layout`;

      setAiGeneratedNotes(
        `AI Design Agent successfully synthesized ${promptText} for your ${areaSqFt} sq.ft space in ${selectedCity}. ` +
          `Optimized with a ${currentTheme.palette[0].name} baseline, ${currentTheme.materials[0]} accents, and concealed ${currentTheme.lighting.toLowerCase()}. Ready for blueprint translation with ${allocatedDesigner.name}.`
      );
    }, 1200);
  };

  // Handle Free Consultation Booking
  const handleBookConsultation = (e: React.FormEvent) => {
    e.preventDefault();
    setConsultationBooked(true);
    setTimeout(() => {
      setShowConsultationModal(false);
      setConsultationBooked(false);
      setClientName('');
      setClientPhone('');
      setConsultationDate('');
    }, 3500);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 pb-24 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* ======================================================== */}
        {/* HERO HEADER */}
        {/* ======================================================== */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-8 sm:p-12 shadow-2xl border border-slate-800">
          <div className="absolute top-0 right-0 p-12 opacity-15 pointer-events-none">
            <Compass className="w-80 h-80 text-brand-400" />
          </div>

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-amber-300">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>AI Interior Design Studio & Turnkey Renovation</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Design Your Dream Interior With{' '}
              <span className="bg-gradient-to-r from-amber-300 via-brand-300 to-teal-300 bg-clip-text text-transparent">
                Allocated Architects
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              Whether furnishing a <strong>Brand New Home</strong> or planning a{' '}
              <strong>Turnkey Renovation</strong>, choose your signature theme (Modest, Simple, Office Look), calculate exact costs per sq.ft, generate instant AI design inspiration, and get matched with certified interior specialists.
            </p>

            <div className="flex flex-wrap items-center gap-6 pt-3 text-xs text-slate-300 font-semibold">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Zero Inspection / Initial Consultation Fee</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>BWP Grade 710 Plywood 10-Yr Warranty</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>45-Day Move-in Guarantee</span>
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* INTERACTIVE 2-COLUMN DESIGN STUDIO */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Controls, Themes, Area & AI Inspo (7 Cols) */}
          <div className="lg:col-span-7 space-y-8">
            {/* 1. PROJECT SCOPE & HOME CONFIGURATION */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-6">
              <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    1. Project Scope & Space Configuration
                  </h2>
                  <p className="text-xs text-slate-500">
                    Tell us if you are designing a brand-new handover flat or renovating your existing home
                  </p>
                </div>
              </div>

              {/* Project Scope Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                  Interior Project Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setProjectScope('new_home')}
                    className={`p-4 rounded-2xl border text-left transition-all flex items-start space-x-3 ${
                      projectScope === 'new_home'
                        ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-500/20 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        projectScope === 'new_home'
                          ? 'bg-brand-600 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Home className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-sm text-slate-900 block">
                        New Home Interior
                      </span>
                      <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                        Turnkey complete woodwork, ceilings, modular kitchen & lighting
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProjectScope('renovation')}
                    className={`p-4 rounded-2xl border text-left transition-all flex items-start space-x-3 ${
                      projectScope === 'renovation'
                        ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-500/20 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        projectScope === 'renovation'
                          ? 'bg-brand-600 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Wrench className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-sm text-slate-900 block">
                        Home Renovation
                      </span>
                      <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                        Remodel kitchen, update living room, civil repairs, re-paint & polish
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Layout Configuration Pills */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Apartment / House Typology
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-xs font-bold">
                  {[
                    { id: 'studio', label: 'Studio' },
                    { id: '1bhk', label: '1 BHK' },
                    { id: '2bhk', label: '2 BHK' },
                    { id: '3bhk', label: '3 BHK' },
                    { id: '4bhk_villa', label: '4 BHK / Villa' },
                  ].map((cfg) => (
                    <button
                      key={cfg.id}
                      type="button"
                      onClick={() => handleConfigChange(cfg.id as HomeConfig)}
                      className={`py-2.5 px-3 rounded-xl border text-center transition-all ${
                        homeConfig === cfg.id
                          ? 'border-brand-600 bg-brand-600 text-white shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-700'
                      }`}
                    >
                      {cfg.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Area in Sq. Ft. Slider & Direct Input */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Total Carpet Area
                  </label>
                  <div className="flex items-center space-x-1.5 bg-brand-50 px-3 py-1 rounded-xl border border-brand-200">
                    <Maximize2 className="w-3.5 h-3.5 text-brand-600" />
                    <span className="text-sm font-black text-brand-800">
                      {areaSqFt} sq. ft.
                    </span>
                  </div>
                </div>

                <input
                  type="range"
                  min="400"
                  max="3500"
                  step="25"
                  value={areaSqFt}
                  onChange={(e) => setAreaSqFt(Number(e.target.value))}
                  className="w-full accent-brand-600 cursor-pointer"
                />

                <div className="flex justify-between text-[11px] text-slate-400 font-semibold mt-1">
                  <span>400 sq.ft (Compact)</span>
                  <span>1,150 sq.ft (Avg 2BHK)</span>
                  <span>2,000 sq.ft (Spacious)</span>
                  <span>3,500 sq.ft (Villa)</span>
                </div>
              </div>

              {/* Specific rooms for renovation */}
              {projectScope === 'renovation' && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2.5">
                    Target Rooms For Renovation
                  </span>
                  <div className="flex flex-wrap gap-2 text-xs font-semibold">
                    {[
                      'Modular Kitchen',
                      'Living Room',
                      'Master Bedroom',
                      'Home Office / Study',
                      'Dining Space',
                      'Bathrooms & Tiles',
                      'Balcony Deck',
                    ].map((room) => {
                      const active = selectedRooms.includes(room);
                      return (
                        <button
                          key={room}
                          type="button"
                          onClick={() => handleToggleRoom(room)}
                          className={`px-3.5 py-1.5 rounded-xl border transition-all flex items-center space-x-1.5 ${
                            active
                              ? 'border-brand-500 bg-brand-50 text-brand-700'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <Check
                            className={`w-3.5 h-3.5 ${
                              active ? 'opacity-100' : 'opacity-0'
                            }`}
                          />
                          <span>{room}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 2. THEME SELECTION (MODEST, SIMPLE, OFFICE LOOK, LUXURY) */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-6">
              <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    2. Choose Your Interior Design Theme
                  </h2>
                  <p className="text-xs text-slate-500">
                    Select your preferred aesthetic mood to tailor materials, layouts, and allocated designer
                  </p>
                </div>
              </div>

              {/* Theme Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {DESIGN_THEMES.map((theme) => {
                  const isSelected = selectedThemeId === theme.id;
                  return (
                    <div
                      key={theme.id}
                      onClick={() => setSelectedThemeId(theme.id)}
                      className={`group rounded-2xl border-2 transition-all cursor-pointer overflow-hidden flex flex-col justify-between ${
                        isSelected
                          ? 'border-brand-600 ring-4 ring-brand-500/10 shadow-lg'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      {/* Image Thumbnail */}
                      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                        <img
                          src={theme.image}
                          alt={theme.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold">
                          {theme.id === 'simple' && '🌿 Clean & Minimal'}
                          {theme.id === 'modest' && '🪔 Traditional Warmth'}
                          {theme.id === 'office_look' && '💼 Executive Remote Work'}
                          {theme.id === 'luxury_contemporary' && '✨ Turnkey Luxury'}
                        </span>
                        {isSelected && (
                          <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center shadow-md">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                        <div className="absolute bottom-2.5 left-3 right-3 text-white">
                          <h3 className="text-base font-black leading-tight drop-shadow-sm">
                            {theme.name}
                          </h3>
                        </div>
                      </div>

                      {/* Content excerpt */}
                      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {theme.description}
                        </p>

                        {/* Palette Preview Swatches */}
                        <div className="pt-2 border-t border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                            Color Palette
                          </span>
                          <div className="flex items-center space-x-1.5">
                            {theme.palette.map((p) => (
                              <div
                                key={p.name}
                                title={`${p.name} (${p.hex})`}
                                className="w-6 h-6 rounded-full border border-black/10 shadow-inner"
                                style={{ backgroundColor: p.hex }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. AI INSPIRATION GENERATOR & PROMPT STUDIO */}
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-brand-500/20 text-brand-300 flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      3. AI Design Inspiration Generator
                    </h2>
                    <p className="text-xs text-slate-300">
                      Generate bespoke AI layout concepts, lighting advice & color boards tailored to your theme
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-brand-500/30 border border-brand-400/30 text-[10px] font-black uppercase tracking-wider text-brand-200">
                  AI Powered
                </span>
              </div>

              {/* Prompt Input Form */}
              <form onSubmit={handleGenerateAiInspo} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Custom Design Requirement or Room Specifics
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customAiPrompt}
                      onChange={(e) => setCustomAiPrompt(e.target.value)}
                      placeholder={`e.g. Include a fluted TV unit, soundproof study desk, and brass mandir corner for ${areaSqFt} sq.ft`}
                      className="flex-1 px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                    />
                    <button
                      type="submit"
                      disabled={isGeneratingAi}
                      className="px-5 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-lg transition-all flex items-center space-x-1.5 shrink-0"
                    >
                      {isGeneratingAi ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Generate Inspo</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>

              {/* AI Generated Inspiration Preview Card */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <img
                    src={currentTheme.image}
                    alt={currentTheme.name}
                    className="w-full sm:w-44 h-28 object-cover rounded-xl border border-white/20 shadow-md"
                  />
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                        AI Suggested Moodboard: {currentTheme.name}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {areaSqFt} Sq.Ft • {selectedCity}
                      </span>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed">
                      {aiGeneratedNotes ||
                        `AI Synthesis: Tailored for your ${areaSqFt} sq.ft space using ${currentTheme.tagline.toLowerCase()}. Materials specified for high longevity in ${selectedCity} weather.`}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                      <span className="px-2 py-0.5 rounded-md bg-white/10 text-slate-300">
                        💡 {currentTheme.lighting}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Material Checklist Suggested by AI */}
                <div className="pt-3 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {currentTheme.materials.map((mat) => (
                    <div
                      key={mat}
                      className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-center space-x-1.5 text-slate-200 text-[11px]"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{mat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Real-Time Cost Estimator & Allocated Designer (5 Cols) */}
          <div className="lg:col-span-5 space-y-6 sticky top-24">
            {/* 1. ESTIMATED BUDGET & PACKAGE TIER CARD */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Live Interior Cost Forecast
                  </h3>
                  <p className="text-xs text-slate-500">
                    Transparent rates based on {areaSqFt} sq.ft in {selectedCity}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <IndianRupee className="w-4 h-4" />
                </div>
              </div>

              {/* Package Tier Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Quality Tier / Finish Package
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                  {[
                    { id: 'essential', label: 'Essential', sub: '₹850-1,050/sqft' },
                    { id: 'premium', label: 'Premium', sub: '₹1,200-1,550/sqft' },
                    { id: 'luxury', label: 'Luxury', sub: '₹1,850-2,350/sqft' },
                  ].map((tier) => (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setBudgetTier(tier.id as BudgetTier)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        budgetTier === tier.id
                          ? 'border-brand-600 bg-brand-50 text-brand-700 ring-2 ring-brand-500/20'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span className="block">{tier.label}</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {tier.sub}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Huge Price Callout */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-brand-900 to-indigo-950 text-white shadow-md space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-300">
                  Estimated Turnkey Investment
                </span>
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-3xl font-black text-white">
                    {formatINR(totalEstimatedCost)}
                  </span>
                  <span className="text-xs text-brand-200 font-semibold">
                    (@ ₹{ratePerSqFt}/sq.ft)
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 pt-1 border-t border-white/10">
                  Includes 3D designs, materials, carpentry, false ceiling, and execution supervision.
                </p>
              </div>

              {/* Cost Component Breakdown */}
              <div className="space-y-2.5 text-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Material & Execution Breakdown
                </span>

                <div className="flex justify-between text-slate-700">
                  <span>Modular Woodwork & Wardrobes (48%):</span>
                  <span className="font-bold text-slate-900">
                    {formatINR(costBreakdown.modularWoodwork)}
                  </span>
                </div>

                <div className="flex justify-between text-slate-700">
                  <span>False Ceiling & Concealed Lights (18%):</span>
                  <span className="font-bold text-slate-900">
                    {formatINR(costBreakdown.falseCeilingLighting)}
                  </span>
                </div>

                <div className="flex justify-between text-slate-700">
                  <span>Wall Styling, Painting & Polish (16%):</span>
                  <span className="font-bold text-slate-900">
                    {formatINR(costBreakdown.civilPaintingWallcoverings)}
                  </span>
                </div>

                <div className="flex justify-between text-slate-700">
                  <span>Fittings, Sinks & Blum Hardware (12%):</span>
                  <span className="font-bold text-slate-900">
                    {formatINR(costBreakdown.fixturesHardware)}
                  </span>
                </div>

                <div className="flex justify-between text-slate-700">
                  <span>Site Supervision & 3D Renders (6%):</span>
                  <span className="font-bold text-emerald-600">
                    {formatINR(costBreakdown.designTurnkeySupervision)}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. ALLOCATED DESIGNER CARD */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Allocated Interior Designer
                  </h3>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Verified Match
                </span>
              </div>

              {/* Designer Details */}
              <div className="flex items-start space-x-4">
                <img
                  src={allocatedDesigner.avatar}
                  alt={allocatedDesigner.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-200 shadow-md shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex items-center space-x-1.5">
                    <h4 className="font-black text-slate-900 text-base leading-tight">
                      {allocatedDesigner.name}
                    </h4>
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  </div>
                  <span className="text-xs font-bold text-brand-600 block">
                    {allocatedDesigner.firm}
                  </span>
                  <p className="text-[11px] text-slate-400">
                    {allocatedDesigner.awards}
                  </p>

                  <div className="flex items-center space-x-3 text-xs text-slate-600 pt-1">
                    <span className="flex items-center font-bold text-slate-900">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-1" />
                      {allocatedDesigner.rating}
                    </span>
                    <span>•</span>
                    <span>{allocatedDesigner.experienceYears} yrs exp</span>
                    <span>•</span>
                    <span>{allocatedDesigner.projectsCompleted}+ homes</span>
                  </div>
                </div>
              </div>

              {/* Why Matched Badge */}
              <div className="p-3 bg-brand-50/60 rounded-2xl border border-brand-100 text-xs text-brand-900 space-y-1">
                <span className="font-bold flex items-center text-brand-800">
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-brand-600" />
                  Why Allocated:
                </span>
                <p className="text-[11px] text-brand-700 leading-relaxed">
                  Specialist in <strong>{currentTheme.name}</strong> projects for{' '}
                  <strong>{projectScope === 'new_home' ? 'New Apartments' : 'Home Renovations'}</strong> in {selectedCity}.
                </p>
              </div>

              {/* CTA Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConsultationModal(true)}
                  className="w-full py-3.5 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center space-x-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Free In-Home Consultation</span>
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/chat')}
                  className="w-full py-3 px-4 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center justify-center space-x-1.5"
                >
                  <MessageSquare className="w-4 h-4 text-slate-400" />
                  <span>Chat With {allocatedDesigner.name.split(' ')[0]}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* FREE CONSULTATION BOOKING MODAL */}
      {/* ======================================================== */}
      {showConsultationModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider">
                  Fixora Certified Architecture
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  Book Free In-Home Design Consultation
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowConsultationModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {consultationBooked ? (
              <div className="py-8 text-center space-y-3 animate-in fade-in">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-black text-slate-900">
                  Consultation Request Confirmed!
                </h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                  <strong>{allocatedDesigner.name}</strong> from{' '}
                  <strong>{allocatedDesigner.firm}</strong> will contact you to confirm site measurement and bring material samples.
                </p>
              </div>
            ) : (
              <form onSubmit={handleBookConsultation} className="space-y-4">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                  <div className="flex justify-between font-semibold text-slate-700">
                    <span>Project:</span>
                    <span className="text-slate-900 font-bold">
                      {projectScope === 'new_home' ? 'New Home' : 'Renovation'} • {currentTheme.name}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold text-slate-700">
                    <span>Area & Budget:</span>
                    <span className="text-brand-600 font-bold">
                      {areaSqFt} sq.ft • {formatINR(totalEstimatedCost)}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold text-slate-700">
                    <span>Assigned Architect:</span>
                    <span className="text-slate-900 font-bold">
                      {allocatedDesigner.name} ({allocatedDesigner.firm})
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Phone Number (WhatsApp for 3D Renders)
                  </label>
                  <input
                    type="tel"
                    required
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Preferred Date For Site Visit / Call
                  </label>
                  <input
                    type="date"
                    required
                    value={consultationDate}
                    onChange={(e) => setConsultationDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowConsultationModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md transition-colors"
                  >
                    Confirm Free Consultation
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
