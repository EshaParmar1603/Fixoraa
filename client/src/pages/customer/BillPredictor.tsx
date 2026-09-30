import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  Sun,
  Home,
  Users,
  Copy,
  Check,
  Plus,
  Trash2,
  HelpCircle,
  Share2,
  Sparkles,
  Leaf,
  Layers,
  CheckCircle2,
  ArrowRight,
  TrendingDown,
  Percent,
  Sliders,
  RotateCcw,
  IndianRupee,
  Tv,
  Droplet,
  Flame,
  Wind,
  Laptop,
  AlertCircle
} from 'lucide-react';
import {
  formatINR,
  formatINRPrecise,
  INDIAN_CITIES_DISCOM,
  IndianCityDiscom,
} from '../../utils/formatters';

interface ApplianceItem {
  id: string;
  name: string;
  category: 'cooling' | 'refrigeration' | 'heating' | 'fans_lights' | 'kitchen' | 'laundry' | 'electronics' | 'custom';
  watts: number;
  quantity: number;
  dailyHours: number;
  active: boolean;
  notes?: string;
  starRating?: number;
}

const INITIAL_APPLIANCES: ApplianceItem[] = [
  // Cooling
  {
    id: 'ac-15-inv',
    name: '1.5 Ton Inverter Split AC (5-Star)',
    category: 'cooling',
    watts: 1050,
    quantity: 2,
    dailyHours: 7,
    active: true,
    starRating: 5,
    notes: 'Energy efficient dual inverter compressor',
  },
  {
    id: 'ac-10-split',
    name: '1.0 Ton Split AC (3-Star)',
    category: 'cooling',
    watts: 1150,
    quantity: 1,
    dailyHours: 5,
    active: false,
    starRating: 3,
  },
  {
    id: 'air-cooler',
    name: 'Desert / Room Air Cooler',
    category: 'cooling',
    watts: 180,
    quantity: 1,
    dailyHours: 6,
    active: false,
  },

  // Refrigeration
  {
    id: 'fridge-double',
    name: 'Double Door Frost-Free Refrigerator (260L)',
    category: 'refrigeration',
    watts: 180, // runs intermittently ~ 2.1 units/day
    quantity: 1,
    dailyHours: 12, // effective running compressor hours
    active: true,
    notes: '24x7 connected, automated defrost',
  },
  {
    id: 'fridge-single',
    name: 'Single Door Direct-Cool Refrigerator (190L)',
    category: 'refrigeration',
    watts: 120,
    quantity: 1,
    dailyHours: 9,
    active: false,
  },

  // Water Heating
  {
    id: 'geyser-storage',
    name: 'Storage Water Geyser (25 Liters, 2000W)',
    category: 'heating',
    watts: 2000,
    quantity: 2,
    dailyHours: 1.5,
    active: true,
    notes: 'High wattage heating element',
  },
  {
    id: 'geyser-instant',
    name: 'Instant Water Heater (3000W)',
    category: 'heating',
    watts: 3000,
    quantity: 1,
    dailyHours: 0.5,
    active: false,
  },

  // Fans & Lights
  {
    id: 'fan-std',
    name: 'Ceiling Fan - Regular (75W)',
    category: 'fans_lights',
    watts: 75,
    quantity: 4,
    dailyHours: 14,
    active: true,
  },
  {
    id: 'fan-bldc',
    name: 'BLDC Energy Saver Ceiling Fan (28W)',
    category: 'fans_lights',
    watts: 28,
    quantity: 2,
    dailyHours: 12,
    active: false,
    notes: 'Saves 60%+ power compared to standard fans',
  },
  {
    id: 'light-led-tube',
    name: 'LED Tube Lights (20W)',
    category: 'fans_lights',
    watts: 20,
    quantity: 5,
    dailyHours: 6,
    active: true,
  },
  {
    id: 'light-led-bulb',
    name: 'LED Bulbs (9W)',
    category: 'fans_lights',
    watts: 9,
    quantity: 6,
    dailyHours: 5,
    active: true,
  },

  // Kitchen
  {
    id: 'induction',
    name: 'Induction Cooktop (1800W)',
    category: 'kitchen',
    watts: 1800,
    quantity: 1,
    dailyHours: 1.2,
    active: true,
  },
  {
    id: 'microwave',
    name: 'Microwave Oven (1200W)',
    category: 'kitchen',
    watts: 1200,
    quantity: 1,
    dailyHours: 0.4,
    active: true,
  },
  {
    id: 'ro-purifier',
    name: 'RO + UV Water Purifier',
    category: 'kitchen',
    watts: 45,
    quantity: 1,
    dailyHours: 3,
    active: true,
  },
  {
    id: 'mixer-grinder',
    name: 'Mixer Grinder / Blender',
    category: 'kitchen',
    watts: 750,
    quantity: 1,
    dailyHours: 0.3,
    active: true,
  },

  // Laundry
  {
    id: 'wm-front-load',
    name: 'Front-Load Washing Machine (Inbuilt Heater)',
    category: 'laundry',
    watts: 1800,
    quantity: 1,
    dailyHours: 0.8, // ~4-5 loads/week
    active: true,
  },
  {
    id: 'wm-top-load',
    name: 'Top-Load Washing Machine (No Heater)',
    category: 'laundry',
    watts: 450,
    quantity: 1,
    dailyHours: 0.8,
    active: false,
  },
  {
    id: 'steam-iron',
    name: 'Steam Iron',
    category: 'laundry',
    watts: 1400,
    quantity: 1,
    dailyHours: 0.4,
    active: true,
  },

  // Electronics & Work From Home
  {
    id: 'laptop',
    name: 'Laptops (Work from Home)',
    category: 'electronics',
    watts: 65,
    quantity: 3,
    dailyHours: 9,
    active: true,
  },
  {
    id: 'tv-smart',
    name: '55" 4K Smart LED TV + Soundbar',
    category: 'electronics',
    watts: 140,
    quantity: 1,
    dailyHours: 4,
    active: true,
  },
  {
    id: 'wifi-router',
    name: 'Wi-Fi Fiber Router (24x7)',
    category: 'electronics',
    watts: 15,
    quantity: 1,
    dailyHours: 24,
    active: true,
  },
  {
    id: 'desktop-pc',
    name: 'Desktop PC / Gaming Rig',
    category: 'electronics',
    watts: 320,
    quantity: 1,
    dailyHours: 4,
    active: false,
  },
];

