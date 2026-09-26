import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Wrench, Mail, Lock, ArrowRight, UserCheck, ShieldCheck, Briefcase } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login, loginAsDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role: Role) => {
    setLoading(true);
    setError(null);
    try {
      await loginAsDemo(role);
      if (role === 'ADMIN') navigate('/admin/dashboard');
      else if (role === 'PROVIDER') navigate('/provider/dashboard');
      else navigate(from, { replace: true });
    } catch (err: any) {
      setError('Demo login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xl">
        {/* Brand Header */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 mx-auto flex items-center justify-center text-white shadow-glow mb-4">
            <Wrench className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome to Fixora
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-500">
            Sign in to manage repairs, warranties, and certified technician bookings
          </p>
        </div>

        {/* 1-Click Quick Demo Accounts Box */}
        <div className="bg-brand-50/60 rounded-2xl p-4 border border-brand-100">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-brand-800 mb-2.5">
            <ShieldCheck className="w-4 h-4 text-brand-600" />
            <span>Instant Demo Logins (1-Click Preview)</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('CUSTOMER')}
              className="flex flex-col items-center p-2 rounded-xl bg-white border border-brand-200 hover:border-brand-500 text-slate-800 shadow-sm hover:shadow transition-all group"
            >
              <UserCheck className="w-4 h-4 text-brand-600 group-hover:scale-110 transition-transform mb-1" />
              <span className="text-[11px] font-bold">Customer</span>
              <span className="text-[9px] text-slate-400">Sophia M.</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('PROVIDER')}
              className="flex flex-col items-center p-2 rounded-xl bg-white border border-brand-200 hover:border-brand-500 text-slate-800 shadow-sm hover:shadow transition-all group"
            >
              <Briefcase className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform mb-1" />
              <span className="text-[11px] font-bold">Provider</span>
              <span className="text-[9px] text-slate-400">Alex V. (Tech)</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('ADMIN')}
              className="flex flex-col items-center p-2 rounded-xl bg-white border border-brand-200 hover:border-brand-500 text-slate-800 shadow-sm hover:shadow transition-all group"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform mb-1" />
              <span className="text-[11px] font-bold">Admin</span>
              <span className="text-[9px] text-slate-400">Superuser</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
            {error}
          </div>
        )}

        {/* Regular Login Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 text-sm transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 text-sm transition-all"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center space-x-2 text-slate-600 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
              <span>Remember me</span>
            </label>
            <a href="#forgot" className="text-brand-600 hover:text-brand-700 font-semibold">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-brand-600 hover:text-brand-700">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
};
