import axios, { AxiosError } from 'axios';
import {
  User,
  ProviderProfile,
  ProviderAvailability,
  Category,
  Service,
  Booking,
  BookingStatus,
  Review,
  Payment,
  Appliance,
  ServiceReminder,
  BillWarranty,
  Complaint,
  Favorite,
  Conversation,
  Message,
  Notification,
  AdminStats,
  Role,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fixora_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear token if unauthorized
      // localStorage.removeItem('fixora_token');
    }
    return Promise.reject(error);
  }
);

// ==========================================
// MOCK DATA STORE FOR OFFLINE / INSTANT DEMO
// ==========================================
const mockCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'AC & Cooling',
    slug: 'ac-cooling',
    description: 'Deep service, gas leak repair, installation & seasonal tune-up.',
    icon: 'Snowflake',
    isActive: true,
    _count: { services: 4 }
  },
  {
    id: 'cat-2',
    name: 'Refrigeration',
    slug: 'refrigeration',
    description: 'Compressor fixes, frost buildup, thermostat & coil diagnostics.',
    icon: 'Refrigerator',
    isActive: true,
    _count: { services: 3 }
  },
  {
    id: 'cat-3',
    name: 'Washing Machine',
    slug: 'washing-machine',
    description: 'Motor repair, drainage issues, drum noise & PCB board replacement.',
    icon: 'Waves',
    isActive: true,
    _count: { services: 3 }
  },
  {
    id: 'cat-4',
    name: 'Kitchen Appliances',
    slug: 'kitchen-appliances',
    description: 'Microwaves, chimneys, ovens, induction cooktops & dishwashers.',
    icon: 'Utensils',
    isActive: true,
    _count: { services: 4 }
  },
  {
    id: 'cat-5',
    name: 'Water Purifier & RO',
    slug: 'water-purifier',
    description: 'Filter membrane changes, TDS adjustment, UV lamp restoration.',
    icon: 'Droplet',
    isActive: true,
    _count: { services: 2 }
  },
  {
    id: 'cat-6',
    name: 'Electrical & Power',
    slug: 'electrical-power',
    description: 'Circuit breakers, geysers, inverters, switches & full rewiring.',
    icon: 'Zap',
    isActive: true,
    _count: { services: 4 }
  }
];

const mockProviders: ProviderProfile[] = [
  {
    id: 'prov-1',
    userId: 'user-prov-1',
    bio: 'HVAC Master Specialist with 8+ years fixing residential and VRF inverter air conditioners.',
    experienceYears: 8,
    hourlyRate: 399,
    rating: 4.9,
    reviewCount: 124,
    isVerified: true,
    isAvailable: true,
    city: 'Bengaluru',
    state: 'Karnataka',
    user: {
      id: 'user-prov-1',
      email: 'alex.technician@fixora.com',
      name: 'Rajesh Sharma',
      avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150',
      role: 'PROVIDER',
      isActive: true,
      city: 'Bengaluru',
      createdAt: '2023-01-15'
    },
    availabilities: [
      { id: 'av-1', providerId: 'prov-1', dayOfWeek: 1, startTime: '08:00', endTime: '18:00', isAvailable: true },
      { id: 'av-2', providerId: 'prov-1', dayOfWeek: 2, startTime: '08:00', endTime: '18:00', isAvailable: true },
      { id: 'av-3', providerId: 'prov-1', dayOfWeek: 3, startTime: '08:00', endTime: '18:00', isAvailable: true },
      { id: 'av-4', providerId: 'prov-1', dayOfWeek: 4, startTime: '08:00', endTime: '18:00', isAvailable: true },
      { id: 'av-5', providerId: 'prov-1', dayOfWeek: 5, startTime: '08:00', endTime: '18:00', isAvailable: true },
      { id: 'av-6', providerId: 'prov-1', dayOfWeek: 6, startTime: '09:00', endTime: '15:00', isAvailable: true },
      { id: 'av-7', providerId: 'prov-1', dayOfWeek: 0, startTime: '10:00', endTime: '14:00', isAvailable: false },
    ]
  },
  {
    id: 'prov-2',
    userId: 'user-prov-2',
    bio: 'Senior appliance engineer for LG, Samsung, and Bosch front-load washers and refrigerators.',
    experienceYears: 6,
    hourlyRate: 349,
    rating: 4.8,
    reviewCount: 98,
    isVerified: true,
    isAvailable: true,
    city: 'Mumbai',
    state: 'Maharashtra',
    user: {
      id: 'user-prov-2',
      email: 'marcus.service@fixora.com',
      name: 'Aakash Kulkarni',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      role: 'PROVIDER',
      isActive: true,
      city: 'Mumbai',
      createdAt: '2023-03-20'
    },
    availabilities: [
      { id: 'av-8', providerId: 'prov-2', dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isAvailable: true },
      { id: 'av-9', providerId: 'prov-2', dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isAvailable: true },
      { id: 'av-10', providerId: 'prov-2', dayOfWeek: 3, startTime: '09:00', endTime: '17:00', isAvailable: true },
      { id: 'av-11', providerId: 'prov-2', dayOfWeek: 4, startTime: '09:00', endTime: '17:00', isAvailable: true },
      { id: 'av-12', providerId: 'prov-2', dayOfWeek: 5, startTime: '09:00', endTime: '17:00', isAvailable: true },
    ]
  },
  {
    id: 'prov-3',
    userId: 'user-prov-3',
    bio: 'Certified electrical technician & kitchen appliance expert. Quick, clean, and reliable repairs.',
    experienceYears: 10,
    hourlyRate: 449,
    rating: 4.95,
    reviewCount: 165,
    isVerified: true,
    isAvailable: true,
    city: 'Delhi-NCR',
    state: 'Delhi',
    user: {
      id: 'user-prov-3',
      email: 'elena.tech@fixora.com',
      name: 'Pooja Verma',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      role: 'PROVIDER',
      isActive: true,
      city: 'Delhi-NCR',
      createdAt: '2022-11-10'
    }
  }
];

