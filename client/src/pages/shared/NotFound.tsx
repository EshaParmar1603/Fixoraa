import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Home, Search, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-xl space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-brand-50 mx-auto flex items-center justify-center text-brand-600 ring-8 ring-brand-50/50">
          <Wrench className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-4xl sm:text-5xl font-black text-brand-600">404</span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            The service page or resource you are looking for might have been moved or does not exist.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="w-full sm:w-auto px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center space-x-1.5"
          >
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </Link>

          <Link
            to="/services"
            className="w-full sm:w-auto px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition-colors flex items-center justify-center space-x-1.5"
          >
            <Search className="w-4 h-4" />
            <span>Browse Services</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
