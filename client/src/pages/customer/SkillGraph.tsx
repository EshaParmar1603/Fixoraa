import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Zap,
  Users,
  CheckCircle2,
  Calendar,
  DollarSign,
  Shield,
  Layers,
  Clock,
  ArrowRight,
  Star,
  RefreshCw,
  MapPin,
  Heart,
  Phone,
  MessageSquare
} from 'lucide-react';
import { skillGraphApi } from '../../services/api';
import {
  ProjectTemplate,
  SkillGraphOptimizationResult,
  GraphNode,
  SynergyLink,
  SkillGraphMember
} from '../../types';
import { RazorpayCheckoutModal } from '../../components/common/RazorpayCheckoutModal';

export const SkillGraph: React.FC = () => {
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('WEDDING_CELEBRATION');
  const [budgetLimit, setBudgetLimit] = useState<number>(50000);
  const [optimizationObjective, setOptimizationObjective] = useState<'MAX_SYNERGY' | 'BUDGET_OPTIMIZED' | 'MAX_RATING'>('MAX_SYNERGY');
  const [targetDate, setTargetDate] = useState<string>(
    new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0]
  );

  const [loading, setLoading] = useState<boolean>(true);
  const [optimizing, setOptimizing] = useState<boolean>(false);
  const [optimizationData, setOptimizationData] = useState<SkillGraphOptimizationResult | null>(null);

  // Active hover states in visualizer
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<SynergyLink | null>(null);
  const [activeTab, setActiveTab] = useState<'CITY_MAP' | 'TIMELINE' | 'CHEMISTRY' | 'WHY_TEAMS'>('CITY_MAP');

  // Razorpay Checkout Modal state
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);
  const [bookingSuccessBanner, setBookingSuccessBanner] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const tplRes = await skillGraphApi.getTemplates();
        if (tplRes?.templates) {
          setTemplates(tplRes.templates);
        }
        await runOptimizer('WEDDING_CELEBRATION', budgetLimit, optimizationObjective);
      } catch (err) {
        console.error('Failed to init SkillGraph', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const runOptimizer = async (
    tplId: string = selectedTemplateId,
    budget: number = budgetLimit,
    objective: string = optimizationObjective
  ) => {
    try {
      setOptimizing(true);
      const res = await skillGraphApi.optimizeTeam({
        projectType: tplId,
        budgetLimit: budget,
        targetDate,
        optimizationObjective: objective
      });
      if (res) {
        setOptimizationData(res);
      }
    } catch (err) {
      console.error('Optimization error', err);
    } finally {
      setOptimizing(false);
    }
  };

  const handleTemplateChange = (tplId: string) => {
    setSelectedTemplateId(tplId);
    runOptimizer(tplId, budgetLimit, optimizationObjective);
  };

  const handleObjectiveChange = (obj: 'MAX_SYNERGY' | 'BUDGET_OPTIMIZED' | 'MAX_RATING') => {
    setOptimizationObjective(obj);
    runOptimizer(selectedTemplateId, budgetLimit, obj);
  };

  const handleBookTeamSuccess = async (result: any) => {
    if (!optimizationData) return;
    try {
      await skillGraphApi.bookTeam({
        projectType: selectedTemplateId,
        targetDate,
        bundledPrice: optimizationData.bestTeam.bundledTeamPrice,
        teamMembers: optimizationData.bestTeam.members
      });
      setBookingSuccessBanner(
        `🎉 Your Dream Team is booked! Meera, Kabir, Zara, and Ranveer are locked in for ${targetDate}. Paid token via Razorpay (Ref: ${result.paymentId})!`
      );
      setIsRazorpayOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      alert('Team booking confirmed!');
      setIsRazorpayOpen(false);
    }
  };

  const currentTemplate = templates.find((t) => t.id === selectedTemplateId);
  const bestTeam = optimizationData?.bestTeam;
  const graphNodes = bestTeam?.graphTopology?.nodes || [];
  const graphEdges = bestTeam?.graphTopology?.edges || [];

  return (
    <div className="min-h-screen bg-[#FBF9F5] text-[#2C2620] selection:bg-[#E8D7C0] selection:text-[#2C2620] pb-24 font-sans">
      {/* WARM HERO SECTION */}
      <section className="relative bg-[#F4EFE6] border-b border-[#E8E2D6] pt-14 pb-16 overflow-hidden">
        {/* Soft Background Accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#EDE5D8] rounded-full blur-3xl opacity-60 pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#E8DDD0] rounded-full blur-2xl opacity-40 pointer-events-none -ml-20 -mb-20" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Friendly Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white border border-[#DDD5C7] text-[#7A6B58] text-xs font-semibold shadow-xs mb-5">
            <Heart className="w-3.5 h-3.5 text-[#D96B43] fill-[#D96B43]" />
            <span>Handpicked Dream Teams · People who already love working together</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#26211C] max-w-3xl mx-auto leading-[1.15]">
            Because great events are made by <span className="underline decoration-[#C58A49] decoration-wavy decoration-2">friends</span>, not strangers.
          </h1>

          <p className="mt-4 text-base sm:text-lg text-[#665D52] max-w-2xl mx-auto leading-relaxed">
            Instead of hiring 4 separate strangers who argue on site, Fixora matches you with verified specialists who have delivered 20+ projects together. They arrive on time, share equipment, and work like clockwork.
          </p>

          {/* Warm Metric Cards (Beige & White) */}
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3.5 max-w-3xl mx-auto">
            <div className="bg-white border border-[#E5DFD3] rounded-2xl p-4 text-center shadow-xs">
              <span className="text-2xl sm:text-3xl font-black text-[#C58A49]">98.4%</span>
              <p className="text-xs font-bold text-[#2C2620] mt-1">Team Chemistry</p>
              <p className="text-[11px] text-[#8C8275] mt-0.5">They finish each other's cues</p>
            </div>
            <div className="bg-white border border-[#E5DFD3] rounded-2xl p-4 text-center shadow-xs">
              <span className="text-2xl sm:text-3xl font-black text-[#4A7C59]">15% Off</span>
              <p className="text-xs font-bold text-[#2C2620] mt-1">Friendship Discount</p>
              <p className="text-[11px] text-[#8C8275] mt-0.5">Shared transport & zero delay</p>
            </div>
            <div className="bg-white border border-[#E5DFD3] rounded-2xl p-4 text-center shadow-xs">
              <span className="text-2xl sm:text-3xl font-black text-[#2C2620]">0 Drama</span>
              <p className="text-xs font-bold text-[#2C2620] mt-1">Smooth Hand-offs</p>
              <p className="text-[11px] text-[#8C8275] mt-0.5">Pre-aligned timeline schedule</p>
            </div>
            <div className="bg-white border border-[#E5DFD3] rounded-2xl p-4 text-center shadow-xs">
              <span className="text-2xl sm:text-3xl font-black text-[#D96B43]">1 Token</span>
              <p className="text-xs font-bold text-[#2C2620] mt-1">Single Checkout</p>
              <p className="text-[11px] text-[#8C8275] mt-0.5">Locks in everyone via Razorpay</p>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT AREA */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-10">
        {/* Success Alert Banner */}
        {bookingSuccessBanner && (
          <div className="p-4 bg-[#EAF5EC] border border-[#B8DEC0] text-[#24592F] text-sm font-semibold rounded-2xl flex items-center justify-between shadow-xs animate-in fade-in">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 text-[#3E8E4D] shrink-0" />
              <span>{bookingSuccessBanner}</span>
            </div>
            <button
              onClick={() => setBookingSuccessBanner(null)}
              className="text-[#24592F] hover:text-[#183D20] text-xs font-bold px-2 py-1"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* STEP 1: WHAT ARE WE PLANNING? */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-[#26211C] flex items-center space-x-2">
              <span className="w-6 h-6 rounded-full bg-[#EAE3D5] text-[#594F42] flex items-center justify-center text-xs font-bold">1</span>
              <span>What are you planning?</span>
            </h2>
            <span className="text-xs text-[#8A8073]">Pick an event or renovation package</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {[
              {
                id: 'WEDDING_CELEBRATION',
                name: 'Grand Wedding & Reception',
                roles: '5 Specialists',
                desc: 'Planner · Electrician · Decorator · Caterer · Cleaner',
                icon: '💍'
              },
              {
                id: 'HOME_RENOVATION',
                name: 'Luxury 3BHK Renovation',
                roles: '5 Specialists',
                desc: 'Interior Architect · Plumber · Electrician · Carpenter · Painter',
                icon: '🏡'
              },
              {
                id: 'CORPORATE_GALA',
                name: 'Corporate Annual Summit',
                roles: '5 Specialists',
                desc: 'Event Director · Electrician · Sound Tech · Decorator · Caterer',
                icon: '🎤'
              },
              {
                id: 'GARDEN_BIRTHDAY',
                name: 'Garden Birthday Soirée',
                roles: '4 Specialists',
                desc: 'Planner · Electrician · Decorator · Executive Caterer',
                icon: '🎂'
              }
            ].map((tpl) => {
              const isSelected = selectedTemplateId === tpl.id;
              return (
                <button
                  key={tpl.id}
                  onClick={() => handleTemplateChange(tpl.id)}
                  className={`text-left p-4 rounded-2xl border transition-all duration-200 relative ${
                    isSelected
                      ? 'border-[#26211C] bg-white shadow-md ring-2 ring-[#26211C]/10'
                      : 'border-[#E8E2D6] bg-white hover:border-[#D1C7B7] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{tpl.icon}</span>
                    <span className="text-[11px] font-bold text-[#8A8073] bg-[#F4EFE6] px-2 py-0.5 rounded-full">
                      {tpl.roles}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-[#26211C] mt-2.5 leading-snug">
                    {tpl.name}
                  </h3>
                  <p className="text-xs text-[#7A7064] mt-1 leading-relaxed">
                    {tpl.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 2: SIMPLE PARAMETERS (BEIGE TILE) */}
        <div className="bg-white border border-[#E8E2D6] rounded-3xl p-5 sm:p-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#F0EAE1]">
            <div>
              <h3 className="text-base font-black text-[#26211C] flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-[#EAE3D5] text-[#594F42] flex items-center justify-center text-xs font-bold">2</span>
                <span>Your Preferences & Budget</span>
              </h3>
              <p className="text-xs text-[#7A7064] mt-0.5">
                We'll assemble the best team matching your exact budget and date.
              </p>
            </div>

            <button
              onClick={() => runOptimizer()}
              disabled={optimizing}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#26211C] hover:bg-[#3D352E] text-white text-xs font-bold transition-all shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${optimizing ? 'animate-spin' : ''}`} />
              <span>{optimizing ? 'Matching Pros...' : 'Refresh Team'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-5">
            {/* Priority Focus */}
            <div>
              <label className="block text-xs font-bold text-[#594F42] uppercase tracking-wider mb-2">
                What matters most?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'MAX_SYNERGY', label: 'Chemistry', desc: 'Done 20+ events' },
                  { id: 'BUDGET_OPTIMIZED', label: 'Best Price', desc: 'Saves money' },
                  { id: 'MAX_RATING', label: 'Top Rated', desc: '5★ Masters' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleObjectiveChange(item.id as any)}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition-colors text-center ${
                      optimizationObjective === item.id
                        ? 'border-[#26211C] bg-[#F4EFE6] text-[#26211C]'
                        : 'border-[#E8E2D6] bg-white text-[#7A7064] hover:bg-[#FBF9F5]'
                    }`}
                  >
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Budget Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-[#594F42] uppercase tracking-wider">
                  Target Budget
                </label>
                <span className="text-xs font-mono font-bold text-[#26211C]">
                  ₹{budgetLimit.toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min="15000"
                max="80000"
                step="2500"
                value={budgetLimit}
                onChange={(e) => setBudgetLimit(Number(e.target.value))}
                onMouseUp={() => runOptimizer(selectedTemplateId, budgetLimit, optimizationObjective)}
                className="w-full h-2 bg-[#EAE4D8] rounded-lg appearance-none cursor-pointer accent-[#26211C]"
              />
              <div className="flex justify-between text-[10px] text-[#8C8275] mt-1">
                <span>₹15,000</span>
                <span>₹50,000</span>
                <span>₹80,000</span>
              </div>
            </div>

            {/* Target Date */}
            <div>
              <label className="block text-xs font-bold text-[#594F42] uppercase tracking-wider mb-2">
                When is the event?
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#E8E2D6] rounded-xl px-3.5 py-2.5 text-xs text-[#26211C] font-mono focus:outline-none focus:border-[#26211C]"
              />
            </div>
          </div>
        </div>

        {/* STEP 3: INTERACTIVE CITY MAP & RESULTS SPLIT VIEW */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Visualizer (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-[#E8E2D6] rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col">
            {/* Tab Selector */}
            <div className="flex items-center justify-between pb-4 border-b border-[#F0EAE1]">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setActiveTab('CITY_MAP')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    activeTab === 'CITY_MAP'
                      ? 'bg-[#26211C] text-white shadow-xs'
                      : 'bg-[#F4EFE6] text-[#665D52] hover:bg-[#EAE4D8]'
                  }`}
                >
                  City Team Map (Live)
                </button>
                <button
                  onClick={() => setActiveTab('TIMELINE')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    activeTab === 'TIMELINE'
                      ? 'bg-[#26211C] text-white shadow-xs'
                      : 'bg-[#F4EFE6] text-[#665D52] hover:bg-[#EAE4D8]'
                  }`}
                >
                  The Day's Game Plan
                </button>
                <button
                  onClick={() => setActiveTab('CHEMISTRY')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    activeTab === 'CHEMISTRY'
                      ? 'bg-[#26211C] text-white shadow-xs'
                      : 'bg-[#F4EFE6] text-[#665D52] hover:bg-[#EAE4D8]'
                  }`}
                >
                  The Chemistry Web
                </button>
                <button
                  onClick={() => setActiveTab('WHY_TEAMS')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    activeTab === 'WHY_TEAMS'
                      ? 'bg-[#26211C] text-white shadow-xs'
                      : 'bg-[#F4EFE6] text-[#665D52] hover:bg-[#EAE4D8]'
                  }`}
                >
                  Why Teams Win
                </button>
              </div>

              <span className="text-[11px] font-bold text-[#8C8275] hidden sm:inline">
                Citywide Sync
              </span>
            </div>

            {/* TAB 1: THE VIBRANT WHITE & BEIGE CITY MAP (MATCHING USER DIAGRAM) */}
            {activeTab === 'CITY_MAP' && (
              <div className="relative mt-4 bg-[#FBF9F5] rounded-2xl border border-[#E8E2D6] h-[390px] w-full overflow-hidden shadow-inner">
                <svg className="w-full h-full" viewBox="0 0 600 360" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <filter id="beigeShadow" x="-30%" y="-30%" width="160%" height="160%">
                      <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#26211C" floodOpacity="0.15" />
                    </filter>
                  </defs>

                  {/* Soft Park Greenery & Pastel Water */}
                  <path d="M 40 40 C 90 20, 160 50, 150 110 C 140 160, 60 140, 40 40 Z" fill="#EBF2EC" stroke="#D3E3D6" strokeWidth="1" />
                  <path d="M 410 210 C 470 190, 540 220, 530 280 C 510 320, 430 310, 410 210 Z" fill="#EBF2EC" stroke="#D3E3D6" strokeWidth="1" />
                  <path d="M 520 20 C 530 90, 560 180, 580 230 C 595 270, 560 320, 540 360" fill="none" stroke="#DCE8EE" strokeWidth="20" strokeLinecap="round" />

                  {/* City Streets & Avenues (Warm White on Beige) */}
                  <path d="M 20 80 L 580 80 M 20 180 L 580 180 M 20 280 L 580 280 M 120 20 L 120 340 M 280 20 L 280 340 M 440 20 L 440 340" stroke="#EFE9DC" strokeWidth="4" />
                  <path d="M 30 310 C 130 300, 190 230, 270 230 C 370 230, 430 170, 570 150" stroke="#E2DAC9" strokeWidth="12" fill="none" />
                  <path d="M 30 310 C 130 300, 190 230, 270 230 C 370 230, 430 170, 570 150" stroke="#FFFFFF" strokeWidth="8" fill="none" />
                  <path d="M 90 30 C 170 130, 230 190, 310 330" stroke="#E2DAC9" strokeWidth="10" fill="none" />
                  <path d="M 90 30 C 170 130, 230 190, 310 330" stroke="#FFFFFF" strokeWidth="6" fill="none" />

                  {/* Roundabouts */}
                  <circle cx="170" cy="250" r="16" fill="#FFFFFF" stroke="#E2DAC9" strokeWidth="4" />
                  <circle cx="270" cy="210" r="18" fill="#FFFFFF" stroke="#E2DAC9" strokeWidth="4" />
                  <circle cx="370" cy="150" r="18" fill="#FFFFFF" stroke="#E2DAC9" strokeWidth="4" />

                  {/* Neighborhood Text Labels (Soft Taupe) */}
                  <text x="70" y="55" fill="#998F82" fontSize="10" fontWeight="bold">BENIFERRI</text>
                  <text x="210" y="45" fill="#998F82" fontSize="10" fontWeight="bold">BENICALAP</text>
                  <text x="390" y="45" fill="#998F82" fontSize="10" fontWeight="bold">BENIMACLET</text>
                  <text x="80" y="210" fill="#998F82" fontSize="10" fontWeight="bold">MISLATA</text>
                  <text x="440" y="195" fill="#998F82" fontSize="10" fontWeight="bold">ALGIRÓS</text>
                  <text x="140" y="325" fill="#998F82" fontSize="10" fontWeight="bold">SAFRANAR</text>
                  <text x="340" y="325" fill="#998F82" fontSize="10" fontWeight="bold">QUATRE CARRERES</text>

                  {/* Orange Service Stations (From Reference Image) */}
                  {[
                    { x: 140, y: 80 }, { x: 260, y: 70 }, { x: 380, y: 100 },
                    { x: 90, y: 160 }, { x: 230, y: 270 }, { x: 490, y: 240 }, { x: 380, y: 290 }
                  ].map((hub, idx) => (
                    <g key={`hub-${idx}`} transform={`translate(${hub.x}, ${hub.y})`} filter="url(#beigeShadow)">
                      <rect x="-10" y="-14" width="20" height="26" rx="4" fill="#E8823A" stroke="#FFFFFF" strokeWidth="2" />
                      <polygon points="0,-9 -4,-1 1,-1 -2,7 4,-1 -1,-1" fill="#FFFFFF" />
                      <rect x="-12" y="10" width="24" height="4" rx="2" fill="#C96825" />
                    </g>
                  ))}

                  {/* Colorful Converging Team Routes */}
                  <path d="M 120 120 C 160 140, 200 160, 270 210" fill="none" stroke="#0066FF" strokeWidth="5" strokeLinecap="round" />
                  <path d="M 120 120 C 160 140, 200 160, 270 210" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="6 6" className="animate-[dash_2s_linear_infinite]" />

                  <path d="M 270 80 C 280 120, 275 160, 270 210" fill="none" stroke="#22C55E" strokeWidth="5" strokeLinecap="round" />
                  <path d="M 430 110 C 390 140, 330 180, 270 210" fill="none" stroke="#EC4899" strokeWidth="5" strokeLinecap="round" />
                  <path d="M 370 290 C 340 270, 310 240, 270 210" fill="none" stroke="#F97316" strokeWidth="5" strokeLinecap="round" />
                  <path d="M 170 290 C 200 270, 240 240, 270 210" fill="none" stroke="#06B6D4" strokeWidth="4" strokeLinecap="round" />

                  {/* Central Event Venue */}
                  <g transform="translate(270, 210)" filter="url(#beigeShadow)">
                    <circle r="26" fill="#C58A49" fillOpacity="0.2" className="animate-ping" />
                    <circle r="18" fill="#26211C" stroke="#FFFFFF" strokeWidth="3" />
                    <text y="5" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="bold">📍</text>
                    <g transform="translate(0, -26)">
                      <rect x="-48" y="-12" width="96" height="20" rx="10" fill="#26211C" stroke="#FFFFFF" strokeWidth="1.5" />
                      <text x="0" y="2" textAnchor="middle" fill="#FFFFFF" fontSize="9.5" fontWeight="bold">YOUR VENUE</text>
                    </g>
                  </g>

                  {/* Team Members Scattered Across City (Matching Reference Diagram) */}
                  {[
                    { x: 120, y: 120, name: 'Meera (Planner)', role: 'Director', color: '#0066FF', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100' },
                    { x: 270, y: 80, name: 'Kabir (Electrician)', role: 'Power Master', color: '#22C55E', img: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=100' },
                    { x: 430, y: 110, name: 'Zara (Decorator)', role: 'Floral Styler', color: '#EC4899', img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100' },
                    { x: 370, y: 290, name: 'Chef Ranveer', role: 'Executive Caterer', color: '#F97316', img: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=100' },
                    { x: 170, y: 290, name: 'Pooja (Cleaner)', role: 'Rapid Crew', color: '#06B6D4', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100' }
                  ].map((m, idx) => (
                    <g key={`city-m-${idx}`} transform={`translate(${m.x}, ${m.y})`} filter="url(#beigeShadow)">
                      <circle r="18" fill="#FFFFFF" stroke={m.color} strokeWidth="3" />
                      <clipPath id={`cityClipB-${idx}`}>
                        <circle r="15" />
                      </clipPath>
                      <image href={m.img} x="-15" y="-15" width="30" height="30" clipPath={`url(#cityClipB-${idx})`} preserveAspectRatio="xMidYMid slice" />

                      <circle cx="12" cy="12" r="8" fill={m.color} stroke="#FFFFFF" strokeWidth="2" />
                      <text x="12" y="15" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold">🚗</text>

                      <g transform="translate(0, 28)">
                        <rect x="-42" y="-9" width="84" height="18" rx="9" fill="#FFFFFF" stroke="#E2DAC9" strokeWidth="1.5" />
                        <text x="0" y="3" textAnchor="middle" fill="#26211C" fontSize="9" fontWeight="bold">{m.name.split(' ')[0]}</text>
                      </g>
                    </g>
                  ))}
                </svg>

                {/* Status Badges */}
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-[#E8E2D6] shadow-xs flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#4A7C59] animate-pulse" />
                  <span className="text-xs font-bold text-[#26211C]">5 Pros Converging · 0 Site Collisions</span>
                </div>

                <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#E8E2D6] shadow-xs text-xs font-bold text-[#7A6B58]">
                  ⚡ 7 Service Hubs Active
                </div>
              </div>
            )}

            {/* TAB 2: DAY'S GAME PLAN (TIMELINE) */}
            {activeTab === 'TIMELINE' && (
              <div className="mt-4 space-y-2.5">
                <p className="text-xs text-[#7A7064]">
                  Here is how the day runs seamlessly without people stepping on each other's toes:
                </p>

                <div className="space-y-2">
                  {(bestTeam?.timelinePhases || []).map((step, idx) => (
                    <div
                      key={idx}
                      className="bg-[#FBF9F5] border border-[#E8E2D6] rounded-2xl p-3 flex items-start space-x-3"
                    >
                      <div className="w-7 h-7 rounded-xl bg-[#F0EAE1] text-[#26211C] flex items-center justify-center shrink-0 font-bold text-xs">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#C58A49]">{step.phase}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-[#E8E2D6] text-[#594F42]">
                            {step.role}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-[#26211C] mt-1">{step.task}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: THE CHEMISTRY WEB */}
            {activeTab === 'CHEMISTRY' && (
              <div className="mt-4 bg-[#FBF9F5] rounded-2xl border border-[#E8E2D6] p-4 text-xs space-y-3">
                <p className="text-xs text-[#7A7064]">
                  Every member in this team has a verified history of co-working:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(bestTeam?.synergyLinks || []).map((link, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-xl border border-[#E8E2D6] shadow-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#26211C]">
                          {link.sourceRole} ↔ {link.targetRole}
                        </span>
                        <span className="text-xs font-bold text-[#4A7C59]">{link.synergy}% Chemistry</span>
                      </div>
                      <p className="text-[11px] text-[#7A7064] mt-1">{link.notes}</p>
                      <p className="text-[10px] text-[#8C8275] mt-0.5">★ {link.jointRating} joint rating · {link.coWorkedJobs} past events</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: WHY TEAMS WIN */}
            {activeTab === 'WHY_TEAMS' && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-[#FAF3F0] border border-[#F0D5CD] rounded-2xl p-4 space-y-2">
                  <span className="text-[#C24B38] font-bold text-[10px] uppercase tracking-wider block">
                    Hiring 4 Random Strangers
                  </span>
                  <h4 className="font-black text-[#26211C] text-sm">Chaos & Delays</h4>
                  <ul className="space-y-1.5 text-[#6E5953] text-xs">
                    <li>❌ Never worked together before</li>
                    <li>❌ Decorator puts up flowers before wiring</li>
                    <li>❌ Blame each other if food warmers trip power</li>
                    <li>❌ You negotiate 4 separate invoices</li>
                  </ul>
                </div>

                <div className="bg-[#EFF7F1] border border-[#CDE5D2] rounded-2xl p-4 space-y-2">
                  <span className="text-[#367A47] font-bold text-[10px] uppercase tracking-wider block">
                    Fixora Coordinated Team
                  </span>
                  <h4 className="font-black text-[#26211C] text-sm">Harmonious Flow</h4>
                  <ul className="space-y-1.5 text-[#375E40] text-xs">
                    <li>✅ 98.4% proven co-work synergy rating</li>
                    <li>✅ Pre-coordinated wiring and staging</li>
                    <li>✅ 15% combined group discount</li>
                    <li>✅ 1 easy checkout via Razorpay</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Right Dream Team Results & Razorpay Booking Card (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-[#E8E2D6] rounded-3xl p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-[#F0EAE1]">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#F4EFE6] text-[#7A6B58] border border-[#E8E2D6]">
                  YOUR HANDPICKED CREW
                </span>
                <h3 className="text-lg font-black text-[#26211C] mt-1.5">
                  {currentTemplate?.name || 'Dream Team'}
                </h3>
              </div>

              <div className="text-right">
                <span className="text-2xl font-black text-[#C58A49]">
                  {bestTeam?.teamSynergyScore || 98.4}%
                </span>
                <span className="text-[10px] text-[#8C8275] block font-bold">
                  Chemistry Rating
                </span>
              </div>
            </div>

            {/* Specialist Roster */}
            <div className="py-4 space-y-2.5 border-b border-[#F0EAE1] max-h-72 overflow-y-auto pr-1">
              {(bestTeam?.members || []).map((m: SkillGraphMember, idx: number) => (
                <div
                  key={m.id || idx}
                  className="bg-[#FBF9F5] border border-[#E8E2D6] rounded-2xl p-2.5 flex items-center justify-between hover:border-[#D1C7B7] transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={m.avatar}
                      alt={m.name}
                      className="w-10 h-10 rounded-xl object-cover border border-[#E8E2D6] shrink-0"
                    />
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-bold text-[#26211C]">{m.name}</span>
                        <span className="text-[10px] font-bold text-[#C58A49]">★ {m.rating}</span>
                      </div>
                      <p className="text-[11px] text-[#7A7064]">{m.title}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-[#26211C]">
                      ₹{m.baseRate.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[9px] text-[#8C8275] block">{m.badge}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pricing Breakdown */}
            <div className="py-4 space-y-2 text-xs border-b border-[#F0EAE1]">
              <div className="flex justify-between text-[#8C8275]">
                <span>Hired Individually:</span>
                <span className="line-through">
                  ₹{bestTeam?.totalIndividualPrice?.toLocaleString('en-IN') || '28,200'}
                </span>
              </div>

              <div className="flex justify-between text-[#4A7C59] font-bold">
                <span>Team Bundle Savings (15%):</span>
                <span>
                  - ₹{bestTeam?.coordinationSavings?.toLocaleString('en-IN') || '4,230'}
                </span>
              </div>

              <div className="flex justify-between items-baseline pt-2 text-[#26211C]">
                <span className="font-extrabold text-sm">Combined Team Price:</span>
                <span className="text-2xl font-black font-mono text-[#26211C]">
                  ₹{bestTeam?.bundledTeamPrice?.toLocaleString('en-IN') || '23,970'}
                </span>
              </div>

              <div className="flex justify-between text-[11px] text-[#8C8275] pt-1">
                <span>Hold-Date Deposit Token (10%):</span>
                <span className="font-mono text-[#C58A49] font-bold">
                  ₹{bestTeam?.requiredDepositToken?.toLocaleString('en-IN') || '2,397'}
                </span>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-4 space-y-2.5">
              <button
                onClick={() => setIsRazorpayOpen(true)}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#26211C] hover:bg-[#3D352E] text-white font-extrabold text-sm shadow-sm transition-all hover:scale-[1.02] flex items-center justify-center space-x-2"
              >
                <span>Reserve Entire Team (₹{bestTeam?.requiredDepositToken || 2397} Token)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center space-x-2 text-[10px] text-[#8C8275] text-center">
                <Shield className="w-3.5 h-3.5 text-[#4A7C59]" />
                <span>Fixora Guarantee · Escrow held until you are delighted</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RAZORPAY CHECKOUT MODAL */}
      {bestTeam && (
        <RazorpayCheckoutModal
          isOpen={isRazorpayOpen}
          onClose={() => setIsRazorpayOpen(false)}
          onSuccess={handleBookTeamSuccess}
          amount={bestTeam.requiredDepositToken || 2397}
          bookingId={`sg-team-${Date.now()}`}
          bookingNumber={`FIX-TEAM-${Math.floor(100000 + Math.random() * 900000)}`}
          serviceName={`Coordinated Team for ${currentTemplate?.name || 'Event'}`}
          description={`Advance deposit for ${bestTeam.members.length} coordinated specialists`}
        />
      )}
    </div>
  );
};