interface SharedExpense {
  id: string;
  name: string;
  amount: number;
  enabled: boolean;
}

export const BillPredictor: React.FC = () => {
  // 1. Location & DISCOM State
  const [selectedCityId, setSelectedCityId] = useState<string>('blr');
  const [isCustomRate, setIsCustomRate] = useState<boolean>(false);
  const [customUnitRate, setCustomUnitRate] = useState<number>(8.5);
  const [sanctionedLoadKw, setSanctionedLoadKw] = useState<number>(3); // 3 kW sanctioned load

  // Current City DISCOM profile
  const currentCity = useMemo(() => {
    return (
      INDIAN_CITIES_DISCOM.find((c) => c.id === selectedCityId) ||
      INDIAN_CITIES_DISCOM[0]
    );
  }, [selectedCityId]);

  const effectiveUnitRate = isCustomRate ? customUnitRate : currentCity.defaultUnitRate;

  // 2. Flat Sharing State
  const [flatRent, setFlatRent] = useState<number>(32000); // ₹32,000 / month
  const [roommatesCount, setRoommatesCount] = useState<number>(3); // 3 flatmates
  const [sharedExpenses, setSharedExpenses] = useState<SharedExpense[]>([
    { id: 'maint', name: 'Society Maintenance', amount: 2500, enabled: true },
    { id: 'wifi', name: 'High-Speed Wi-Fi Broadband', amount: 899, enabled: true },
    { id: 'maid', name: 'Cook & Maid Services', amount: 4500, enabled: true },
    { id: 'water', name: 'RO Drinking Water Cans', amount: 400, enabled: true },
    { id: 'gas', name: 'Piped Gas / LPG Cylinder', amount: 1100, enabled: false },
  ]);

  // 3. Appliances State
  const [appliances, setAppliances] = useState<ApplianceItem[]>(INITIAL_APPLIANCES);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>('all');
  const [copiedSplit, setCopiedSplit] = useState<boolean>(false);

  // Custom appliance inputs
  const [newAppName, setNewAppName] = useState('');
  const [newAppWatts, setNewAppWatts] = useState(500);
  const [newAppHours, setNewAppHours] = useState(2);
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);

  // 4. Rooftop Solar Power Plant State
  const [hasSolar, setHasSolar] = useState<boolean>(false);
  const [solarCapacityKw, setSolarCapacityKw] = useState<number>(3); // 3 kW system
  const [solarSunHours, setSolarSunHours] = useState<number>(currentCity.avgSolarSunHours);

  // Update solar sunlight hours if city changes
  React.useEffect(() => {
    setSolarSunHours(currentCity.avgSolarSunHours);
  }, [currentCity]);

  // ==========================================
  // REAL-TIME POWER & BILL CALCULATIONS
  // ==========================================

  // Monthly kWh per appliance = (watts * hours * daysInMonth * quantity) / 1000
  const applianceCalculations = useMemo(() => {
    return appliances.map((app) => {
      if (!app.active) {
        return { ...app, monthlyUnits: 0, monthlyCost: 0 };
      }
      const dailyKwh = (app.watts * app.dailyHours * app.quantity) / 1000;
      const monthlyUnits = dailyKwh * 30; // 30-day billing cycle
      const monthlyCost = monthlyUnits * effectiveUnitRate;
      return {
        ...app,
        monthlyUnits,
        monthlyCost,
      };
    });
  }, [appliances, effectiveUnitRate]);

  // Gross Units Consumed by all active appliances
  const grossMonthlyUnits = useMemo(() => {
    return applianceCalculations.reduce((sum, item) => sum + item.monthlyUnits, 0);
  }, [applianceCalculations]);

  // Category breakdown for charts & bars
  const categoryBreakdown = useMemo(() => {
    const cats: Record<string, { label: string; units: number; cost: number; icon: any }> = {
      cooling: { label: 'AC & Cooling', units: 0, cost: 0, icon: Wind },
      refrigeration: { label: 'Refrigeration', units: 0, cost: 0, icon: Droplet },
      heating: { label: 'Geysers & Heating', units: 0, cost: 0, icon: Flame },
      fans_lights: { label: 'Fans & Lighting', units: 0, cost: 0, icon: Zap },
      kitchen: { label: 'Kitchen Appliances', units: 0, cost: 0, icon: IndianRupee },
      laundry: { label: 'Laundry & Cleaning', units: 0, cost: 0, icon: RotateCcw },
      electronics: { label: 'WFH & Electronics', units: 0, cost: 0, icon: Laptop },
      custom: { label: 'Other / Custom', units: 0, cost: 0, icon: Sparkles },
    };

    applianceCalculations.forEach((item) => {
      if (item.active && cats[item.category]) {
        cats[item.category].units += item.monthlyUnits;
        cats[item.category].cost += item.monthlyCost;
      }
    });

    return Object.entries(cats)
      .map(([key, data]) => ({
        key,
        ...data,
        percentage: grossMonthlyUnits > 0 ? (data.units / grossMonthlyUnits) * 100 : 0,
      }))
      .sort((a, b) => b.units - a.units);
  }, [applianceCalculations, grossMonthlyUnits]);

  // Solar generation per month
  // 1 kW in India produces ~ 4 to 4.5 units per day depending on sun hours
  const monthlySolarUnits = useMemo(() => {
    if (!hasSolar) return 0;
    // Capacity (kW) * Sun Hours/day * System Performance Ratio (~0.82) * 30 days
    const dailyGenPerKw = solarSunHours * 0.85;
    return solarCapacityKw * dailyGenPerKw * 30;
  }, [hasSolar, solarCapacityKw, solarSunHours]);

  // Net Units Billed by Grid (Net Metering)
  const netBilledUnits = useMemo(() => {
    return Math.max(0, grossMonthlyUnits - monthlySolarUnits);
  }, [grossMonthlyUnits, monthlySolarUnits]);

  // Solar Units offset & Rupee savings
  const solarUnitsUsed = useMemo(() => {
    return Math.min(grossMonthlyUnits, monthlySolarUnits);
  }, [grossMonthlyUnits, monthlySolarUnits]);

  const excessSolarUnits = useMemo(() => {
    return Math.max(0, monthlySolarUnits - grossMonthlyUnits);
  }, [grossMonthlyUnits, monthlySolarUnits]);

  const solarRupeeSavings = useMemo(() => {
    return solarUnitsUsed * effectiveUnitRate;
  }, [solarUnitsUsed, effectiveUnitRate]);

  // Environmental offset (CO2: ~0.82 kg/kWh in Indian coal-heavy grid mix)
  const co2AvoidedKg = useMemo(() => {
    return monthlySolarUnits * 0.82;
  }, [monthlySolarUnits]);

  const treesEquivalent = useMemo(() => {
    return Math.round(co2AvoidedKg / 21); // ~21 kg CO2 absorbed per tree per year / 12 mo
  }, [co2AvoidedKg]);

  // Electricity Tariff Breakdown
  const energyCharges = netBilledUnits * effectiveUnitRate;
  const fixedCharges = sanctionedLoadKw * currentCity.fixedCharge;
  const electricityDutyTax = (energyCharges * currentCity.dutyTaxPercent) / 100;
  const totalElectricityBill = energyCharges + fixedCharges + electricityDutyTax;

  // Shared Flat Expenses Breakdown
  const totalOtherSharedExpenses = useMemo(() => {
    return sharedExpenses
      .filter((e) => e.enabled)
      .reduce((sum, e) => sum + e.amount, 0);
  }, [sharedExpenses]);

  // Total Flat Monthly Living Outflow
  const totalFlatMonthlyCost = flatRent + totalElectricityBill + totalOtherSharedExpenses;

  // Per Person / Flatmate Division
  const validRoommates = Math.max(1, roommatesCount);
  const perPersonElectricity = totalElectricityBill / validRoommates;
  const perPersonRent = flatRent / validRoommates;
  const perPersonShared = totalOtherSharedExpenses / validRoommates;
  const perPersonTotal = totalFlatMonthlyCost / validRoommates;

  // Handlers for toggles and inputs
  const handleToggleAppliance = (id: string) => {
    setAppliances((prev) =>
      prev.map((app) => (app.id === id ? { ...app, active: !app.active } : app))
    );
  };

  const handleUpdateHours = (id: string, hours: number) => {
    setAppliances((prev) =>
      prev.map((app) =>
        app.id === id ? { ...app, dailyHours: Math.max(0.1, hours) } : app
      )
    );
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setAppliances((prev) =>
      prev.map((app) => {
        if (app.id === id) {
          const nextQ = Math.max(1, app.quantity + delta);
          return { ...app, quantity: nextQ };
        }
        return app;
      })
    );
  };

  const handleToggleSharedExpense = (id: string) => {
    setSharedExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, enabled: !e.enabled } : e))
    );
  };

  const handleAddCustomAppliance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppName.trim()) return;

    const newApp: ApplianceItem = {
      id: `custom-${Date.now()}`,
      name: newAppName.trim(),
      category: 'custom',
      watts: Number(newAppWatts) || 200,
      quantity: 1,
      dailyHours: Number(newAppHours) || 2,
      active: true,
      notes: 'Custom User Added Appliance',
    };

    setAppliances((prev) => [newApp, ...prev]);
    setNewAppName('');
    setNewAppWatts(500);
    setNewAppHours(2);
    setShowAddCustomModal(false);
  };

  const handleDeleteAppliance = (id: string) => {
    setAppliances((prev) => prev.filter((app) => app.id !== id));
  };

  // Quick preset loader
  const handleLoadPreset = (type: '1bhk' | '2bhk' | '3bhk') => {
    if (type === '1bhk') {
      setFlatRent(18000);
      setRoommatesCount(2);
      setSanctionedLoadKw(2);
      setAppliances((prev) =>
        prev.map((app) => {
          if (app.id === 'ac-15-inv') return { ...app, quantity: 1, dailyHours: 6, active: true };
          if (app.id === 'fridge-double') return { ...app, active: true };
          if (app.id === 'fan-std') return { ...app, quantity: 2, dailyHours: 12, active: true };
          if (app.id === 'geyser-storage') return { ...app, quantity: 1, dailyHours: 1, active: true };
          if (app.id === 'laptop') return { ...app, quantity: 2, dailyHours: 8, active: true };
          if (['induction', 'wm-front-load', 'tv-smart', 'wifi-router'].includes(app.id)) {
            return { ...app, active: true };
          }
          return { ...app, active: false };
        })
      );
    } else if (type === '2bhk') {
      setFlatRent(28000);
      setRoommatesCount(2);
      setSanctionedLoadKw(3);
      setAppliances((prev) =>
        prev.map((app) => {
          if (app.id === 'ac-15-inv') return { ...app, quantity: 2, dailyHours: 7, active: true };
          if (app.id === 'fridge-double') return { ...app, active: true };
          if (app.id === 'fan-std') return { ...app, quantity: 3, dailyHours: 12, active: true };
          if (app.id === 'geyser-storage') return { ...app, quantity: 2, dailyHours: 1.5, active: true };
          if (app.id === 'laptop') return { ...app, quantity: 2, dailyHours: 9, active: true };
          if (['induction', 'wm-front-load', 'tv-smart', 'wifi-router', 'microwave', 'ro-purifier'].includes(app.id)) {
            return { ...app, active: true };
          }
          return { ...app, active: false };
        })
      );
    } else if (type === '3bhk') {
      setFlatRent(38000);
      setRoommatesCount(3);
      setSanctionedLoadKw(4);
      setAppliances((prev) =>
        prev.map((app) => {
          if (app.id === 'ac-15-inv') return { ...app, quantity: 3, dailyHours: 8, active: true };
          if (app.id === 'fridge-double') return { ...app, active: true };
          if (app.id === 'fan-std') return { ...app, quantity: 5, dailyHours: 14, active: true };
          if (app.id === 'geyser-storage') return { ...app, quantity: 3, dailyHours: 2, active: true };
          if (app.id === 'laptop') return { ...app, quantity: 3, dailyHours: 9, active: true };
          if (['induction', 'wm-front-load', 'tv-smart', 'wifi-router', 'microwave', 'ro-purifier', 'light-led-tube', 'light-led-bulb'].includes(app.id)) {
            return { ...app, active: true };
          }
          return { ...app, active: false };
        })
      );
    }
  };

  // WhatsApp summary generation
  const handleCopyWhatsAppSplit = () => {
    const text = `🏠 *Fixora Flat Expenses & Bill Split* (${currentCity.city}, ${currentCity.state})
──────────────────────────────
👥 *Total Flatmates:* ${roommatesCount} Members
⚡ *Electricity Consumption:* ${Math.round(grossMonthlyUnits)} kWh/units
${hasSolar ? `☀️ *Rooftop Solar Offset:* -${Math.round(monthlySolarUnits)} kWh (Saved ${formatINR(solarRupeeSavings)}!)\n` : ''}💡 *Total Electricity Bill:* ${formatINR(totalElectricityBill)}
🏢 *Flat Rent:* ${formatINR(flatRent)}
📶 *Shared Amenities (Wi-Fi, Maid, Maint):* ${formatINR(totalOtherSharedExpenses)}
──────────────────────────────
💰 *Total Flat Outflow:* ${formatINR(totalFlatMonthlyCost)}
👉 *EACH FLATMANE'S SHARE:* *${formatINRPrecise(perPersonTotal)}*
   • Rent: ${formatINR(perPersonRent)}
   • Power: ${formatINR(perPersonElectricity)}
   • Shared Bills: ${formatINR(perPersonShared)}
──────────────────────────────
✨ _Accurately predicted via Fixora Smart Bill Predictor_`;

    navigator.clipboard.writeText(text);
    setCopiedSplit(true);
    setTimeout(() => setCopiedSplit(false), 3000);
  };

  // Filtered appliances list
  const filteredAppliances = useMemo(() => {
    if (selectedCategoryTab === 'all') return applianceCalculations;
    if (selectedCategoryTab === 'active') return applianceCalculations.filter((a) => a.active);
    return applianceCalculations.filter((a) => a.category === selectedCategoryTab);
  }, [applianceCalculations, selectedCategoryTab]);

  return (
    <div className="min-h-screen bg-slate-50/60 pb-24">
      {/* ======================================================== */}
      {/* HERO SECTION (MATCHING HOME & USER INSPIRATION) */}
      {/* ======================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-950 via-slate-900 to-slate-900 text-white pt-20 pb-28 px-4 sm:px-6 lg:px-8 mb-12">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-7xl mx-auto relative z-10 text-center space-y-8">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-emerald-300">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Real-Time Indian DISCOM Tariff & Flatmate Share Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight max-w-4xl mx-auto leading-tight">
            Predict Electricity Bills &{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-300 bg-clip-text text-transparent">
              Split Flat Expenses Fairly
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Forecast real-time power bills across 14+ Indian DISCOMs (BESCOM, MSEDCL, BSES, TANGEDCO), simulate rooftop solar net-metering offsets, and divide rent & shared utilities transparently across flatmates.
          </p>

          {/* Quick Presets Bar */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs font-medium text-slate-300">
            <span className="text-slate-400">Quick Presets:</span>
            <button
              onClick={() => handleLoadPreset('1bhk')}
              className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-all border border-white/10 text-slate-200"
            >
              🏢 1 BHK Studio
            </button>
            <button
              onClick={() => handleLoadPreset('2bhk')}
              className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-all border border-white/10 text-slate-200"
            >
              🏡 2 BHK Family
            </button>
            <button
              onClick={() => handleLoadPreset('3bhk')}
              className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 border-emerald-400 text-emerald-300 transition-all border font-semibold shadow-md shadow-emerald-500/10"
            >
              👥 3 BHK Shared Flat
            </button>
            <button
              onClick={() => setHasSolar(!hasSolar)}
              className={`px-3.5 py-1.5 rounded-full transition-all border font-medium ${
                hasSolar
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md shadow-amber-500/10'
                  : 'bg-white/10 hover:bg-white/20 border-white/10 text-slate-200'
              }`}
            >
              ☀️ {hasSolar ? 'Solar Net-Metering: Active' : 'Enable Rooftop Solar'}
            </button>
          </div>

          {/* Stats Strip */}
          <div className="max-w-5xl mx-auto mt-16 pt-8 border-t border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <span className="text-2xl sm:text-3xl font-black text-white">14+ DISCOMs</span>
              <span className="block text-xs text-slate-400 mt-1">Slab Tariffs (BESCOM, BSES, MSEDCL)</span>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black text-white">₹0 Hidden</span>
              <span className="block text-xs text-slate-400 mt-1">Exact Fixed & Energy Charges</span>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black text-white">Live Wattage</span>
              <span className="block text-xs text-slate-400 mt-1">35+ Preset Home Appliances</span>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black text-white">1-Click Split</span>
              <span className="block text-xs text-slate-400 mt-1">WhatsApp Flatmate Summary</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* ======================================================== */}
        {/* TOP LEVEL LIVE METRIC CARDS */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Per Person Split */}
          <div className="bg-gradient-to-br from-brand-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Users className="w-28 h-28" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-300">
                Your Individual Share
              </span>
              <div className="flex items-baseline space-x-1.5 mt-1">
                <span className="text-3xl sm:text-4xl font-black text-white">
                  {formatINRPrecise(perPersonTotal)}
                </span>
                <span className="text-xs text-brand-200 font-medium">/ person</span>
              </div>
              <p className="text-xs text-slate-300 mt-2">
                Divided equally among {roommatesCount} flatmates
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-brand-200">
              <span>Rent: {formatINR(perPersonRent)}</span>
              <span>Power: {formatINR(perPersonElectricity)}</span>
            </div>
          </div>

          {/* Card 2: Total Electricity Bill */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Total Electricity Bill
                </span>
                <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline space-x-1.5 mt-2">
                <span className="text-3xl font-black text-slate-900">
                  {formatINR(totalElectricityBill)}
                </span>
                <span className="text-xs text-slate-500 font-semibold">/ month</span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center">
                <span>{Math.round(grossMonthlyUnits)} kWh consumed</span>
                {hasSolar && (
                  <span className="text-emerald-600 font-bold ml-1.5">
                    ({Math.round(netBilledUnits)} net billed)
                  </span>
                )}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Rate: {formatINRPrecise(effectiveUnitRate)} / unit</span>
              <span className="text-slate-700 font-semibold">{currentCity.city}</span>
            </div>
          </div>

          {/* Card 3: Total Flat Expenses */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Total Flat Outflow
                </span>
                <div className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Home className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline space-x-1.5 mt-2">
                <span className="text-3xl font-black text-slate-900">
                  {formatINR(totalFlatMonthlyCost)}
                </span>
                <span className="text-xs text-slate-500 font-semibold">/ month</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Rent ({formatINR(flatRent)}) + Power + Amenities
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>{sharedExpenses.filter((e) => e.enabled).length} shared bills active</span>
              <span className="text-emerald-600 font-semibold">{formatINR(totalOtherSharedExpenses)}</span>
            </div>
          </div>

          {/* Card 4: Solar Savings or Green Impact */}
          <div className={`p-6 rounded-3xl border shadow-sm flex flex-col justify-between ${
            hasSolar
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
              : 'bg-white border-slate-200/90'
          }`}>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {hasSolar ? '☀️ Solar Net-Metering' : 'Rooftop Solar Plant'}
                </span>
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                  hasSolar ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                  <Sun className="w-4 h-4" />
                </div>
              </div>

              {hasSolar ? (
                <>
                  <div className="flex items-baseline space-x-1 mt-2">
                    <span className="text-3xl font-black text-emerald-800">
                      -{formatINR(solarRupeeSavings)}
                    </span>
                    <span className="text-xs text-emerald-700 font-semibold">saved/mo</span>
                  </div>
                  <p className="text-xs text-emerald-800 mt-1 font-medium">
                    {Math.round(monthlySolarUnits)} kWh clean solar produced
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-baseline space-x-1 mt-2">
                    <span className="text-2xl font-black text-slate-400">
                      Not Enabled
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Add rooftop solar to cut your flat's power bill up to 90%!
                  </p>
                </>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
              {hasSolar ? (
                <>
                  <span className="text-emerald-700 font-bold flex items-center">
                    <Leaf className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    {treesEquivalent} Trees/yr
                  </span>
                  <span className="text-emerald-800 font-bold">{solarCapacityKw} kW Plant</span>
                </>
              ) : (
                <button
                  onClick={() => setHasSolar(true)}
                  className="text-brand-600 font-bold hover:underline flex items-center text-xs"
                >
                  <span>Simulate Solar Now</span>
                  <ArrowRight className="w-3 h-3 ml-1" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* MAIN INTERACTIVE 2-COLUMN LAYOUT */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Controls & Appliances (8 Cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* 1. LOCATION & DISCOM RATE SELECTOR */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <IndianRupee className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      1. Location & Electricity Tariff (₹ / kWh)
                    </h2>
                    <p className="text-xs text-slate-500">
                      Select your Indian city for benchmark DISCOM slab rates or input custom sub-meter rate
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <label className="text-xs font-semibold text-slate-600 cursor-pointer flex items-center space-x-1.5">
                    <input
                      type="checkbox"
                      checked={isCustomRate}
                      onChange={(e) => setIsCustomRate(e.target.checked)}
                      className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 w-4 h-4"
                    />
                    <span>Custom Rate</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* City Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    City / Power Board
                  </label>
                  <select
                    value={selectedCityId}
                    onChange={(e) => setSelectedCityId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    {INDIAN_CITIES_DISCOM.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.city} ({c.state}) — {c.defaultUnitRate} ₹/unit
                      </option>
                    ))}
                  </select>
                  <span className="text-[11px] text-slate-400 mt-1 block truncate">
                    {currentCity.discom}
                  </span>
                </div>

                {/* Unit Charge Display / Override */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Electricity Rate per Unit (kWh)
                  </label>
                  {isCustomRate ? (
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">
                        ₹
                      </span>
                      <input
                        type="number"
                        step="0.1"
                        min="1"
                        max="25"
                        value={customUnitRate}
                        onChange={(e) => setCustomUnitRate(Number(e.target.value) || 0)}
                        className="w-full pl-8 pr-16 py-2.5 rounded-2xl border border-brand-300 bg-brand-50/30 text-slate-900 font-bold text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                        placeholder="e.g. 8.50"
                      />
                      <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-medium">
                        ₹/unit
                      </span>
                    </div>
                  ) : (
                    <div className="px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-slate-100/60 text-slate-900 text-sm font-bold flex items-center justify-between">
                      <span>{formatINRPrecise(currentCity.defaultUnitRate)} / unit</span>
                      <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold">
                        Discom Tariff
                      </span>
                    </div>
                  )}
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Fixed charge: ₹{currentCity.fixedCharge}/kW • State Duty: {currentCity.dutyTaxPercent}%
                  </span>
                </div>
              </div>
            </div>

            {/* 2. FLAT RENT & ROOMMATE SHARING SYSTEM */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-sm space-y-6">
              <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    2. Flat Rent & Flatmate Sharing Division
                  </h2>
                  <p className="text-xs text-slate-500">
                    Specify your total flat rent and roommates to calculate per-person equal or customized share
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Flat Rent Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Monthly Flat Rent
                    </label>
                    <span className="text-sm font-extrabold text-slate-900">
                      {formatINR(flatRent)}
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">
                      ₹
                    </span>
                    <input
                      type="number"
                      step="500"
                      min="0"
                      max="500000"
                      value={flatRent}
                      onChange={(e) => setFlatRent(Number(e.target.value) || 0)}
                      className="w-full pl-8 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-800 text-sm font-bold focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                  <input
                    type="range"
                    min="5000"
                    max="100000"
                    step="1000"
                    value={flatRent}
                    onChange={(e) => setFlatRent(Number(e.target.value))}
                    className="w-full mt-2 accent-brand-600"
                  />
                </div>

                {/* Flatmates Stepper */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Number of Flatmates Sharing
                    </label>
                    <span className="text-sm font-extrabold text-brand-600">
                      {roommatesCount} {roommatesCount === 1 ? 'Person' : 'Flatmates'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => setRoommatesCount((c) => Math.max(1, c - 1))}
                      className="w-12 h-11 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-lg flex items-center justify-center transition-colors"
                    >
                      -
                    </button>
                    <div className="flex-1 py-2.5 rounded-2xl border border-slate-200 bg-white text-center font-black text-slate-900 text-base">
                      {roommatesCount} Roommates
                    </div>
                    <button
                      type="button"
                      onClick={() => setRoommatesCount((c) => Math.min(10, c + 1))}
                      className="w-12 h-11 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-lg flex items-center justify-center transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Every bill (Rent, Power, Wi-Fi, Maid) is split among {roommatesCount} people
                  </p>
                </div>
              </div>

              {/* Shared Amenities Checkboxes */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-3">
                  Other Common Shared Flat Expenses (Optional)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {sharedExpenses.map((exp) => (
                    <div
                      key={exp.id}
                      onClick={() => handleToggleSharedExpense(exp.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        exp.enabled
                          ? 'border-brand-300 bg-brand-50/30'
                          : 'border-slate-200 bg-slate-50/50 opacity-60'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <input
                          type="checkbox"
                          checked={exp.enabled}
                          onChange={() => {}}
                          className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 w-4 h-4 pointer-events-none"
                        />
                        <span className="text-xs font-semibold text-slate-800">
                          {exp.name}
                        </span>
                      </div>
                      <span className="text-xs font-black text-slate-900">
                        {formatINR(exp.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. ROOFTOP SOLAR POWER PLANT SIMULATOR */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Sun className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      3. Rooftop Solar Power Plant & Net-Metering
                    </h2>
                    <p className="text-xs text-slate-500">
                      Simulate grid bill offset & green energy savings with rooftop solar PV
                    </p>
                  </div>
                </div>

                {/* Solar Toggle Switch */}
                <button
                  type="button"
                  onClick={() => setHasSolar(!hasSolar)}
                  className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors ${
                    hasSolar ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                >
                  <div
                    className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${
                      hasSolar ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {hasSolar ? (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Solar Capacity Slider */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Solar Plant Capacity
                        </label>
                        <span className="text-sm font-black text-emerald-700">
                          {solarCapacityKw} kW System
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        step="0.5"
                        value={solarCapacityKw}
                        onChange={(e) => setSolarCapacityKw(Number(e.target.value))}
                        className="w-full accent-emerald-600"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
                        <span>1 kW (Compact)</span>
                        <span>3 kW (Standard Flat)</span>
                        <span>5 kW (Villa)</span>
                        <span>10 kW</span>
                      </div>
                    </div>

                    {/* Sun Hours Info */}
                    <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4">
                      <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                        Estimated Solar Generation in {currentCity.city}
                      </span>
                      <div className="flex items-baseline space-x-1.5 mt-1">
                        <span className="text-2xl font-black text-emerald-900">
                          ~{Math.round(monthlySolarUnits)} kWh
                        </span>
                        <span className="text-xs text-emerald-700 font-semibold">/ month</span>
                      </div>
                      <p className="text-[11px] text-emerald-700 mt-1">
                        Based on {solarSunHours} avg sunny hours/day in {currentCity.state}
                      </p>
                    </div>
                  </div>

                  {/* Net-Metering Result Badge */}
                  <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-slate-300">
                          Net Metering Simulation
                        </span>
                        <p className="text-sm font-bold text-white">
                          Gross: {Math.round(grossMonthlyUnits)} kWh — Solar: {Math.round(monthlySolarUnits)} kWh
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      {excessSolarUnits > 0 ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-xl bg-emerald-500 text-slate-900 text-xs font-black">
                          ⚡ Zero Grid Bill! (+{Math.round(excessSolarUnits)} kWh credited)
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-emerald-400">
                          Net Billed by Grid: {Math.round(netBilledUnits)} kWh
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
                  <p className="text-xs text-slate-600 font-medium">
                    Do you live in a society or independent house with rooftop solar?
                  </p>
                  <button
                    type="button"
                    onClick={() => setHasSolar(true)}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    <Sun className="w-4 h-4" />
                    <span>Turn On Solar Calculation</span>
                  </button>
                </div>
              )}
            </div>

            {/* 4. HOME APPLIANCES SELECTION & USAGE */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-sm space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      4. Home Appliances & Usage Hours
                    </h2>
                    <p className="text-xs text-slate-500">
                      Toggle active appliances, adjust quantities, and daily running hours in real-time
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddCustomModal(true)}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Custom Appliance</span>
                </button>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none text-xs font-bold">
                {[
                  { id: 'all', label: 'All Appliances' },
                  { id: 'active', label: 'Active Only' },
                  { id: 'cooling', label: '❄️ Cooling' },
                  { id: 'refrigeration', label: '🧊 Fridge' },
                  { id: 'heating', label: '🚿 Geysers' },
                  { id: 'fans_lights', label: '🌪️ Fans & Lights' },
                  { id: 'kitchen', label: '🍳 Kitchen' },
                  { id: 'laundry', label: '🧺 Laundry' },
                  { id: 'electronics', label: '💻 Electronics' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedCategoryTab(tab.id)}
                    className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all ${
                      selectedCategoryTab === tab.id
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Appliances List */}
              <div className="space-y-3.5">
                {filteredAppliances.map((app) => (
                  <div
                    key={app.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      app.active
                        ? 'border-slate-200 bg-white shadow-sm'
                        : 'border-slate-100 bg-slate-50/60 opacity-60'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Name & Checkbox */}
                      <div className="flex items-start space-x-3 flex-1">
                        <input
                          type="checkbox"
                          checked={app.active}
                          onChange={() => handleToggleAppliance(app.id)}
                          className="mt-1 rounded border-slate-300 text-brand-600 focus:ring-brand-500 w-4 h-4 cursor-pointer"
                        />
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-bold text-slate-900">
                              {app.name}
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600">
                              {app.watts}W
                            </span>
                            {app.starRating && (
                              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                {app.starRating}★ BEE
                              </span>
                            )}
                          </div>
                          {app.notes && (
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {app.notes}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Controls: Quantity + Hours + Consumption */}
                      {app.active ? (
                        <div className="flex flex-wrap items-center gap-4 text-xs">
                          {/* Quantity Counter */}
                          <div className="flex items-center space-x-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
                            <span className="text-[10px] font-bold text-slate-400 uppercase px-1">
                              Qty:
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(app.id, -1)}
                              className="w-6 h-6 rounded-lg bg-white border border-slate-200 font-bold hover:bg-slate-100 flex items-center justify-center text-slate-700"
                            >
                              -
                            </button>
                            <span className="w-5 text-center font-black text-slate-900">
                              {app.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(app.id, 1)}
                              className="w-6 h-6 rounded-lg bg-white border border-slate-200 font-bold hover:bg-slate-100 flex items-center justify-center text-slate-700"
                            >
                              +
                            </button>
                          </div>

                          {/* Hours Slider & Box */}
                          <div className="flex items-center space-x-2">
                            <span className="text-slate-500 font-medium">
                              {app.dailyHours} hrs/day
                            </span>
                            <input
                              type="range"
                              min="0.5"
                              max="24"
                              step="0.5"
                              value={app.dailyHours}
                              onChange={(e) =>
                                handleUpdateHours(app.id, Number(e.target.value))
                              }
                              className="w-20 sm:w-28 accent-brand-600"
                            />
                          </div>

                          {/* Output: Units & Cost */}
                          <div className="text-right min-w-[90px]">
                            <span className="font-black text-slate-900 block">
                              {formatINR(app.monthlyCost)}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {Math.round(app.monthlyUnits)} kWh
                            </span>
                          </div>

                          {app.category === 'custom' && (
                            <button
                              type="button"
                              onClick={() => handleDeleteAppliance(app.id)}
                              className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                              title="Delete Appliance"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleToggleAppliance(app.id)}
                          className="text-xs font-semibold text-brand-600 hover:underline"
                        >
                          Enable
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Real-Time Results & Split Summary (4 Cols) */}
          <div className="lg:col-span-4 space-y-6 sticky top-24">
            {/* Split Breakdown Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Live Bill & Split Summary
                  </h3>
                  <p className="text-xs text-slate-500">
                    Real-time calculation for {roommatesCount} flatmates
                  </p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <IndianRupee className="w-4 h-4" />
                </div>
              </div>

              {/* Share Per Person Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-600 text-white shadow-md space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-200">
                  Each Flatmate Pays
                </span>
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-3xl font-black text-white">
                    {formatINRPrecise(perPersonTotal)}
                  </span>
                  <span className="text-xs text-brand-100">/ person</span>
                </div>
                <div className="pt-2 border-t border-white/20 text-xs text-brand-100 space-y-1">
                  <div className="flex justify-between">
                    <span>Rent Share:</span>
                    <span className="font-bold text-white">{formatINR(perPersonRent)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Electricity Share:</span>
                    <span className="font-bold text-white">{formatINR(perPersonElectricity)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Common Amenities:</span>
                    <span className="font-bold text-white">{formatINR(perPersonShared)}</span>
                  </div>
                </div>
              </div>

              {/* Line item details */}
              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Gross Energy Units ({Math.round(grossMonthlyUnits)} kWh):</span>
                  <span className="font-semibold text-slate-900">
                    {formatINR(grossMonthlyUnits * effectiveUnitRate)}
                  </span>
                </div>

                {hasSolar && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>☀️ Solar Offset (-{Math.round(monthlySolarUnits)} kWh):</span>
                    <span>-{formatINR(solarRupeeSavings)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>Fixed Meter Charges ({sanctionedLoadKw} kW):</span>
                  <span className="font-semibold text-slate-900">
                    {formatINR(fixedCharges)}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>State Electricity Duty ({currentCity.dutyTaxPercent}%):</span>
                  <span className="font-semibold text-slate-900">
                    {formatINR(electricityDutyTax)}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-between font-bold text-slate-900">
                  <span>Net Electricity Bill:</span>
                  <span className="text-sm font-black text-brand-700">
                    {formatINR(totalElectricityBill)}
                  </span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>House Rent:</span>
                  <span className="font-semibold text-slate-900">{formatINR(flatRent)}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Shared Maintenance & Wi-Fi:</span>
                  <span className="font-semibold text-slate-900">{formatINR(totalOtherSharedExpenses)}</span>
                </div>

                <div className="pt-3 border-t-2 border-slate-200 flex justify-between font-black text-sm text-slate-900">
                  <span>Total Monthly Flat Cost:</span>
                  <span>{formatINR(totalFlatMonthlyCost)}</span>
                </div>
              </div>

              {/* Copy WhatsApp Message Button */}
              <button
                type="button"
                onClick={handleCopyWhatsAppSplit}
                className={`w-full py-3 px-4 rounded-2xl font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 ${
                  copiedSplit
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                }`}
              >
                {copiedSplit ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied WhatsApp Split Text!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span>Copy Split for Flatmate Group</span>
                  </>
                )}
              </button>
            </div>

            {/* Consumption by Category Progress Bars */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Electricity Usage By Category
              </h3>

              <div className="space-y-3">
                {categoryBreakdown
                  .filter((cat) => cat.units > 0)
                  .map((cat) => (
                    <div key={cat.key} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span className="flex items-center space-x-1.5">
                          <cat.icon className="w-3.5 h-3.5 text-slate-400" />
                          <span>{cat.label}</span>
                        </span>
                        <span>
                          {formatINR(cat.cost)}{' '}
                          <span className="text-slate-400 font-normal">
                            ({cat.percentage.toFixed(0)}%)
                          </span>
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, cat.percentage)}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Fixora Appliance Maintenance Tip Card */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-3xl shadow-sm space-y-3">
              <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold">
                <Sparkles className="w-4 h-4" />
                <span>Fixora Energy Saver Tip</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Dirty AC cooling coils and low refrigerant gas force compressors to work 25% longer, wasting up to ₹600/month in extra electricity.
              </p>
              <Link
                to="/services"
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-brand-300 hover:text-white transition-colors"
              >
                <span>Book AC Jet Clean Service</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ADD CUSTOM APPLIANCE MODAL */}
      {/* ======================================================== */}
      {showAddCustomModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                Add Custom Appliance
              </h3>
              <button
                type="button"
                onClick={() => setShowAddCustomModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCustomAppliance} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Appliance Name
                </label>
                <input
                  type="text"
                  required
                  value={newAppName}
                  onChange={(e) => setNewAppName(e.target.value)}
                  placeholder="e.g. Dishwasher, Dehumidifier, Gaming Console"
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Power Rating (Watts)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    required
                    value={newAppWatts}
                    onChange={(e) => setNewAppWatts(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    e.g. 500W, 1200W
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Daily Hours
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.1"
                    max="24"
                    required
                    value={newAppHours}
                    onChange={(e) => setNewAppHours(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    e.g. 2.5 hrs/day
                  </span>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddCustomModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md transition-colors"
                >
                  Add Appliance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