const mockServices: Service[] = [
  {
    id: 'serv-1',
    categoryId: 'cat-1',
    name: 'AC Jet-Pump Deep Cleaning & Sanitization',
    slug: 'ac-jet-pump-deep-cleaning',
    description: 'High-pressure water pump foam cleaning of indoor & outdoor cooling coils, tray, and blower fan. Eliminates 99% odors and restores 100% cooling power.',
    basePrice: 499,
    durationMinutes: 60,
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600',
    isActive: true,
    category: mockCategories[0],
    providers: [{ provider: mockProviders[0] }],
    _count: { reviews: 84, bookings: 215 },
    reviews: [
      {
        id: 'rev-1',
        bookingId: 'book-1',
        customerId: 'user-cust-1',
        providerId: 'prov-1',
        serviceId: 'serv-1',
        rating: 5,
        comment: 'Alex arrived right on time with high-pressure gear! My AC smells brand new and cools within minutes.',
        createdAt: '2024-05-10',
        customer: { id: 'user-cust-1', name: 'Sophia Miller', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' }
      }
    ]
  },
  {
    id: 'serv-2',
    categoryId: 'cat-1',
    name: 'AC Gas Leak Diagnosis & Freon Recharge',
    slug: 'ac-gas-leak-recharge',
    description: 'Nitrogen pressure leak testing, brazing repair, vacuuming, and pure R32/R410A refrigerant top-up with digital manifold gauge.',
    basePrice: 1899,
    durationMinutes: 90,
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600',
    isActive: true,
    category: mockCategories[0],
    providers: [{ provider: mockProviders[0] }],
    _count: { reviews: 42, bookings: 130 }
  },
  {
    id: 'serv-3',
    categoryId: 'cat-2',
    name: 'Double-Door Refrigerator Comprehensive Repair',
    slug: 'refrigerator-comprehensive-repair',
    description: 'No-frost fan motor, starter relay, condenser coil, or thermostat replacement. Same-day cold restoration guaranteed.',
    basePrice: 1499,
    durationMinutes: 75,
    image: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600',
    isActive: true,
    category: mockCategories[1],
    providers: [{ provider: mockProviders[1] }],
    _count: { reviews: 56, bookings: 178 }
  },
  {
    id: 'serv-4',
    categoryId: 'cat-3',
    name: 'Front-Load Washing Machine Drum & Bearing Overhaul',
    slug: 'washing-machine-drum-overhaul',
    description: 'Fixes loud banging noises, excessive vibration during spin cycle, and leaking door bellows. Genuine OEM bearings and shocks.',
    basePrice: 1299,
    durationMinutes: 120,
    image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600',
    isActive: true,
    category: mockCategories[2],
    providers: [{ provider: mockProviders[1] }],
    _count: { reviews: 63, bookings: 194 }
  },
  {
    id: 'serv-5',
    categoryId: 'cat-4',
    name: 'Kitchen Chimney & Baffle Filter Degreasing',
    slug: 'chimney-baffle-degreasing',
    description: 'Non-corrosive chemical ultrasonic cleaning for suction blowers, oil collectors, and heavy grease accumulation.',
    basePrice: 899,
    durationMinutes: 60,
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600',
    isActive: true,
    category: mockCategories[3],
    providers: [{ provider: mockProviders[2] }],
    _count: { reviews: 39, bookings: 92 }
  },
  {
    id: 'serv-6',
    categoryId: 'cat-5',
    name: 'RO Water Purifier Complete Membrane & Filter Swap',
    slug: 'ro-membrane-filter-swap',
    description: 'Includes sediment filter, activated carbon block, pre-carbon, RO 75 GPD membrane, UV tube and mineralizer cartridge.',
    basePrice: 999,
    durationMinutes: 45,
    image: 'https://images.unsplash.com/photo-1527694224090-f2038a8e1003?w=600',
    isActive: true,
    category: mockCategories[4],
    providers: [{ provider: mockProviders[2] }],
    _count: { reviews: 71, bookings: 240 }
  }
];

let mockBookings: Booking[] = [
  {
    id: 'book-101',
    bookingNumber: 'FIX-839201',
    customerId: 'user-cust-1',
    providerId: 'prov-1',
    serviceId: 'serv-1',
    scheduledAt: new Date(Date.now() + 86400000 * 2).toISOString(),
    address: 'Flat 402, Shanti Niketan Apt, 100ft Road, Indiranagar',
    city: 'Bengaluru',
    notes: 'Please bring ladder. The compressor unit is situated on high balcony bracket.',
    totalPrice: 499,
    status: 'CONFIRMED',
    paymentStatus: 'PAID',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    service: mockServices[0],
    provider: mockProviders[0],
    customer: {
      id: 'user-cust-1',
      name: 'Sophia Miller',
      email: 'customer@fixora.com',
      role: 'CUSTOMER',
      isActive: true,
      phone: '+91 98765 43210',
      createdAt: '2023-01-01'
    }
  },
  {
    id: 'book-102',
    bookingNumber: 'FIX-612493',
    customerId: 'user-cust-1',
    providerId: 'prov-2',
    serviceId: 'serv-4',
    scheduledAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    address: 'Flat 402, Shanti Niketan Apt, 100ft Road, Indiranagar',
    city: 'Bengaluru',
    notes: 'Drum makes grinding sound when spinning fast.',
    totalPrice: 1299,
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    service: mockServices[3],
    provider: mockProviders[1],
    customer: {
      id: 'user-cust-1',
      name: 'Sophia Miller',
      email: 'customer@fixora.com',
      role: 'CUSTOMER',
      isActive: true,
      createdAt: '2023-01-01'
    }
  }
];

let mockAppliances: Appliance[] = [
  {
    id: 'app-1',
    userId: 'user-cust-1',
    name: 'Living Room Dual Inverter AC',
    brand: 'LG',
    modelNumber: 'MS-Q18YNZA',
    serialNumber: 'LGA-928374-2023',
    category: 'AC & Cooling',
    purchaseDate: '2023-04-12',
    warrantyExpiryDate: '2026-04-12',
    location: 'Main Living Hall',
    notes: 'Installed with copper piping upgrade and anti-rust gold fin protection.',
    createdAt: '2023-04-15'
  },
  {
    id: 'app-2',
    userId: 'user-cust-1',
    name: 'Front-Load EcoSilence Washing Machine',
    brand: 'Bosch',
    modelNumber: 'WAJ2416SIN',
    serialNumber: 'BSH-19284-88',
    category: 'Washing Machine',
    purchaseDate: '2022-11-20',
    warrantyExpiryDate: '2024-11-20',
    location: 'Utility Balcony',
    notes: 'Requires descaling treatment every 4 months.',
    createdAt: '2022-11-25'
  }
];

let mockReminders: ServiceReminder[] = [
  {
    id: 'rem-1',
    userId: 'user-cust-1',
    applianceId: 'app-1',
    serviceType: 'Seasonal AC Filter Jet Clean',
    dueDate: new Date(Date.now() + 86400000 * 14).toISOString(),
    frequencyMonths: 6,
    status: 'PENDING',
    notes: 'Pre-summer maintenance before heatwave season.',
    appliance: mockAppliances[0]
  },
  {
    id: 'rem-2',
    userId: 'user-cust-1',
    applianceId: 'app-2',
    serviceType: 'Drum Descaling & Gasket Check',
    dueDate: new Date(Date.now() + 86400000 * 30).toISOString(),
    frequencyMonths: 4,
    status: 'PENDING',
    notes: 'Prevent hard water scale and detergent residue buildup.',
    appliance: mockAppliances[1]
  }
];

let mockWarranties: BillWarranty[] = [
  {
    id: 'doc-1',
    userId: 'user-cust-1',
    applianceId: 'app-1',
    title: 'LG 1.5 Ton AC Purchase Tax Invoice & 5-Yr PCB Warranty',
    documentType: 'WARRANTY',
    documentUrl: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=600',
    fileType: 'application/pdf',
    fileSize: 1048576,
    vendor: 'Best Buy Electronics',
    amount: 650.00,
    purchaseDate: '2023-04-12',
    expiryDate: '2028-04-12',
    notes: '5 year compressor & PCB warranty card stamped.',
    createdAt: '2023-04-15',
    appliance: mockAppliances[0]
  },
  {
    id: 'doc-2',
    userId: 'user-cust-1',
    applianceId: 'app-2',
    title: 'Bosch Washing Machine Official Retail Bill',
    documentType: 'BILL',
    documentUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600',
    fileType: 'image/jpeg',
    fileSize: 524288,
    vendor: 'Home Depot Appliance Center',
    amount: 520.00,
    purchaseDate: '2022-11-20',
    expiryDate: '2024-11-20',
    notes: 'Standard 2-year manufacturer coverage.',
    createdAt: '2022-11-25',
    appliance: mockAppliances[1]
  }
];

let mockComplaints: Complaint[] = [
  {
    id: 'cmp-1',
    ticketNumber: 'CMP-829104',
    customerId: 'user-cust-1',
    providerId: 'user-prov-1',
    bookingId: 'book-101',
    subject: 'Minor drip from outdoor drainage hose',
    description: 'After the initial inspection, water is dripping slightly on neighbor balcony. Technician needs to re-fasten clip.',
    priority: 'LOW',
    status: 'IN_INVESTIGATION',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    customer: { id: 'user-cust-1', name: 'Sophia Miller', email: 'customer@fixora.com' },
    booking: { id: 'book-101', bookingNumber: 'FIX-839201' }
  }
];

let mockFavorites: Favorite[] = [
  {
    id: 'fav-1',
    customerId: 'user-cust-1',
    serviceId: 'serv-1',
    service: mockServices[0],
    createdAt: '2024-01-10'
  },
  {
    id: 'fav-2',
    customerId: 'user-cust-1',
    providerId: 'prov-1',
    provider: mockProviders[0],
    createdAt: '2024-01-12'
  }
];

let mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    userId: 'user-cust-1',
    title: 'Booking Confirmed!',
    message: 'Alex Vance has confirmed your AC Jet-Pump Service for tomorrow.',
    type: 'BOOKING',
    referenceId: 'book-101',
    link: '/my-bookings',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'notif-2',
    userId: 'user-cust-1',
    title: 'Appliance Reminder Due',
    message: 'Your Bosch Washing Machine descaling is due in 30 days.',
    type: 'REMINDER',
    referenceId: 'rem-2',
    link: '/appliances',
    isRead: false,
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

let mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    customerId: 'user-cust-1',
    providerId: 'user-prov-1',
    bookingId: 'book-101',
    lastMessageAt: new Date(Date.now() - 1800000).toISOString(),
    customer: {
      id: 'user-cust-1',
      name: 'Sophia Miller',
      email: 'customer@fixora.com',
      role: 'CUSTOMER',
      isActive: true,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
      createdAt: '2023-01-01'
    },
    provider: {
      id: 'user-prov-1',
      name: 'Alex Vance',
      email: 'alex.technician@fixora.com',
      role: 'PROVIDER',
      isActive: true,
      avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150',
      createdAt: '2023-01-15'
    },
    booking: mockBookings[0],
    messages: [
      {
        id: 'msg-1',
        conversationId: 'conv-1',
        senderId: 'user-cust-1',
        receiverId: 'user-prov-1',
        content: 'Hi Alex! Just confirming if you need parking arrangements at my building?',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        isRead: true,
        sender: { id: 'user-cust-1', name: 'Sophia Miller', role: 'CUSTOMER' }
      },
      {
        id: 'msg-2',
        conversationId: 'conv-1',
        senderId: 'user-prov-1',
        receiverId: 'user-cust-1',
        content: 'Hello Sophia! Yes, visitor parking spot 12 or 14 would be awesome. I will bring the jet-pump kit.',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        isRead: true,
        sender: { id: 'user-prov-1', name: 'Alex Vance', role: 'PROVIDER' }
      }
    ]
  }
];

