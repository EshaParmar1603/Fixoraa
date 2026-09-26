import React, { useState } from 'react';
import { Star, ShieldCheck, CheckCircle2, MessageSquare, Heart, MapPin, Briefcase } from 'lucide-react';
import { ProviderProfile } from '../../types';
import { favoritesApi } from '../../services/api';
import { useNavigate } from 'react-router-dom';

interface ProviderCardProps {
  provider: ProviderProfile;
  isFavorited?: boolean;
  onSelect?: (provider: ProviderProfile) => void;
  selected?: boolean;
}

export const ProviderCard: React.FC<ProviderCardProps> = ({
  provider,
  isFavorited = false,
  onSelect,
  selected = false,
}) => {
  const [favorited, setFavorited] = useState(isFavorited);
  const navigate = useNavigate();

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await favoritesApi.toggleFavorite({ providerId: provider.id });
      setFavorited(res.favorited);
    } catch {
      setFavorited(!favorited);
    }
  };

  const name = provider.user?.name || 'Certified Specialist';
  const avatar =
    provider.user?.avatar ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`;

  return (
    <div
      onClick={() => onSelect && onSelect(provider)}
      className={`group bg-white rounded-2xl border p-5 transition-all duration-200 cursor-pointer ${
        selected
          ? 'border-brand-600 ring-2 ring-brand-500/20 shadow-md'
          : 'border-slate-200/80 hover:border-brand-300 hover:shadow-lg'
      }`}
    >
      <div className="flex items-start justify-between">
        {/* Avatar & Verification */}
        <div className="flex items-start space-x-3.5">
          <div className="relative">
            <img
              src={avatar}
              alt={name}
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-100"
            />
            {provider.isVerified && (
              <span
                className="absolute -bottom-1 -right-1 p-0.5 bg-emerald-500 text-white rounded-full ring-2 ring-white"
                title="Verified Professional"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h4 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors">
                {name}
              </h4>
              {provider.isVerified && (
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  Verified
                </span>
              )}
            </div>

            <div className="flex items-center space-x-3 mt-1 text-xs text-slate-500">
              <span className="flex items-center">
                <Briefcase className="w-3.5 h-3.5 mr-1 text-slate-400" />
                {provider.experienceYears || 5} yrs exp
              </span>
              <span className="flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                {provider.city || provider.user?.city || 'Local Area'}
              </span>
            </div>
          </div>
        </div>

        {/* Favorite Heart */}
        <button
          onClick={handleToggleFavorite}
          className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
          title="Save Provider"
        >
          <Heart
            className={`w-4 h-4 ${
              favorited ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
            }`}
          />
        </button>
      </div>

      {/* Bio excerpt */}
      <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
        {provider.bio ||
          'Expert technician specializing in domestic cooling, electrical safety, and appliance repair.'}
      </p>

      {/* Rating & Rate footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-xs">
        <div className="flex items-center space-x-1.5">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span className="font-bold text-slate-900">{provider.rating?.toFixed(1) || '4.9'}</span>
          <span className="text-slate-400">({provider.reviewCount || 48} reviews)</span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-medium">Hourly Base</span>
            <span className="text-sm font-extrabold text-slate-900">
              ₹{provider.hourlyRate || 399}/hr
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate('/chat');
            }}
            className="p-2 rounded-xl bg-slate-100 hover:bg-brand-50 hover:text-brand-600 text-slate-600 transition-colors"
            title="Chat with Technician"
          >
            <MessageSquare className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
