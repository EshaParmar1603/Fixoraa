import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Wrench,
  Bell,
  MessageSquare,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Calendar,
  Heart,
  FileText,
  AlertCircle,
  Tv,
  Users,
  Layers,
  ChevronDown,
  Calculator,
  Zap,
  Palette,
  Utensils,
  Sparkles,
  Home as HomeIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { notificationsApi } from '../../services/api';
import { Role } from '../../types';

export const Navbar: React.FC = () => {
  const { user, role, isCustomer, isProvider, isAdmin, logout, loginAsDemo, isAuthenticated } = useAuth();
  const { isConnected, latestNotification } = useSocket();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(2);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await notificationsApi.getMyNotifications();
        if (res?.unreadCount !== undefined) {
          setUnreadNotifications(res.unreadCount);
        }
      } catch (e) {
        // Fallback
      }
    };
    if (isAuthenticated) {
      fetchUnread();
    }
  }, [isAuthenticated, latestNotification]);

  const handleRoleSwitch = async (newRole: Role) => {
    await loginAsDemo(newRole);
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
    if (newRole === 'ADMIN') navigate('/admin/dashboard');
    else if (newRole === 'PROVIDER') navigate('/provider/dashboard');
    else navigate('/');
  };

  const [specialMenuOpen, setSpecialMenuOpen] = useState(false);

  const specialServices = [
    { name: 'Event Planner', path: '/event-planner', icon: Sparkles, desc: 'Questionnaire & budget calculator' },
    { name: 'Gourmet Caterers', path: '/caterers', icon: Utensils, desc: 'Menus, Instagram reels & tastings' },
    { name: 'Interior Design', path: '/interior-design', icon: Palette, desc: 'Inspect real portfolios before booking' },
    { name: 'Bill Predictor', path: '/bill-predictor', icon: Calculator, desc: 'Live DISCOM rates & rent split' },
  ];

  const isSpecialActive = specialServices.some((s) => location.pathname === s.path);

  const navLinks = isCustomer
    ? [
        { name: 'Home', path: '/', icon: HomeIcon },
        { name: 'Services', path: '/services', icon: Layers },
        { name: 'My Bookings', path: '/my-bookings', icon: Calendar },
        { name: 'Appliances', path: '/appliances', icon: Tv },
      ]
    : isProvider
    ? [
        { name: 'Provider Hub', path: '/provider/dashboard', icon: Layers },
        { name: 'Bookings Queue', path: '/provider/bookings', icon: Calendar },
        { name: 'Weekly Schedule', path: '/provider/availability', icon: Calendar },
        { name: 'Dispute Cases', path: '/complaints', icon: AlertCircle },
      ]
    : isAdmin
    ? [
        { name: 'Admin Dashboard', path: '/admin/dashboard', icon: Layers },
        { name: 'User Management', path: '/admin/users', icon: Users },
        { name: 'Global Bookings', path: '/admin/bookings', icon: Calendar },
        { name: 'Dispute Center', path: '/admin/complaints', icon: AlertCircle },
      ]
    : [
        { name: 'Explore Services', path: '/services', icon: Layers },
      ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-glow group-hover:scale-105 transition-transform">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-brand-900 to-indigo-950 bg-clip-text text-transparent">
                  Fixora
                </span>
                <span className="text-[10px] block font-semibold uppercase tracking-wider text-brand-600 -mt-1">
                  Home Tech Care
                </span>
              </div>
            </Link>

            {/* Socket Status Pulse */}
            <div
              className={`hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                isConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
              title={isConnected ? 'Real-time WebSocket Live' : 'Offline / Standalone Mode'}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                  isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              {isConnected ? 'Socket Live' : 'Demo Mode'}
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                    isActive(link.path)
                      ? 'bg-blue-50 text-blue-600 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4 opacity-80" />
                  <span>{link.name}</span>
                </Link>
              );
            })}

            {/* Special Services Dropdown for Lifestyle & Events */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setSpecialMenuOpen(!specialMenuOpen)}
                onBlur={() => setTimeout(() => setSpecialMenuOpen(false), 200)}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                  isSpecialActive || specialMenuOpen
                    ? 'bg-blue-50 text-blue-600 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Sparkles className="w-4 h-4 text-blue-600 opacity-90" />
                <span>Lifestyle & Events</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${specialMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {specialMenuOpen && (
                <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                    Specialized Services
                  </div>
                  {specialServices.map((service) => {
                    const Icon = service.icon;
                    return (
                      <Link
                        key={service.name}
                        to={service.path}
                        onClick={() => setSpecialMenuOpen(false)}
                        className={`flex items-start space-x-3 p-2.5 rounded-xl transition-all ${
                          isActive(service.path)
                            ? 'bg-blue-50 text-blue-700 font-semibold'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                          <Icon className="w-4 h-4 text-slate-700" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 leading-tight">
                            {service.name}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                            {service.desc}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* Right Action Icons & User Menu */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick Role Switcher Pill */}
            <div className="hidden sm:flex items-center p-1 bg-slate-100/90 rounded-full border border-slate-200/80 text-xs font-semibold">
              <button
                onClick={() => handleRoleSwitch('CUSTOMER')}
                className={`px-3 py-1 rounded-full transition-all ${
                  isCustomer ? 'bg-white text-blue-700 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Customer
              </button>
              <button
                onClick={() => handleRoleSwitch('PROVIDER')}
                className={`px-3 py-1 rounded-full transition-all ${
                  isProvider ? 'bg-white text-blue-700 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Provider
              </button>
              <button
                onClick={() => handleRoleSwitch('ADMIN')}
                className={`px-3 py-1 rounded-full transition-all ${
                  isAdmin ? 'bg-white text-blue-700 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Admin
              </button>
            </div>

            {/* Chat Icon */}
            <Link
              to="/chat"
              className="relative p-2 rounded-full text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors"
              title="Real-time Chat"
            >
              <MessageSquare className="w-5 h-5" />
            </Link>

            {/* Notifications Icon with Badge */}
            <Link
              to="/notifications"
              className="relative p-2 rounded-full text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                {unreadNotifications > 0 ? unreadNotifications : 2}
              </span>
            </Link>

            {/* User Profile matching Inspiration Screenshot */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-2 p-1 pl-1.5 pr-2.5 rounded-full hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200"
              >
                <img
                  src={
                    user?.avatar ||
                    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
                  }
                  alt={user?.name || 'Sophia Miller'}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-100"
                />
                <div className="hidden xl:block text-left">
                  <p className="text-xs font-bold text-slate-800 leading-tight">
                    {user?.name || 'Sophia Miller'}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium capitalize">
                    {role ? role.toLowerCase() : 'Customer'}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden xl:block" />
              </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-xs text-slate-500 font-medium">Signed in as</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{user?.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-brand-50 text-brand-700 text-[10px] font-bold rounded-md">
                        {role}
                      </span>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition-colors"
                    >
                      <UserIcon className="w-4 h-4 mr-2.5 opacity-70" />
                      Account Settings
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-brand-600 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 mr-2.5 opacity-70 text-indigo-600" />
                        Admin Portal
                      </Link>
                    )}

                    <div className="border-t border-slate-100 my-1"></div>

                    {isAuthenticated ? (
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          logout();
                          navigate('/login');
                        }}
                        className="w-full flex items-center px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-2.5 opacity-80" />
                        Sign Out
                      </button>
                    ) : (
                      <div className="space-y-1">
                        <Link
                          to="/login"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 font-semibold transition-colors"
                        >
                          <UserIcon className="w-4 h-4 mr-2.5 opacity-80" />
                          Log In
                        </Link>
                        <Link
                          to="/register"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 mr-2.5 opacity-80" />
                          Register
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-500">Quick Role Switch:</span>
            <div className="flex space-x-1 text-xs">
              <button
                onClick={() => handleRoleSwitch('CUSTOMER')}
                className={`px-2 py-1 rounded ${isCustomer ? 'bg-brand-600 text-white' : 'bg-slate-100'}`}
              >
                Customer
              </button>
              <button
                onClick={() => handleRoleSwitch('PROVIDER')}
                className={`px-2 py-1 rounded ${isProvider ? 'bg-brand-600 text-white' : 'bg-slate-100'}`}
              >
                Provider
              </button>
              <button
                onClick={() => handleRoleSwitch('ADMIN')}
                className={`px-2 py-1 rounded ${isAdmin ? 'bg-brand-600 text-white' : 'bg-slate-100'}`}
              >
                Admin
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl text-sm font-medium ${
                    isActive(link.path)
                      ? 'bg-brand-50 text-brand-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4 opacity-75" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Lifestyle & Events Section for Mobile */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Lifestyle & Events
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {specialServices.map((service) => {
                const Icon = service.icon;
                return (
                  <Link
                    key={service.name}
                    to={service.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold ${
                      isActive(service.path)
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-brand-600 shrink-0" />
                    <span>{service.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
