import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Clock, Award, CheckCircle2, Zap } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';

export const Footer: React.FC = () => {
  const { isConnected } = useSocket();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Propositions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-slate-800">
          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Background Verified</h4>
              <p className="text-xs text-slate-400 mt-1">Every technician passes rigorous multi-point criminal & skill verification.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">30-Day Fix Guarantee</h4>
              <p className="text-xs text-slate-400 mt-1">If the issue returns within 30 days, we fix it free of charge. No questions asked.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">On-Time Arrival</h4>
              <p className="text-xs text-slate-400 mt-1">GPS-tracked appointments and real-time chat with direct technician ETA.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">Transparent Pricing</h4>
              <p className="text-xs text-slate-400 mt-1">Clear itemized rate cards with zero hidden inspection surcharges.</p>
            </div>
          </div>
        </div>

        {/* Links & Info */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 py-12">
          {/* Col 1: Brand & Health */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="inline-block group">
              <img
                src="/citylink-footer-logo.png"
                alt="CityLink - Your City, Your Services"
                className="h-16 sm:h-20 w-auto rounded-2xl shadow-xl border border-slate-800/80 group-hover:border-teal-500/50 transition-all object-contain bg-slate-950/40"
              />
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              The premier ecosystem connecting homeowners with background-verified appliance technicians, automated service schedules, and tamper-proof digital warranty vault.
            </p>
            {/* System Health Status */}
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-ping' : 'bg-emerald-400'}`}></span>
              <span className="text-slate-300 font-medium">Platform Health:</span>
              <span className="text-emerald-400 font-semibold">{isConnected ? 'All Systems Operational' : 'Standby / Demo Connected'}</span>
            </div>
          </div>

          {/* Col 2: Services */}
          <div>
            <h5 className="text-white font-bold text-sm mb-4">Appliance Repairs</h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/services?category=ac-cooling" className="hover:text-white transition-colors">AC Repair & Jet Pump</Link></li>
              <li><Link to="/services?category=refrigeration" className="hover:text-white transition-colors">Refrigerator Servicing</Link></li>
              <li><Link to="/services?category=washing-machine" className="hover:text-white transition-colors">Washing Machine Repair</Link></li>
              <li><Link to="/services?category=kitchen-appliances" className="hover:text-white transition-colors">Kitchen & Microwave</Link></li>
              <li><Link to="/services?category=water-purifier" className="hover:text-white transition-colors">RO Water Purifiers</Link></li>
            </ul>
          </div>

          {/* Col 3: Living & Events */}
          <div>
            <h5 className="text-white font-bold text-sm mb-4">Living & Events</h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/interior-design" className="hover:text-white transition-colors">AI Interior Design Studio</Link></li>
              <li><Link to="/caterers" className="hover:text-white transition-colors">Gourmet Caterers & Feasts</Link></li>
              <li><Link to="/event-planner" className="hover:text-white transition-colors">Luxury Event Planner</Link></li>
              <li><Link to="/appliances" className="hover:text-white transition-colors">Home Appliance Registry</Link></li>
            </ul>
          </div>

          {/* Col 4: Platform & Pro */}
          <div>
            <h5 className="text-white font-bold text-sm mb-4">Portals & Vault</h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/my-bookings" className="hover:text-white transition-colors">My Booking Tracking</Link></li>
              <li><Link to="/warranties" className="hover:text-white transition-colors">Bill & Warranty Vault</Link></li>
              <li><Link to="/provider/dashboard" className="hover:text-white transition-colors">Provider Dashboard</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Join Pro Partner Network</Link></li>
              <li><Link to="/admin/dashboard" className="hover:text-white transition-colors">Admin Supervision</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 space-y-4 sm:space-y-0">
          <p>© {new Date().getFullYear()} CityLink Services Inc. All rights reserved.</p>
          <div className="flex space-x-6">
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Security Audits</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
