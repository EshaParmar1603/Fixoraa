# Fixora — Home & Appliance Services Platform

A modern, production-grade on-demand appliance service marketplace and digital warranty locker.

---

## 🚀 How to Run the Frontend

The entire frontend is located under the [`client/`](file:///d:/service/client) directory.

### 1. From the Root Workspace Directory (`d:\service`):
```bash
npm run client
```

### 2. Or from inside the `client/` directory:
```bash
cd client
npm run dev
```

The frontend will start at:
👉 **`http://localhost:5173/`**

---

## ⚡ Instant Demo Logins (1-Click Role Switch)

The frontend includes a role-aware navigation bar and an instant demo switch for seamless evaluation:

| Role | Demo Email | Password | Available Features |
|---|---|---|---|
| **Customer** | `customer@fixora.com` | `Password123!` | Explore Services, Bookings, Appliance Registry, Document Vault, Favorites, Dispute Center |
| **Provider** | `provider@fixora.com` | `Password123!` | Technician Hub, Job Progression (Confirm → Start → Complete), Weekly Availability Scheduler |
| **Admin** | `admin@fixora.com` | `Password123!` | Marketplace Revenue Analytics, User Permissions & Verification, Global Orders, Dispute Center |

---

## 📁 Frontend Architecture (`client/`)

```
client/
├── package.json
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── .env
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── types/
│   │   └── index.ts                 # Mirrors backend Prisma models & enums
│   ├── context/
│   │   ├── AuthContext.tsx          # JWT session, login, register, logout, profile
│   │   └── SocketContext.tsx        # Real-time Socket.IO WebSocket connection
│   ├── services/
│   │   └── api.ts                   # Axios client mapped to all backend endpoints
│   ├── components/
│   │   ├── common/
│   │   │   ├── Navbar.tsx           # Role-aware navigation, unread notifications badge
│   │   │   ├── Footer.tsx           # Value propositions & platform health
│   │   │   ├── LoadingSpinner.tsx   # Loading states
│   │   │   ├── EmptyState.tsx       # Zero-state screens
│   │   │   └── StatusBadge.tsx      # Formatted status indicators
│   │   └── cards/
│   │       ├── ServiceCard.tsx      # Services, favorites toggle, duration, pricing
│   │       ├── ProviderCard.tsx     # Technician profiles, ratings, hourly rate
│   │       └── BookingCard.tsx      # Status updates, pay now, write review, cancel
│   └── pages/
│       ├── auth/
│       │   ├── Login.tsx            # Login with quick demo accounts (Customer/Provider/Admin)
│       │   └── Register.tsx         # Role switch (Customer vs Provider qualifications)
│       ├── customer/
│       │   ├── Home.tsx             # Hero search, categories, featured services
│       │   ├── Services.tsx         # Search, category pills, sorting, pagination
│       │   ├── ServiceDetail.tsx    # Service overview, provider selection, reviews
│       │   ├── BookService.tsx      # Calendar scheduling, address, order breakdown
│       │   ├── MyBookings.tsx       # Booking tabs, mock payment modal, review modal
│       │   ├── Appliances.tsx       # Appliance registry & recurring service reminders
│       │   ├── Warranties.tsx       # Digital document vault for bills & warranties
│       │   ├── Favorites.tsx        # Saved services & preferred technicians
│       │   └── Complaints.tsx       # Dispute center & support ticket tracker
│       ├── provider/
│       │   ├── ProviderDashboard.tsx# Ratings, hourly rates, experience, incoming jobs
│       │   ├── ProviderBookings.tsx # Job progression: Confirm → Start → Complete
│       │   └── ProviderAvailability.tsx # Weekly operating schedule & hours
│       ├── admin/
│       │   ├── AdminDashboard.tsx   # Marketplace revenue, active bookings, user counts
│       │   ├── AdminUsers.tsx       # Permissions, suspend/activate, verify provider
│       │   ├── AdminBookings.tsx    # Global order oversight & search
│       │   └── AdminComplaints.tsx  # Dispute investigation & resolution notes
│       └── shared/
│           ├── Chat.tsx             # Real-time WebSocket chat, typing indicators
│           ├── Notifications.tsx    # Live notification alerts & deletion
│           ├── Profile.tsx          # Account details & password changes
│           └── NotFound.tsx         # 404 page
```