// Helper to wrap real request with fallback
async function executeApiCall<T>(apiFn: () => Promise<{ data: any }>, fallbackData: T): Promise<T> {
  try {
    const res = await apiFn();
    return res.data?.data !== undefined ? res.data.data : res.data;
  } catch (err: any) {
    // If backend is offline or network error, fallback to curated mock data
    console.warn('[Fixora API Notice]: Backend unreachable or returned error, using local fallback state.', err.message);
    return fallbackData;
  }
}

// ==========================================
// EXPORTED API MODULES
// ==========================================

export const authApi = {
  login: async (credentials: { email: string; password?: string }) => {
    return executeApiCall(
      () => apiClient.post('/auth/login', credentials),
      {
        user: {
          id: credentials.email.includes('admin')
            ? 'user-admin-1'
            : credentials.email.includes('provider')
            ? 'user-prov-1'
            : 'user-cust-1',
          email: credentials.email,
          name: credentials.email.includes('admin')
            ? 'Fixora System Admin'
            : credentials.email.includes('provider')
            ? 'Alex Vance (Technician)'
            : 'Sophia Miller (Customer)',
          role: credentials.email.includes('admin')
            ? ('ADMIN' as Role)
            : credentials.email.includes('provider')
            ? ('PROVIDER' as Role)
            : ('CUSTOMER' as Role),
          isActive: true,
          city: 'New York',
          avatar: credentials.email.includes('provider')
            ? 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150'
            : credentials.email.includes('admin')
            ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
            : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
          createdAt: '2023-01-01',
          providerProfile: credentials.email.includes('provider') ? mockProviders[0] : null
        },
        token: 'mock-jwt-token-' + Date.now()
      }
    );
  },

  register: async (data: any) => {
    return executeApiCall(
      () => apiClient.post('/auth/register', data),
      {
        user: {
          id: 'user-new-' + Date.now(),
          email: data.email,
          name: data.name,
          role: data.role || 'CUSTOMER',
          phone: data.phone,
          city: data.city,
          isActive: true,
          createdAt: new Date().toISOString()
        },
        token: 'mock-jwt-token-new-' + Date.now()
      }
    );
  },

  getMe: async () => {
    return executeApiCall(
      () => apiClient.get('/auth/me'),
      {
        id: 'user-cust-1',
        email: 'customer@fixora.com',
        name: 'Sophia Miller',
        role: 'CUSTOMER' as Role,
        isActive: true,
        city: 'New York',
        createdAt: '2023-01-01'
      }
    );
  },

  updateProfile: async (data: any) => {
    return executeApiCall(
      () => apiClient.put('/users/profile', data),
      data
    );
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    return executeApiCall(
      () => apiClient.put('/auth/change-password', data),
      { message: 'Password updated successfully' }
    );
  }
};

