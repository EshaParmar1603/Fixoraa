import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, ShieldCheck, Clock, Award, CheckCircle2, Zap } from 'lucide-react';
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
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white">
                <Wrench className="w-4 h-4" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">Fixora</span>
            </div>
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
            <h5 className="text-white font-bold text-sm mb-4">Core Services</h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/services?category=ac-cooling" className="hover:text-white transition-colors">AC Repair & Jet Pump</Link></li>
              <li><Link to="/services?category=refrigeration" className="hover:text-white transition-colors">Refrigerator Servicing</Link></li>
              <li><Link to="/services?category=washing-machine" className="hover:text-white transition-colors">Washing Machine Repair</Link></li>
              <li><Link to="/services?category=kitchen-appliances" className="hover:text-white transition-colors">Microwave & Chimneys</Link></li>
              <li><Link to="/services?category=water-purifier" className="hover:text-white transition-colors">RO Water Purifiers</Link></li>
            </ul>
          </div>

          {/* Col 3: Platform */}
          <div>
            <h5 className="text-white font-bold text-sm mb-4">Customer Vault</h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/appliances" className="hover:text-white transition-colors">Appliance Registry</Link></li>
              <li><Link to="/warranties" className="hover:text-white transition-colors">Bill & Warranty Vault</Link></li>
              <li><Link to="/my-bookings" className="hover:text-white transition-colors">Booking Tracking</Link></li>
              <li><Link to="/favorites" className="hover:text-white transition-colors">Saved Technicians</Link></li>
              <li><Link to="/complaints" className="hover:text-white transition-colors">Dispute Resolution</Link></li>
            </ul>
          </div>

          {/* Col 4: For Providers */}
          <div>
            <h5 className="text-white font-bold text-sm mb-4">Professionals</h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/provider/dashboard" className="hover:text-white transition-colors">Provider Dashboard</Link></li>
              <li><Link to="/provider/availability" className="hover:text-white transition-colors">Operating Hours</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Join Technician Network</Link></li>
              <li><Link to="/admin/dashboard" className="hover:text-white transition-colors">Admin Supervision</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 space-y-4 sm:space-y-0">
          <p>© {new Date().getFullYear()} Fixora Home Services Inc. All rights reserved.</p>
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
