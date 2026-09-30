// Enums mirroring backend Prisma schema
export type Role = 'CUSTOMER' | 'PROVIDER' | 'ADMIN';

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED';

export type PaymentStatus =
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED';

export type PaymentMethod =
  | 'CARD'
  | 'UPI'
  | 'NETBANKING'
  | 'CASH'
  | 'WALLET';

export type NotificationType =
  | 'BOOKING'
  | 'MESSAGE'
  | 'PAYMENT'
  | 'SYSTEM'
  | 'REMINDER';

export type ComplaintStatus =
  | 'OPEN'
  | 'IN_INVESTIGATION'
  | 'RESOLVED'
  | 'CLOSED';

export type ComplaintPriority =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL';

export type DocumentType =
  | 'BILL'
  | 'WARRANTY'
  | 'MANUAL'
  | 'OTHER';

// Core Models
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  avatar?: string | null;
  role: Role;
  isActive: boolean;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  createdAt: string;
  updatedAt?: string;
  providerProfile?: Partial<ProviderProfile> | null;
  _count?: {
    bookings?: number;
  };
}

export type ProviderProfession = 'technician' | 'designer' | 'caterer' | 'event_planner';

export interface PortfolioProject {
  id: string;
  title: string;
  theme: string;
  areaSqFt?: number;
  cost?: number;
  imageUrl: string;
  beforeImageUrl?: string;
  clientName?: string;
  completionDate?: string;
  description?: string;
  tags?: string[];
}

export interface CatererMenu {
  id: string;
  name: string;
  category: 'starter' | 'main' | 'dessert' | 'beverage' | 'live_counter';
  dietType: 'veg' | 'non-veg' | 'jain' | 'vegan';
  pricePerPlate?: number;
  description?: string;
  imageUrl?: string;
}

export interface ProviderProfile {
  id: string;
  userId: string;
  bio: string;
  experienceYears: number;
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  isAvailable: boolean;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  user?: User;
  services?: ProviderService[];
  availabilities?: ProviderAvailability[];
  reviews?: Review[];
  // Specialization metadata
  profession?: ProviderProfession;
  specialties?: string[];
  portfolioProjects?: PortfolioProject[];
  catererMenus?: CatererMenu[];
  fssaiNumber?: string;
  councilRegistration?: string;
  pricePerSqFt?: number;
  pricePerPlate?: number;
  tastingAvailable?: boolean;
}

export interface ProviderService {
  id: string;
  providerId: string;
  serviceId: string;
  customPrice?: number | null;
  service?: Service;
}

export interface ProviderAvailability {
  id: string;
  providerId: string;
  dayOfWeek: number; // 0-6 (Sun-Sat)
  startTime: string; // "09:00"
  endTime: string;   // "18:00"
  isAvailable: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  image?: string | null;
  isActive: boolean;
  services?: Service[];
  _count?: {
    services: number;
  };
}

export interface Service {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  durationMinutes: number;
  image?: string | null;
  isActive: boolean;
  category?: Category;
  providers?: {
    provider: ProviderProfile;
  }[];
  reviews?: Review[];
  _count?: {
    reviews: number;
    bookings: number;
  };
}

export interface BookingStatusHistory {
  id: string;
  bookingId: string;
  status: BookingStatus;
  changedBy: string;
  notes?: string | null;
  createdAt: string;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  customerId: string;
  providerId?: string | null;
  serviceId: string;
  scheduledAt: string;
  address: string;
  city?: string | null;
  notes?: string | null;
  totalPrice: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  customer?: User;
  provider?: ProviderProfile | null;
  service?: Service;
  review?: Review | null;
  payment?: Payment | null;
  statusHistory?: BookingStatusHistory[];
  conversation?: Conversation | null;
}

export interface Review {
  id: string;
  bookingId: string;
  customerId: string;
  providerId: string;
  serviceId: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  customer?: {
    id: string;
    name: string;
    avatar?: string | null;
  };
  service?: {
    id: string;
    name: string;
  };
}

export interface Payment {
  id: string;
  bookingId: string;
  customerId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId: string;
  mockReceiptUrl?: string | null;
  paidAt?: string;
  createdAt: string;
  booking?: Booking;
}

export interface Appliance {
  id: string;
  userId: string;
  name: string;
  brand: string;
  modelNumber?: string | null;
  serialNumber?: string | null;
  category?: string | null;
  purchaseDate?: string | null;
  warrantyExpiryDate?: string | null;
  location?: string | null;
  notes?: string | null;
  createdAt: string;
  reminders?: ServiceReminder[];
  billsAndWarranties?: BillWarranty[];
}

export interface ServiceReminder {
  id: string;
  userId: string;
  applianceId?: string | null;
  serviceType: string;
  dueDate: string;
  frequencyMonths: number;
  notes?: string | null;
  status: 'PENDING' | 'COMPLETED' | 'DISMISSED';
  lastServicedAt?: string | null;
  nextDueDate?: string | null;
  appliance?: Appliance | null;
}

export interface BillWarranty {
  id: string;
  userId: string;
  applianceId?: string | null;
  title: string;
  documentType: DocumentType;
  documentUrl: string;
  fileType?: string | null;
  fileSize?: number | null;
  vendor?: string | null;
  amount?: number | null;
  purchaseDate?: string | null;
  expiryDate?: string | null;
  notes?: string | null;
  createdAt: string;
  appliance?: Appliance | null;
}

export interface Complaint {
  id: string;
  ticketNumber: string;
  customerId: string;
  providerId?: string | null;
  bookingId?: string | null;
  subject: string;
  description: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  resolutionNotes?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  customer?: {
    id: string;
    name: string;
    email: string;
  };
  provider?: {
    id: string;
    name: string;
    email: string;
  } | null;
  booking?: {
    id: string;
    bookingNumber: string;
  } | null;
}

export interface Favorite {
  id: string;
  customerId: string;
  serviceId?: string | null;
  providerId?: string | null;
  createdAt: string;
  service?: Service | null;
  provider?: ProviderProfile | null;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  attachmentUrl?: string | null;
  isRead?: boolean;
  createdAt: string;
  sender?: {
    id: string;
    name: string;
    avatar?: string | null;
    role?: Role;
  };
}

export interface Conversation {
  id: string;
  customerId: string;
  providerId: string;
  bookingId?: string | null;
  lastMessageAt: string;
  customer?: User;
  provider?: User;
  messages?: Message[];
  booking?: Booking | null;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  referenceId?: string | null;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

// API and Pagination Types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message?: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AdminStats {
  totalUsers: number;
  totalCustomers: number;
  totalProviders: number;
  totalBookings: number;
  activeBookings: number;
  completedBookings: number;
  totalRevenue: number;
  pendingComplaints: number;
  recentBookings: Booking[];
}
