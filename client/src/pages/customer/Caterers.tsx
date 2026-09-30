import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Utensils,
  Sparkles,
  Star,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  IndianRupee,
  ExternalLink,
  Instagram,
  Eye,
  Check,
  X,
  Search,
  Users,
  Filter,
  Flame,
  Award,
  Phone,
  MessageSquare
} from 'lucide-react';
import { formatINR } from '../../utils/formatters';

interface CatererProject {
  title: string;
  type: string;
  guests?: number;
  image: string;
  menuHighlights: string[];
}

interface CatererProfile {
  id: string;
  name: string;
  brand: string;
  city: string;
  rating: number;
  reviewCount: number;
  experienceYears: number;
  pricePerPlate: number;
  minGuests: number;
  isPureVeg: boolean;
  cuisines: string[];
  avatar: string;
  coverImage: string;
  instagramHandle: string;
  instagramUrl: string;
  bio: string;
  sampleMenu: {
    welcomeDrinks: string[];
    starters: string[];
    mains: string[];
    liveCounters: string[];
    desserts: string[];
  };
  projects: CatererProject[];
}

const MOCK_CATERERS: CatererProfile[] = [
  {
    id: 'cat-1',
    name: 'Chef Sanjeev Anand & Team',
    brand: 'Royal Zaika Gourmet Banquets',
    city: 'Bengaluru',
    rating: 4.95,
    reviewCount: 312,
    experienceYears: 16,
    pricePerPlate: 650,
    minGuests: 50,
    isPureVeg: false,
    cuisines: ['North Indian', 'Awadhi Mughlai', 'Live Tandoor & Chaat', 'Artisanal Desserts'],
    avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150',
    coverImage: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800',
    instagramHandle: '@royal_zaika_caterers',
    instagramUrl: 'https://instagram.com/royal_zaika_caterers',
    bio: 'Masters of royal Nawabi dum biryanis, slow-cooked dal makhani, and dramatic liquid nitrogen dessert counters. Catered over 500+ celebrity weddings across South India.',
    sampleMenu: {
      welcomeDrinks: ['Kesar Pista Thandai', 'Smoked Jamun Shikanji', 'Mint Basil Mojito'],
      starters: ['Galouti Kebab on Sheermal', 'Paneer Tikka Angara', 'Crispy Lotus Stem Honey Chilli', 'Bhatti Murgh'],
      mains: ['Nalli Nihari / Paneer Lababdar', 'Awadhi Dum Gosht Biryani', 'Dal Zaika Slow Cooked 24hrs', 'Assorted Tandoori Breads'],
      liveCounters: ['Purani Dilli Chaat Stalls', 'Woodfire Mini Naan Pizzas', 'Live Pasta Toss'],
      desserts: ['Shahi Tukda with Rabdi Fondue', 'Paan Ice Cream Nitrogen Roll', 'Baked Rasgulla Pot']
    },
    projects: [
      {
        title: 'Grand Indiranagar Wedding Reception',
        type: '650 Guests • Indiranagar Club Lawn',
        image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=600',
        menuHighlights: ['Live Copper Deg Biryani', '12-Dish Dessert Island', 'Floating Mocktail Lounge']
      },
      {
        title: 'Google Cloud Leadership Dinner',
        type: '220 Guests • Ritz Carlton Banquet',
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600',
        menuHighlights: ['Artisanal Charcoal Kebabs', 'Organic Farm Salad Bar', 'Smoked Belgian Truffles']
      }
    ]
  },
  {
    id: 'cat-2',
    name: 'Shree Ganesh Heritage Group',
    brand: 'Annam Heritage Pure Veg Caterers',
    city: 'Mumbai',
    rating: 4.92,
    reviewCount: 420,
    experienceYears: 22,
    pricePerPlate: 520,
    minGuests: 40,
    isPureVeg: true,
    cuisines: ['Traditional Gujarati', 'Authentic Rajasthani', 'South Indian Temple Feast', 'Jain Specialty'],
    avatar: 'https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=150',
    coverImage: 'https://images.unsplash.com/photo-1613292443284-c775089f2cf0?w=800',
    instagramHandle: '@annam_heritage_feasts',
    instagramUrl: 'https://instagram.com/annam_heritage_feasts',
    bio: '100% Pure Vegetarian and Jain catering masters. Traditional copper thali services, authentic Dal Baati Churma, Gujarati Undhiyu, and pure ghee sweets.',
    sampleMenu: {
      welcomeDrinks: ['Aam Panna with Rock Salt', 'Coconut Water with Malai Drops', 'Masala Buttermilk'],
      starters: ['Khandvi Rolls with Mustard Tempering', 'Corn Methi Tikki', 'Live Jalebi Fafda Counter', 'Moong Dal Chilla'],
      mains: ['Royal Dal Baati Churma with Ghee Bar', 'Gujarati Kadhi & Khichdi', 'Kaju Curry', 'Stuffed Paneer Pasanda'],
      liveCounters: ['Live Jalebi & Rabdi Station', 'Traditional Phulka on Chulha', 'South Indian Ghee Roast Dosa'],
      desserts: ['Mohanthal', 'Sitaphal Basundi', 'Malai Kulfi on Sticks']
    },
    projects: [
      {
        title: 'Traditional Marwari 3-Day Wedding',
        type: '800 Guests • Turf Club South Mumbai',
        image: 'https://images.unsplash.com/photo-1613292443284-c775089f2cf0?w=600',
        menuHighlights: ['56 Bhog Temple Display', 'Pure Ghee Sweets Counter', 'Live Kathiyawadi Chulha']
      },
      {
        title: 'Griha Pravesh & Satyanarayan Feast',
        type: '150 Guests • Bandra West Duplex',
        image: 'https://images.unsplash.com/photo-1505253758473-96b3015f240a?w=600',
        menuHighlights: ['Banana Leaf Seated Dining', 'Badam Halwa', 'Traditional Rasam Vada']
      }
    ]
  },
  {
    id: 'cat-3',
    name: 'Chef Maria & Marco D’Souza',
    brand: 'The Artisan Table & Global Grills',
    city: 'Delhi-NCR',
    rating: 4.88,
    reviewCount: 195,
    experienceYears: 10,
    pricePerPlate: 850,
    minGuests: 30,
    isPureVeg: false,
    cuisines: ['Continental', 'Italian Woodfire', 'Pan-Asian Wok', 'Mediterranean Mezze'],
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    coverImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
    instagramHandle: '@theartisantable_caterers',
    instagramUrl: 'https://instagram.com/theartisantable_caterers',
    bio: 'Contemporary culinary studio specializing in wood-fired sourdough pizza trucks, live sushi & dim sum bars, Mediterranean mezze platters, and European dessert grazing boards.',
    sampleMenu: {
      welcomeDrinks: ['Hibiscus Rose Sangria (Virgin)', 'Lemongrass Ginger Fizz', 'Cold Pressed Valencia Orange'],
      starters: ['Truffle Edamame Dimsums', 'Smoked Salmon Crostini', 'Burrata with Roasted Cherry Tomatoes', 'Yakitori Chicken Skewers'],
      mains: ['Handmade Spinach & Ricotta Ravioli in Sage Butter', 'Slow Cooked Lamb Ragout', 'Thai Green Curry with Jasmine Rice'],
      liveCounters: ['Woodfired Pizza Station', 'Live Teppanyaki Stir Fry', 'Charcuterie & Artisan Cheese Table'],
      desserts: ['Classic Italian Tiramisu with Mascarpone', 'Belgian Chocolate Fondue', 'Warm Apple Cinnamon Tart']
    },
    projects: [
      {
        title: 'Chhatarpur Farmhouse Cocktail Soirée',
        type: '300 Guests • DLF Farms Chhatarpur',
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600',
        menuHighlights: ['Live Woodfired Neapolitan Pizza', 'Artisan Grazing Table', 'Sushi Conveyor Bar']
      },
      {
        title: 'Fashion Week VIP Afterparty',
        type: '180 Guests • Aerocity Sky Lounge',
        image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=600',
        menuHighlights: ['Mini Molecular Sliders', 'Nitro Gin Cocktails', 'Caviar Blinis']
      }
    ]
  },
  {
    id: 'cat-4',
    name: 'Chef Vigneshwaran K.',
    brand: 'Dakshin Aromas & Chettinad Stalls',
    city: 'Hyderabad',
    rating: 4.96,
    reviewCount: 260,
    experienceYears: 18,
    pricePerPlate: 480,
    minGuests: 50,
    isPureVeg: false,
    cuisines: ['Chettinad Spicy', 'Kerala Malabar', 'Authentic Hyderabadi Dum', 'Seafood Coastal'],
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    coverImage: 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=800',
    instagramHandle: '@dakshin_aromas_catering',
    instagramUrl: 'https://instagram.com/dakshin_aromas_catering',
    bio: 'Authentic South Indian culinary masters. Hyderabadi mutton dum biryani, Chettinad chicken pepper roast, Malabar parotta, and live filter coffee stalls in traditional copper dabarahs.',
    sampleMenu: {
      welcomeDrinks: ['Panakam with Jaggery & Dry Ginger', 'Fresh Nannari Sharbat', 'Tender Coconut Cooler'],
      starters: ['Chicken 65 Original Recipe', 'Vazhaipoo Cutlet', 'Apollo Fish Fry', 'Crispy Podi Idli Bites'],
      mains: ['Kacchi Yakhni Mutton Dum Biryani', 'Chettinad Kozhi Curry', 'Ennai Kathirikai (Baby Brinjal Curry)', 'Malabar Flaky Parottas'],
      liveCounters: ['Live Ghee Roast & Pesarattu Dosa Bar', 'South Indian Street Kothu Parotta', 'Live Filter Coffee Machine'],
      desserts: ['Double Ka Meetha with Mawa', 'Elaneer Payasam (Tender Coconut Kheer)', 'Hot Mysore Pak']
    },
    projects: [
      {
        title: 'Gachibowli Tech Park Annual Day',
        type: '450 Pax • Hyderabad Convention Hall',
        image: 'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=600',
        menuHighlights: ['Live Kacchi Dum Biryani Handi', 'Kothu Parotta Station', 'Traditional Filter Coffee']
      }
    ]
  }
];

