import { ProviderProfession, PortfolioProject, CatererMenu } from '../types';

export interface ProviderExtraData {
  profession: ProviderProfession;
  specialties: string[];
  hourlyRate: number;
  pricePerSqFt?: number;
  pricePerPlate?: number;
  fssaiNumber?: string;
  councilRegistration?: string;
  tastingAvailable?: boolean;
  minGuests?: number;
  portfolioProjects: PortfolioProject[];
  catererMenus: CatererMenu[];
  appliancesHandled?: string[];
  toolsCertified?: string[];
  eventTypes?: string[];
}

export const DEFAULT_DESIGNER_PORTFOLIO: PortfolioProject[] = [
  {
    id: 'port-1',
    title: 'Modern Minimalist Haven (3 BHK)',
    theme: 'Simple & Minimalist',
    areaSqFt: 1450,
    cost: 2150000,
    imageUrl: '/interiors/simple_minimalist.jpg',
    clientName: 'Rahul & Priya Sharma',
    completionDate: 'August 2026',
    description: 'Clean Scandinavian lines, hidden storage, warm oak laminate with fluted panels, and custom LED cove profile lighting.',
    tags: ['Scandinavian', 'Beige Palette', 'Modular Kitchen', 'Hidden Storage']
  },
  {
    id: 'port-2',
    title: 'Heritage Elegance (Modest Indian)',
    theme: 'Modest Indian Modern',
    areaSqFt: 1850,
    cost: 3200000,
    imageUrl: '/interiors/modest_indian.jpg',
    clientName: 'Venkatesh Iyer',
    completionDate: 'June 2026',
    description: 'Traditional solid teakwood pooja mandir, brass jali accents, brass inlay tiles, and warm terracotta living spaces.',
    tags: ['Teakwood', 'Brass Accents', 'Vastu Compliant', 'Pooja Room']
  },
  {
    id: 'port-3',
    title: 'Executive Tech Studio & Home Office',
    theme: 'Executive Office Look',
    areaSqFt: 850,
    cost: 1650000,
    imageUrl: '/interiors/office_look.jpg',
    clientName: 'Siddharth Nair',
    completionDate: 'September 2026',
    description: 'Acoustic slat wall cladding, integrated cable conduits, dual-monitor ergonomic desk, and dimmable task lighting.',
    tags: ['Acoustic Cladding', 'Ergonomic', 'Smart Lighting', 'Soundproof']
  },
  {
    id: 'port-4',
    title: 'Luxury Turnkey Kitchen & Living Overhaul',
    theme: 'Turnkey Renovation',
    areaSqFt: 1200,
    cost: 2400000,
    imageUrl: '/interiors/renovation_kitchen.jpg',
    clientName: 'Ananya Deshmukh',
    completionDate: 'July 2026',
    description: 'Full quartz countertop replacement, Blum soft-close tandem boxes, built-in microwave & dishwasher, and subway tiles.',
    tags: ['Quartz Countertop', 'Blum Fittings', 'Turnkey Civil', 'Appliance Integration']
  }
];

export const DEFAULT_CATERER_MENUS: CatererMenu[] = [
  {
    id: 'menu-1',
    name: 'Kashmiri Dum Pukht Biryani & Burani Raita',
    category: 'main',
    dietType: 'non-veg',
    pricePerPlate: 450,
    description: 'Slow-cooked royal Awadhi style with saffron basmati rice, tender cuts, and coal-infused smoke.',
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500'
  },
  {
    id: 'menu-2',
    name: 'Truffle Shahi Paneer with Garlic Laccha Paratha',
    category: 'main',
    dietType: 'veg',
    pricePerPlate: 380,
    description: 'Silky cashew-tomato reduction infused with white truffle essence and cottage cheese cubes.',
    imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500'
  },
  {
    id: 'menu-3',
    name: 'Smoked Dahi Ke Kebab & Mint Emulsion',
    category: 'starter',
    dietType: 'veg',
    pricePerPlate: 220,
    description: 'Hung curd croquettes infused with green cardamom, roasted cumin, and pomegranate glaze.',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500'
  },
  {
    id: 'menu-4',
    name: 'Jain Malai Kofta & Zafrani Pulao',
    category: 'main',
    dietType: 'jain',
    pricePerPlate: 340,
    description: 'Strictly zero onion zero garlic, khoya stuffed paneer dumplings in sweet-savory almond gravy.',
    imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=500'
  },
  {
    id: 'menu-5',
    name: 'Live Nitrogen Ice Cream & Gulab Jamun Fondue',
    category: 'dessert',
    dietType: 'veg',
    pricePerPlate: 280,
    description: 'Spectacular live dessert counter with instant frozen pistachio cream and warm cardamom syrup.',
    imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=500'
  }
];

export const getProviderExtra = (identifier?: string): ProviderExtraData => {
  const key = identifier ? `fixora_provider_extra_${identifier}` : 'fixora_current_provider_extra';
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to read provider extra from storage', e);
  }

  // Default fallback if not found yet
  return {
    profession: 'technician',
    specialties: ['Inverter Split AC', 'Double Door Refrigerator', 'Front Load Washing Machine'],
    hourlyRate: 450,
    pricePerSqFt: 1850,
    pricePerPlate: 650,
    fssaiNumber: '11223344556677',
    councilRegistration: 'CA/2021/84729',
    tastingAvailable: true,
    minGuests: 30,
    portfolioProjects: DEFAULT_DESIGNER_PORTFOLIO,
    catererMenus: DEFAULT_CATERER_MENUS,
    appliancesHandled: ['Inverter Split AC', 'Double Door Refrigerator', 'Front Load Washing Machine', 'RO Purifier', 'Kitchen Chimney'],
    toolsCertified: ['Digital Manifold', 'Vacuum Pump', 'Fluke Clamp Meter', 'Nitrogen Tester'],
    eventTypes: ['Weddings', 'Corporate Galas', 'Private Birthdays']
  };
};

export const saveProviderExtra = (identifier: string, data: Partial<ProviderExtraData>): ProviderExtraData => {
  const existing = getProviderExtra(identifier);
  const updated: ProviderExtraData = {
    ...existing,
    ...data,
    portfolioProjects: data.portfolioProjects || existing.portfolioProjects,
    catererMenus: data.catererMenus || existing.catererMenus
  };

  try {
    const userKey = `fixora_provider_extra_${identifier}`;
    localStorage.setItem(userKey, JSON.stringify(updated));
    localStorage.setItem('fixora_current_provider_extra', JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to write provider extra to storage', e);
  }

  return updated;
};