export const servicesApi = {
  getServices: async (params?: { categorySlug?: string; categoryId?: string; search?: string; sortBy?: string }) => {
    return executeApiCall(
      () => apiClient.get('/services', { params }),
      mockServices.filter(s => {
        if (params?.categorySlug && s.category?.slug !== params.categorySlug) return false;
        if (params?.categoryId && s.categoryId !== params.categoryId) return false;
        if (params?.search && !s.name.toLowerCase().includes(params.search.toLowerCase())) return false;
        return true;
      })
    );
  },

  getServiceByIdOrSlug: async (idOrSlug: string) => {
    return executeApiCall(
      () => apiClient.get(`/services/${idOrSlug}`),
      mockServices.find(s => s.id === idOrSlug || s.slug === idOrSlug) || mockServices[0]
    );
  },

  createService: async (data: any) => {
    return executeApiCall(
      () => apiClient.post('/services', data),
      { id: 'serv-' + Date.now(), ...data }
    );
  },

  updateService: async (id: string, data: any) => {
    return executeApiCall(
      () => apiClient.put(`/services/${id}`, data),
      { id, ...data }
    );
  },

  deleteService: async (id: string) => {
    return executeApiCall(
      () => apiClient.delete(`/services/${id}`),
      { success: true }
    );
  }
};

