import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { useAuth } from './context/AuthContext';
import { useSocket } from './context/SocketContext';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';

// Customer Pages
import { Home } from './pages/customer/Home';
import { Services } from './pages/customer/Services';
import { ServiceDetail } from './pages/customer/ServiceDetail';
import { BookService } from './pages/customer/BookService';
import { MyBookings } from './pages/customer/MyBookings';
import { Appliances } from './pages/customer/Appliances';
import { Warranties } from './pages/customer/Warranties';
import { Favorites } from './pages/customer/Favorites';
import { Complaints } from './pages/customer/Complaints';
import { BillPredictor } from './pages/customer/BillPredictor';
import { InteriorDesign } from './pages/customer/InteriorDesign';

// Provider Pages
import { ProviderDashboard } from './pages/provider/ProviderDashboard';
import { ProviderBookings } from './pages/provider/ProviderBookings';
import { ProviderAvailabilityPage } from './pages/provider/ProviderAvailability';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminBookings } from './pages/admin/AdminBookings';
import { AdminComplaints } from './pages/admin/AdminComplaints';

// Shared Pages
import { Chat } from './pages/shared/Chat';
import { Notifications } from './pages/shared/Notifications';
import { Profile } from './pages/shared/Profile';
import { NotFound } from './pages/shared/NotFound';

import { Bell, X } from 'lucide-react';
import { Role } from './types';

// Protected Route Guard
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: Role[];
}> = ({ children, allowedRoles }) => {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  const { latestNotification } = useSocket();
  const [showLiveToast, setShowLiveToast] = React.useState(false);

  React.useEffect(() => {
    if (latestNotification) {
      setShowLiveToast(true);
      const timer = setTimeout(() => setShowLiveToast(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [latestNotification]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-brand-500 selection:text-white">
      {/* Real-time Socket Notification Toast */}
      {showLiveToast && latestNotification && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 flex items-start space-x-3 animate-in fade-in slide-in-from-bottom-4">
          <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center shrink-0">
            <Bell className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold">{latestNotification.title}</p>
            <p className="text-[11px] text-slate-300 mt-0.5">{latestNotification.message}</p>
          </div>
          <button
            onClick={() => setShowLiveToast(false)}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Role-aware Navbar */}
      <Navbar />

      {/* Main Page Routing */}
      <main className="flex-1">
        <Routes>
          {/* Public / Customer Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:id" element={<ServiceDetail />} />
          <Route path="/bill-predictor" element={<BillPredictor />} />
          <Route path="/interior-design" element={<InteriorDesign />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Customer Authenticated Routes */}
          <Route
            path="/book/:serviceId"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
                <BookService />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
                <MyBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/appliances"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
                <Appliances />
              </ProtectedRoute>
            }
          />
          <Route
            path="/warranties"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
                <Warranties />
              </ProtectedRoute>
            }
          />
          <Route
            path="/favorites"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
                <Favorites />
              </ProtectedRoute>
            }
          />
          <Route
            path="/complaints"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER', 'PROVIDER', 'ADMIN']}>
                <Complaints />
              </ProtectedRoute>
            }
          />

          {/* Provider Routes */}
          <Route
            path="/provider/dashboard"
            element={
              <ProtectedRoute allowedRoles={['PROVIDER', 'ADMIN']}>
                <ProviderDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/provider/bookings"
            element={
              <ProtectedRoute allowedRoles={['PROVIDER', 'ADMIN']}>
                <ProviderBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/provider/availability"
            element={
              <ProtectedRoute allowedRoles={['PROVIDER', 'ADMIN']}>
                <ProviderAvailabilityPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/complaints"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminComplaints />
              </ProtectedRoute>
            }
          />

          {/* Shared Authenticated Routes */}
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat/:conversationId"
            element={
              <ProtectedRoute>
                <Chat />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* 404 Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};