export const Caterers: React.FC = () => {
  const [caterers] = useState<CatererProfile[]>(MOCK_CATERERS);
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [dietaryFilter, setDietaryFilter] = useState<'All' | 'Veg' | 'NonVeg'>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Project Gallery Modal State
  const [selectedCatererForProjects, setSelectedCatererForProjects] = useState<CatererProfile | null>(null);

  // Booking Modal State
  const [selectedCatererForBooking, setSelectedCatererForBooking] = useState<CatererProfile | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);
  const [eventDate, setEventDate] = useState<string>('');
  const [guestCount, setGuestCount] = useState<number>(100);
  const [mealType, setMealType] = useState<string>('Dinner Buffet');
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');

  const navigate = useNavigate();

  // Filtered Caterers
  const filteredCaterers = caterers.filter((cat) => {
    if (selectedCity !== 'All' && cat.city !== selectedCity) return false;
    if (dietaryFilter === 'Veg' && !cat.isPureVeg) return false;
    if (dietaryFilter === 'NonVeg' && cat.isPureVeg) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchBrand = cat.brand.toLowerCase().includes(q);
      const matchCuisines = cat.cuisines.some((c) => c.toLowerCase().includes(q));
      const matchCity = cat.city.toLowerCase().includes(q);
      if (!matchBrand && !matchCuisines && !matchCity) return false;
    }
    return true;
  });

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setSelectedCatererForBooking(null);
      setClientName('');
      setClientPhone('');
      setEventDate('');
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-slate-50/80 pb-24 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* HERO BANNER */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-amber-950 via-slate-900 to-orange-950 text-white p-8 sm:p-12 shadow-2xl border border-amber-900/40">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-amber-300">
              <Utensils className="w-4 h-4 text-amber-400" />
              <span>Fixora Gourmet Catering & Live Banquet Dining Hub</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Verified Master Chefs &{' '}
              <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-yellow-200 bg-clip-text text-transparent">
                Catering Specialists
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              Browse top-tier wedding, corporate, and private party caterers. Inspect their real-life food setup galleries, check their Instagram portfolios, view custom menus, and book food tastings with transparent per-plate pricing.
            </p>

            <div className="flex flex-wrap items-center gap-5 pt-2 text-xs font-semibold text-slate-300">
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>100% FSSAI Certified Kitchens</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>Complimentary Food Tasting for 100+ Pax</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>Verified Instagram Project Portfolios</span>
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by caterer, cuisine (e.g. Mughlai, Jain)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* City Filter */}
            <div className="flex items-center space-x-1 text-xs font-semibold">
              <MapPin className="w-3.5 h-3.5 text-slate-400 mr-0.5" />
              {['All', 'Bengaluru', 'Mumbai', 'Delhi-NCR', 'Hyderabad'].map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCity(c)}
                  className={`px-3 py-1.5 rounded-xl border text-xs transition-all ${
                    selectedCity === c
                      ? 'bg-amber-600 text-white border-amber-600 font-bold shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            {/* Dietary Filter */}
            <div className="flex items-center space-x-1 text-xs font-semibold border-l border-slate-200 pl-2">
              {[
                { id: 'All', label: 'All Diets' },
                { id: 'Veg', label: 'Pure Veg 🌱' },
                { id: 'NonVeg', label: 'Veg + Non-Veg 🍗' },
              ].map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDietaryFilter(d.id as any)}
                  className={`px-3 py-1.5 rounded-xl border text-xs transition-all ${
                    dietaryFilter === d.id
                      ? 'bg-slate-900 text-white border-slate-900 font-bold shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CATERERS DIRECTORY GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredCaterers.map((caterer) => (
            <div
              key={caterer.id}
              className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Header Cover & Quick Info */}
                <div className="relative h-52 w-full overflow-hidden bg-slate-900">
                  <img
                    src={caterer.coverImage}
                    alt={caterer.brand}
                    className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span
                      className={`px-3 py-1 rounded-xl text-xs font-bold backdrop-blur-md shadow-sm ${
                        caterer.isPureVeg
                          ? 'bg-emerald-600/90 text-white'
                          : 'bg-rose-600/90 text-white'
                      }`}
                    >
                      {caterer.isPureVeg ? '🌱 Pure Vegetarian' : '🍗 Veg & Non-Veg'}
                    </span>

                    {/* Instagram Profile Pill */}
                    <a
                      href={caterer.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white text-xs font-bold shadow-md hover:opacity-95 transition-opacity"
                      title="Inspect Instagram Page & Past Food Videos"
                    >
                      <Instagram className="w-3.5 h-3.5" />
                      <span>{caterer.instagramHandle}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Caterer Brand Title & City */}
                  <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-white">
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <h3 className="text-lg sm:text-xl font-black drop-shadow-md">
                          {caterer.brand}
                        </h3>
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      </div>
                      <span className="text-xs text-slate-300 flex items-center mt-0.5">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-amber-400" />
                        {caterer.city} • Led by {caterer.name}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-300 block uppercase font-bold">
                        Starts At
                      </span>
                      <span className="text-lg font-black text-amber-300">
                        ₹{caterer.pricePerPlate}
                      </span>
                      <span className="text-[10px] text-slate-300 block">/ plate</span>
                    </div>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-6 space-y-4">
                  {/* Rating & Stats Strip */}
                  <div className="flex items-center justify-between text-xs text-slate-600 pb-3 border-b border-slate-100">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="font-extrabold text-slate-900">{caterer.rating}</span>
                      <span className="text-slate-400">({caterer.reviewCount} events reviewed)</span>
                    </div>
                    <span>•</span>
                    <span className="font-semibold text-slate-700">{caterer.experienceYears} Years Exp</span>
                    <span>•</span>
                    <span className="text-slate-500">Min {caterer.minGuests} Guests</span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {caterer.bio}
                  </p>

                  {/* Cuisine Badges */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Signature Cuisines
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {caterer.cuisines.map((c) => (
                        <span
                          key={c}
                          className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 text-[11px] font-semibold border border-amber-200/60"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Recent Real Projects Preview */}
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 flex items-center">
                        <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-600" />
                        Verified Past Projects:
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedCatererForProjects(caterer)}
                        className="text-amber-700 font-bold hover:underline text-[11px] flex items-center space-x-0.5"
                      >
                        <span>See All Setups & Menu</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {caterer.projects.slice(0, 2).map((p, idx) => (
                        <div
                          key={idx}
                          onClick={() => setSelectedCatererForProjects(caterer)}
                          className="group/p cursor-pointer bg-white p-2 rounded-xl border border-slate-200 hover:border-amber-400 transition-all flex items-center space-x-2"
                        >
                          <img
                            src={p.image}
                            alt={p.title}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <h5 className="font-bold text-slate-900 text-[11px] truncate group-hover/p:text-amber-700">
                              {p.title}
                            </h5>
                            <span className="text-[10px] text-slate-400 block truncate">
                              {p.type}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="p-6 pt-0 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedCatererForProjects(caterer)}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center space-x-1.5"
                >
                  <Eye className="w-4 h-4 text-slate-400" />
                  <span>View Projects & Menu</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedCatererForBooking(caterer)}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-1.5"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Caterer</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PROJECT SHOWCASE & SAMPLE MENU MODAL */}
      {selectedCatererForProjects && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
                  Caterer Showcase & Past Projects
                </span>
                <h3 className="text-xl font-black text-slate-900">
                  {selectedCatererForProjects.brand}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCatererForProjects(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {/* Instagram Profile Callout */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-50 via-purple-50 to-indigo-50 border border-pink-200/60 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md">
                  <Instagram className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Official Instagram Project Reel
                  </h4>
                  <p className="text-xs text-slate-600">
                    See live wedding setup videos, guest tasting reactions & food presentations
                  </p>
                </div>
              </div>

              <a
                href={selectedCatererForProjects.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-white border border-pink-300 hover:bg-pink-50 text-pink-700 font-bold text-xs flex items-center space-x-1.5 shadow-sm"
              >
                <span>{selectedCatererForProjects.instagramHandle}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Real Project Cards */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Photo Gallery of Past Completed Banquets
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedCatererForProjects.projects.map((proj, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 flex flex-col justify-between"
                  >
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={proj.image}
                        alt={proj.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-slate-950/75 text-white text-[11px] font-bold backdrop-blur-md">
                        {proj.type}
                      </span>
                    </div>
                    <div className="p-3.5 space-y-2">
                      <h5 className="font-bold text-slate-900 text-sm">{proj.title}</h5>
                      <div className="flex flex-wrap gap-1 text-[10px]">
                        {proj.menuHighlights.map((m) => (
                          <span
                            key={m}
                            className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700"
                          >
                            ✓ {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sample Menu Blueprint */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Sample Signature Menu Breakdown (Included at ₹{selectedCatererForProjects.pricePerPlate}/plate)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/60">
                  <span className="font-bold text-amber-900 block mb-1">
                    🥂 Welcome Drinks
                  </span>
                  <p className="text-slate-700 leading-relaxed">
                    {selectedCatererForProjects.sampleMenu.welcomeDrinks.join(' • ')}
                  </p>
                </div>

                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/60">
                  <span className="font-bold text-amber-900 block mb-1">
                    🍢 Passed Starters
                  </span>
                  <p className="text-slate-700 leading-relaxed">
                    {selectedCatererForProjects.sampleMenu.starters.join(' • ')}
                  </p>
                </div>

                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/60">
                  <span className="font-bold text-amber-900 block mb-1">
                    🍲 Grand Main Courses
                  </span>
                  <p className="text-slate-700 leading-relaxed">
                    {selectedCatererForProjects.sampleMenu.mains.join(' • ')}
                  </p>
                </div>

                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/60">
                  <span className="font-bold text-amber-900 block mb-1">
                    🍨 Live Counters & Desserts
                  </span>
                  <p className="text-slate-700 leading-relaxed">
                    {selectedCatererForProjects.sampleMenu.desserts.join(' • ')}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Bottom CTA */}
            <div className="pt-2 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setSelectedCatererForProjects(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Close Showcase
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedCatererForBooking(selectedCatererForProjects);
                  setSelectedCatererForProjects(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md transition-colors"
              >
                Proceed to Book This Caterer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOOK CATERER MODAL */}
      {selectedCatererForBooking && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
                  Catering Reservation
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  Book {selectedCatererForBooking.brand}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCatererForBooking(null)}
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
                  Catering Request & Food Tasting Booked!
                </h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                  Head Chef <strong>{selectedCatererForBooking.name}</strong> has received your reservation. Their team will contact you to arrange a complimentary food tasting session.
                </p>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4 text-xs">
                <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 space-y-1">
                  <div className="flex justify-between font-semibold text-slate-700">
                    <span>Base Rate:</span>
                    <span className="text-slate-900 font-bold">
                      ₹{selectedCatererForBooking.pricePerPlate} / plate
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold text-slate-700">
                    <span>Estimated Catering Total:</span>
                    <span className="text-amber-700 font-bold">
                      {formatINR(guestCount * selectedCatererForBooking.pricePerPlate)} ({guestCount} Guests)
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Event Date
                    </label>
                    <input
                      type="date"
                      required
                      value={eventDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Number of Guests
                    </label>
                    <input
                      type="number"
                      min={selectedCatererForBooking.minGuests}
                      max={2000}
                      step={10}
                      required
                      value={guestCount}
                      onChange={(e) => setGuestCount(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Meal Format
                  </label>
                  <select
                    value={mealType}
                    onChange={(e) => setMealType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="Dinner Buffet">Dinner Buffet & Live Counters</option>
                    <option value="Lunch Buffet">Lunch Buffet & Welcome Drinks</option>
                    <option value="Traditional Banana Leaf Seated Dining">Traditional Banana Leaf Seated Dining</option>
                    <option value="High Tea & Live Chaat Stalls">High Tea & Live Chaat / Snack Stalls</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Ramesh Iyer"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Phone / WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setSelectedCatererForBooking(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md transition-colors"
                  >
                    Confirm & Request Tasting
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