export const categoriesApi = {
  getCategories: async () => {
    return executeApiCall(
      () => apiClient.get('/categories'),
      mockCategories
    );
  },

  getCategoryBySlugOrId: async (idOrSlug: string) => {
    return executeApiCall(
      () => apiClient.get(`/categories/${idOrSlug}`),
      mockCategories.find(c => c.id === idOrSlug || c.slug === idOrSlug) || mockCategories[0]
    );
  }
};

export const providersApi = {
  getProviders: async (params?: any) => {
    return executeApiCall(
      () => apiClient.get('/providers', { params }),
      mockProviders
    );
  },

  getProviderById: async (id: string) => {
    return executeApiCall(
      () => apiClient.get(`/providers/${id}`),
      mockProviders.find(p => p.id === id || p.userId === id) || mockProviders[0]
    );
  },

  updateAvailability: async (schedules: ProviderAvailability[]) => {
    return executeApiCall(
      () => apiClient.put('/providers/availability', { schedules }),
      schedules
    );
  }
};

export const bookingsApi = {
  getMyBookings: async (params?: { status?: string }) => {
    return executeApiCall(
      () => apiClient.get('/bookings/my-bookings', { params }),
      mockBookings.filter(b => (!params?.status || params.status === 'ALL' || b.status === params.status))
    );
  },

  getBookingById: async (id: string) => {
    return executeApiCall(
      () => apiClient.get(`/bookings/${id}`),
      mockBookings.find(b => b.id === id) || mockBookings[0]
    );
  },

  createBooking: async (bookingData: any) => {
    const service = mockServices.find(s => s.id === bookingData.serviceId) || mockServices[0];
    const provider = mockProviders.find(p => p.id === bookingData.providerId) || mockProviders[0];
    const newBooking: Booking = {
      id: 'book-' + Date.now(),
      bookingNumber: 'FIX-' + Math.floor(100000 + Math.random() * 900000),
      customerId: 'user-cust-1',
      providerId: provider.id,
      serviceId: service.id,
      scheduledAt: bookingData.scheduledAt,
      address: bookingData.address,
      city: bookingData.city || 'New York',
      notes: bookingData.notes,
      totalPrice: service.basePrice,
      status: 'PENDING',
      paymentStatus: 'PENDING',
      createdAt: new Date().toISOString(),
      service,
      provider
    };
    mockBookings = [newBooking, ...mockBookings];

    return executeApiCall(
      () => apiClient.post('/bookings', bookingData),
      newBooking
    );
  },

  updateStatus: async (id: string, status: BookingStatus, notes?: string) => {
    mockBookings = mockBookings.map(b => b.id === id ? { ...b, status } : b);
    return executeApiCall(
      () => apiClient.patch(`/bookings/${id}/status`, { status, notes }),
      mockBookings.find(b => b.id === id)
    );
  },

  cancelBooking: async (id: string, reason?: string) => {
    mockBookings = mockBookings.map(b => b.id === id ? { ...b, status: 'CANCELLED' } : b);
    return executeApiCall(
      () => apiClient.post(`/bookings/${id}/cancel`, { reason }),
      { success: true }
    );
  }
};

