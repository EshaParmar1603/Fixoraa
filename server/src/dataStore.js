// In-memory + JSON-persisted Data Store for Fixora Backend Server
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Seed Data
const INITIAL_DATA = {
  users: [
    {
      id: 'user-cust-1',
      name: 'Sophia Miller',
      email: 'customer@fixora.com',
      role: 'CUSTOMER',
      phone: '+91 98765 43210',
      city: 'Bengaluru',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      isActive: true
    },
    {
      id: 'user-prov-1',
      name: 'Ar. Ananya Deshmukh',
      email: 'ananya.design@fixora.com',
      role: 'PROVIDER',
      phone: '+91 98451 22345',
      city: 'Bengaluru',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      isActive: true
    },
    {
      id: 'user-prov-2',
      name: 'Ar. Vikramaditya Rao',
      email: 'vikram.design@fixora.com',
      role: 'PROVIDER',
      phone: '+91 98200 44567',
      city: 'Mumbai',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      isActive: true
    },
    {
      id: 'user-prov-3',
      name: 'Ar. Priya Nambiar',
      email: 'priya.nambiar@fixora.com',
      role: 'PROVIDER',
      phone: '+91 99890 88712',
      city: 'Hyderabad',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
      isActive: true
    },
    {
      id: 'user-prov-4',
      name: 'Ar. Siddharth Mehra',
      email: 'siddharth.mehra@fixora.com',
      role: 'PROVIDER',
      phone: '+91 98110 99823',
      city: 'Delhi-NCR',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      isActive: true
    },
    {
      id: 'user-prov-tech',
      name: 'Alex Vance (Technician)',
      email: 'provider@fixora.com',
      role: 'PROVIDER',
      phone: '+91 98450 11223',
      city: 'Bengaluru',
      avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150',
      isActive: true
    },
    {
      id: 'user-prov-cater',
      name: 'Chef Ranveer Brar (Executive Caterer)',
      email: 'ranveer.cater@fixora.com',
      role: 'PROVIDER',
      phone: '+91 98451 99001',
      city: 'Bengaluru',
      avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150',
      isActive: true
    },
    {
      id: 'user-admin-1',
      name: 'Fixora System Admin',
      email: 'admin@fixora.com',
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      isActive: true
    }
  ],
  providers: [
    {
      id: 'des-1',
      userId: 'user-prov-1',
      profession: 'designer',
      bio: 'Council of Architecture Certified Architect (CA/2021/84729). Founder at Studio Vayu Interiors.',
      experienceYears: 11,
      hourlyRate: 1850,
      rating: 4.95,
      reviewCount: 42,
      isVerified: true,
      isAvailable: true,
      city: 'Bengaluru',
      user: {
        id: 'user-prov-1',
        name: 'Ar. Ananya Deshmukh',
        email: 'ananya.design@fixora.com',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
        phone: '+91 98451 22345',
        role: 'PROVIDER',
        city: 'Bengaluru'
      }
    },
    {
      id: 'des-2',
      userId: 'user-prov-2',
      profession: 'designer',
      bio: 'AD50 Architect. Lead Architect at Sanskriti Living & Architecture.',
      experienceYears: 14,
      hourlyRate: 2200,
      rating: 4.9,
      reviewCount: 38,
      isVerified: true,
      isAvailable: true,
      city: 'Mumbai',
      user: {
        id: 'user-prov-2',
        name: 'Ar. Vikramaditya Rao',
        email: 'vikram.design@fixora.com',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        phone: '+91 98200 44567',
        role: 'PROVIDER',
        city: 'Mumbai'
      }
    },
    {
      id: 'des-3',
      userId: 'user-prov-3',
      profession: 'designer',
      bio: 'Ergonomic Interior Architect at ErgoWork & Loft Spaces.',
      experienceYears: 9,
      hourlyRate: 1750,
      rating: 4.92,
      reviewCount: 29,
      isVerified: true,
      isAvailable: true,
      city: 'Hyderabad',
      user: {
        id: 'user-prov-3',
        name: 'Ar. Priya Nambiar',
        email: 'priya.nambiar@fixora.com',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
        phone: '+91 99890 88712',
        role: 'PROVIDER',
        city: 'Hyderabad'
      }
    },
    {
      id: 'des-4',
      userId: 'user-prov-4',
      profession: 'designer',
      bio: 'Turnkey Renovation Master at Atelier Contemporary Living.',
      experienceYears: 12,
      hourlyRate: 2400,
      rating: 4.88,
      reviewCount: 35,
      isVerified: true,
      isAvailable: true,
      city: 'Delhi-NCR',
      user: {
        id: 'user-prov-4',
        name: 'Ar. Siddharth Mehra',
        email: 'siddharth.mehra@fixora.com',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        phone: '+91 98110 99823',
        role: 'PROVIDER',
        city: 'Delhi-NCR'
      }
    },
    {
      id: 'prov-tech-1',
      userId: 'user-prov-tech',
      profession: 'technician',
      bio: 'Master Certified HVAC & Home Appliance Specialist. 100% genuine parts.',
      experienceYears: 8,
      hourlyRate: 450,
      rating: 4.9,
      reviewCount: 124,
      isVerified: true,
      isAvailable: true,
      city: 'Bengaluru',
      user: {
        id: 'user-prov-tech',
        name: 'Alex Vance (Technician)',
        email: 'provider@fixora.com',
        avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150',
        phone: '+91 98450 11223',
        role: 'PROVIDER',
        city: 'Bengaluru'
      }
    },
    {
      id: 'cater-1',
      userId: 'user-prov-cater',
      profession: 'caterer',
      bio: 'FSSAI Licensed Executive Caterer (11223344556677). Saffron Feasts Gourmet Catering. Specialized in Royal Awadhi, Live BBQ & Nitrogen Desserts.',
      experienceYears: 16,
      hourlyRate: 650,
      rating: 4.96,
      reviewCount: 58,
      isVerified: true,
      isAvailable: true,
      city: 'Bengaluru',
      user: {
        id: 'user-prov-cater',
        name: 'Chef Ranveer Brar (Saffron Feasts)',
        email: 'ranveer.cater@fixora.com',
        avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150',
        phone: '+91 98451 99001',
        role: 'PROVIDER',
        city: 'Bengaluru'
      }
    }
  ],
  bookings: [
    {
      id: 'book-init-1',
      bookingNumber: 'FIX-839201',
      customerId: 'user-cust-1',
      providerId: 'des-1',
      serviceId: 'serv-interior-consult',
      scheduledAt: new Date(Date.now() + 86400000 * 2).toISOString(),
      address: '1,450 sq.ft (3BHK), Indiranagar, Bengaluru',
      city: 'Bengaluru',
      notes: 'Initial Consultation for Simple & Minimalist Design. Looking for Scandinavian light oak finish.',
      totalPrice: 0,
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      service: {
        id: 'serv-interior-consult',
        name: 'Interior Design Consultation (Simple & Minimalist)',
        basePrice: 0,
        image: '/interiors/simple_minimalist.jpg'
      },
      provider: {
        id: 'des-1',
        user: {
          id: 'user-prov-1',
          name: 'Ar. Ananya Deshmukh',
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
          phone: '+91 98451 22345'
        }
      }
    },
    {
      id: 'book-init-2',
      bookingNumber: 'FIX-512934',
      customerId: 'user-cust-1',
      providerId: 'cater-1',
      serviceId: 'serv-caterer-tasting',
      scheduledAt: new Date(Date.now() + 86400000 * 3).toISOString(),
      address: '150 Guests, Royal Awadhi Dinner Buffet in Indiranagar, Bengaluru',
      city: 'Bengaluru',
      notes: 'Gourmet Catering Tasting Session | Saffron Feasts | 150 Pax • Dinner Buffet',
      totalPrice: 1300,
      status: 'PENDING',
      paymentStatus: 'PAID',
      createdAt: new Date().toISOString(),
      service: {
        id: 'serv-caterer-tasting',
        name: 'Menu Tasting & Feast Session (Saffron Feasts)',
        basePrice: 650,
        image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800'
      },
      provider: {
        id: 'cater-1',
        user: {
          id: 'user-prov-cater',
          name: 'Chef Ranveer Brar (Saffron Feasts)',
          avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150',
          phone: '+91 98451 99001'
        }
      }
    }
  ],
  notifications: [
    {
      id: 'notif-init-1',
      userId: 'user-prov-1',
      providerId: 'des-1',
      title: 'Consultation Confirmed',
      message: 'Sophia Miller booked an Interior Design Consultation for Simple & Minimalist (1,450 sq.ft).',
      type: 'BOOKING',
      referenceId: 'book-init-1',
      link: '/provider/dashboard',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000).toISOString()
    }
  ]
};

// Load or initialize data
let db = { ...INITIAL_DATA };

try {
  if (fs.existsSync(DB_FILE)) {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    db = JSON.parse(raw);
  } else {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  }
} catch (err) {
  console.warn('Using in-memory DB fallback:', err.message);
  db = { ...INITIAL_DATA };
}

function persist() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  } catch (err) {
    console.error('Failed to persist DB to file:', err.message);
  }
}

module.exports = {
  getDb: () => db,
  persist
};