export const paymentsApi = {
  processPayment: async (data: { bookingId: string; amount: number; method: string; currency?: string }) => {
    const payment: Payment = {
      id: 'pay-' + Date.now(),
      bookingId: data.bookingId,
      customerId: 'user-cust-1',
      amount: data.amount,
      currency: data.currency || 'USD',
      method: data.method as any,
      status: 'PAID',
      transactionId: 'TXN_' + Date.now() + '_MOCK',
      mockReceiptUrl: `https://fixora.local/receipts/TXN_${Date.now()}.pdf`,
      paidAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    mockBookings = mockBookings.map(b => b.id === data.bookingId ? { ...b, paymentStatus: 'PAID' } : b);

    return executeApiCall(
      () => apiClient.post('/payments/process', data),
      payment
    );
  },

  getPaymentByBooking: async (bookingId: string) => {
    return executeApiCall(
      () => apiClient.get(`/payments/booking/${bookingId}`),
      {
        id: 'pay-mock-1',
        bookingId,
        amount: 49.99,
        status: 'PAID',
        method: 'CARD',
        transactionId: 'TXN_SAMPLE_01',
        createdAt: new Date().toISOString()
      }
    );
  },

  getMyPayments: async () => {
    return executeApiCall(
      () => apiClient.get('/payments/my-payments'),
      mockBookings.filter(b => b.paymentStatus === 'PAID').map(b => ({
        id: 'pay-' + b.id,
        bookingId: b.id,
        amount: b.totalPrice,
        currency: 'USD',
        method: 'CARD' as const,
        status: 'PAID' as const,
        transactionId: 'TXN_' + b.bookingNumber,
        createdAt: b.createdAt,
        booking: b
      }))
    );
  }
};

export const reviewsApi = {
  createReview: async (reviewData: { bookingId: string; rating: number; comment?: string }) => {
    const newRev: Review = {
      id: 'rev-' + Date.now(),
      bookingId: reviewData.bookingId,
      customerId: 'user-cust-1',
      providerId: 'prov-1',
      serviceId: 'serv-1',
      rating: reviewData.rating,
      comment: reviewData.comment,
      createdAt: new Date().toISOString(),
      customer: { id: 'user-cust-1', name: 'Sophia Miller' }
    };
    return executeApiCall(
      () => apiClient.post('/reviews', reviewData),
      newRev
    );
  },

  getReviewsByProvider: async (providerId: string) => {
    return executeApiCall(
      () => apiClient.get(`/reviews/provider/${providerId}`),
      mockServices[0].reviews || []
    );
  }
};

export const appliancesApi = {
  getMyAppliances: async () => {
    return executeApiCall(
      () => apiClient.get('/appliances'),
      mockAppliances
    );
  },

  createAppliance: async (data: any) => {
    const newApp: Appliance = {
      id: 'app-' + Date.now(),
      userId: 'user-cust-1',
      ...data,
      createdAt: new Date().toISOString()
    };
    mockAppliances = [newApp, ...mockAppliances];
    return executeApiCall(
      () => apiClient.post('/appliances', data),
      newApp
    );
  },

  updateAppliance: async (id: string, data: any) => {
    mockAppliances = mockAppliances.map(a => a.id === id ? { ...a, ...data } : a);
    return executeApiCall(
      () => apiClient.put(`/appliances/${id}`, data),
      mockAppliances.find(a => a.id === id)
    );
  },

  deleteAppliance: async (id: string) => {
    mockAppliances = mockAppliances.filter(a => a.id !== id);
    return executeApiCall(
      () => apiClient.delete(`/appliances/${id}`),
      { success: true }
    );
  }
};

export const remindersApi = {
  getReminders: async () => {
    return executeApiCall(
      () => apiClient.get('/appliances/reminders'),
      mockReminders
    );
  },

  createReminder: async (data: any) => {
    const newRem: ServiceReminder = {
      id: 'rem-' + Date.now(),
      userId: 'user-cust-1',
      status: 'PENDING',
      ...data,
      appliance: mockAppliances.find(a => a.id === data.applianceId)
    };
    mockReminders = [newRem, ...mockReminders];
    return executeApiCall(
      () => apiClient.post('/appliances/reminders', data),
      newRem
    );
  },

  updateReminderStatus: async (id: string, data: any) => {
    mockReminders = mockReminders.map(r => r.id === id ? { ...r, ...data } : r);
    return executeApiCall(
      () => apiClient.put(`/appliances/reminders/${id}`, data),
      mockReminders.find(r => r.id === id)
    );
  },

  deleteReminder: async (id: string) => {
    mockReminders = mockReminders.filter(r => r.id !== id);
    return executeApiCall(
      () => apiClient.delete(`/appliances/reminders/${id}`),
      { success: true }
    );
  }
};

export const warrantiesApi = {
  getMyDocuments: async (params?: { documentType?: string }) => {
    return executeApiCall(
      () => apiClient.get('/documents', { params }),
      mockWarranties.filter(w => !params?.documentType || w.documentType === params.documentType)
    );
  },

  createDocument: async (data: any) => {
    const newDoc: BillWarranty = {
      id: 'doc-' + Date.now(),
      userId: 'user-cust-1',
      ...data,
      createdAt: new Date().toISOString(),
      appliance: mockAppliances.find(a => a.id === data.applianceId)
    };
    mockWarranties = [newDoc, ...mockWarranties];
    return executeApiCall(
      () => apiClient.post('/documents', data),
      newDoc
    );
  },

  deleteDocument: async (id: string) => {
    mockWarranties = mockWarranties.filter(w => w.id !== id);
    return executeApiCall(
      () => apiClient.delete(`/documents/${id}`),
      { success: true }
    );
  }
};

export const complaintsApi = {
  getMyComplaints: async () => {
    return executeApiCall(
      () => apiClient.get('/complaints/my'),
      mockComplaints
    );
  },

  createComplaint: async (data: any) => {
    const newCmp: Complaint = {
      id: 'cmp-' + Date.now(),
      ticketNumber: 'CMP-' + Math.floor(100000 + Math.random() * 900000),
      customerId: 'user-cust-1',
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      ...data,
      customer: { id: 'user-cust-1', name: 'Sophia Miller', email: 'customer@fixora.com' }
    };
    mockComplaints = [newCmp, ...mockComplaints];
    return executeApiCall(
      () => apiClient.post('/complaints', data),
      newCmp
    );
  },

  updateComplaint: async (id: string, data: any) => {
    mockComplaints = mockComplaints.map(c => c.id === id ? { ...c, ...data } : c);
    return executeApiCall(
      () => apiClient.put(`/complaints/${id}`, data),
      mockComplaints.find(c => c.id === id)
    );
  }
};

export const favoritesApi = {
  getMyFavorites: async () => {
    return executeApiCall(
      () => apiClient.get('/favorites'),
      mockFavorites
    );
  },

  toggleFavorite: async (data: { serviceId?: string; providerId?: string }) => {
    const existingIndex = mockFavorites.findIndex(f =>
      (data.serviceId && f.serviceId === data.serviceId) ||
      (data.providerId && f.providerId === data.providerId)
    );
    if (existingIndex >= 0) {
      mockFavorites.splice(existingIndex, 1);
      return executeApiCall(
        () => apiClient.post('/favorites/toggle', data),
        { favorited: false }
      );
    } else {
      const newFav: Favorite = {
        id: 'fav-' + Date.now(),
        customerId: 'user-cust-1',
        serviceId: data.serviceId,
        providerId: data.providerId,
        createdAt: new Date().toISOString(),
        service: mockServices.find(s => s.id === data.serviceId),
        provider: mockProviders.find(p => p.id === data.providerId)
      };
      mockFavorites.push(newFav);
      return executeApiCall(
        () => apiClient.post('/favorites/toggle', data),
        { favorited: true, favorite: newFav }
      );
    }
  }
};

export const chatApi = {
  getConversations: async () => {
    return executeApiCall(
      () => apiClient.get('/chat/conversations'),
      mockConversations
    );
  },

  startConversation: async (data: { receiverId: string; bookingId?: string }) => {
    return executeApiCall(
      () => apiClient.post('/chat/conversations', data),
      mockConversations[0]
    );
  },

  getMessages: async (conversationId: string) => {
    const conv = mockConversations.find(c => c.id === conversationId) || mockConversations[0];
    return executeApiCall(
      () => apiClient.get(`/chat/conversations/${conversationId}/messages`),
      conv?.messages || []
    );
  },

  sendMessage: async (data: { conversationId: string; receiverId: string; content: string }) => {
    const newMsg: Message = {
      id: 'msg-' + Date.now(),
      conversationId: data.conversationId,
      senderId: 'user-cust-1',
      receiverId: data.receiverId,
      content: data.content,
      createdAt: new Date().toISOString(),
      isRead: false,
      sender: { id: 'user-cust-1', name: 'Sophia Miller', role: 'CUSTOMER' }
    };
    const conv = mockConversations.find(c => c.id === data.conversationId);
    if (conv) {
      conv.messages = [...(conv.messages || []), newMsg];
      conv.lastMessageAt = newMsg.createdAt;
    }
    return executeApiCall(
      () => apiClient.post('/chat/messages', data),
      newMsg
    );
  },

  markConversationRead: async (conversationId: string) => {
    return executeApiCall(
      () => apiClient.put(`/chat/conversations/${conversationId}/read`),
      { success: true }
    );
  }
};

export const notificationsApi = {
  getMyNotifications: async () => {
    return executeApiCall(
      () => apiClient.get('/notifications'),
      {
        notifications: mockNotifications,
        total: mockNotifications.length,
        unreadCount: mockNotifications.filter(n => !n.isRead).length
      }
    );
  },

  markAsRead: async (id: string) => {
    mockNotifications = mockNotifications.map(n => n.id === id ? { ...n, isRead: true } : n);
    return executeApiCall(
      () => apiClient.patch(`/notifications/${id}/read`),
      { success: true }
    );
  },

  markAllAsRead: async () => {
    mockNotifications = mockNotifications.map(n => ({ ...n, isRead: true }));
    return executeApiCall(
      () => apiClient.post('/notifications/read-all'),
      { success: true }
    );
  },

  deleteNotification: async (id: string) => {
    mockNotifications = mockNotifications.filter(n => n.id !== id);
    return executeApiCall(
      () => apiClient.delete(`/notifications/${id}`),
      { success: true }
    );
  }
};

export const adminApi = {
  getDashboardStats: async (): Promise<AdminStats> => {
    return executeApiCall(
      () => apiClient.get('/admin/stats'),
      {
        totalUsers: 148,
        totalCustomers: 120,
        totalProviders: 28,
        totalBookings: 342,
        activeBookings: 18,
        completedBookings: 310,
        totalRevenue: 28450,
        pendingComplaints: 3,
        recentBookings: mockBookings
      }
    );
  },

  getUsers: async (params?: any) => {
    return executeApiCall(
      () => apiClient.get('/admin/users', { params }),
      [
        {
          id: 'user-cust-1',
          name: 'Sophia Miller',
          email: 'customer@fixora.com',
          role: 'CUSTOMER' as Role,
          isActive: true,
          city: 'New York',
          createdAt: '2023-01-01',
          _count: { bookings: 5 }
        },
        {
          id: 'user-prov-1',
          name: 'Alex Vance',
          email: 'provider@fixora.com',
          role: 'PROVIDER' as Role,
          isActive: true,
          city: 'New York',
          createdAt: '2023-01-15',
          providerProfile: { id: 'prov-1', isVerified: true, rating: 4.9, reviewCount: 124 },
          _count: { bookings: 42 }
        },
        {
          id: 'user-admin-1',
          name: 'Fixora Admin',
          email: 'admin@fixora.com',
          role: 'ADMIN' as Role,
          isActive: true,
          city: 'San Francisco',
          createdAt: '2022-08-01',
          _count: { bookings: 0 }
        }
      ]
    );
  },

  toggleUserStatus: async (id: string, isActive: boolean) => {
    return executeApiCall(
      () => apiClient.patch(`/admin/users/${id}/status`, { isActive }),
      { id, isActive }
    );
  },

  changeUserRole: async (id: string, role: Role) => {
    return executeApiCall(
      () => apiClient.patch(`/admin/users/${id}/role`, { role }),
      { id, role }
    );
  },

  verifyProvider: async (providerId: string, isVerified: boolean) => {
    return executeApiCall(
      () => apiClient.patch(`/admin/providers/${providerId}/verify`, { isVerified }),
      { providerId, isVerified }
    );
  },

  getAllBookings: async (params?: any) => {
    return executeApiCall(
      () => apiClient.get('/admin/bookings', { params }),
      mockBookings
    );
  },

  getAllComplaints: async (params?: any) => {
    return executeApiCall(
      () => apiClient.get('/admin/complaints', { params }),
      mockComplaints
    );
  }
};
