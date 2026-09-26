import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Clock, Heart, ArrowRight, ShieldCheck } from 'lucide-react';
import { Service } from '../../types';
import { favoritesApi } from '../../services/api';

interface ServiceCardProps {
  service: Service;
  isFavorited?: boolean;
  onFavoriteToggle?: (serviceId: string, isFav: boolean) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  isFavorited = false,
  onFavoriteToggle,
}) => {
  const [favorited, setFavorited] = useState(isFavorited);
  const [loadingFav, setLoadingFav] = useState(false);
  const navigate = useNavigate();

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setLoadingFav(true);
      const res = await favoritesApi.toggleFavorite({ serviceId: service.id });
      const nextFav = res.favorited;
      setFavorited(nextFav);
      if (onFavoriteToggle) {
        onFavoriteToggle(service.id, nextFav);
      }
    } catch (err) {
      setFavorited(!favorited);
    } finally {
      setLoadingFav(false);
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1">
      {/* Image Banner */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <img
          src={
            service.image ||
            'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600'
          }
          alt={service.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-80" />

        {/* Category Badge */}
        {service.category && (
          <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-md text-brand-700 text-xs font-bold rounded-lg shadow-sm">
            {service.category.name}
          </span>
        )}

        {/* Favorite Heart Button */}
        <button
          onClick={handleToggleFavorite}
          disabled={loadingFav}
          aria-label="Toggle Favorite"
          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-md text-slate-600 hover:text-rose-500 hover:bg-white shadow-sm transition-all"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              favorited ? 'fill-rose-500 text-rose-500' : 'text-slate-600'
            }`}
          />
        </button>

        {/* Rating overlay at bottom left */}
        <div className="absolute bottom-3 left-3 flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-slate-900/70 backdrop-blur-sm text-white text-xs font-semibold">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>4.9</span>
          <span className="text-slate-300 font-normal">
            ({service._count?.reviews || 24})
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <Link to={`/services/${service.slug || service.id}`}>
            <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-brand-600 transition-colors line-clamp-1">
              {service.name}
            </h3>
          </Link>
          <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
            {service.description}
          </p>
        </div>

        {/* Key Features / Duration */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <div className="flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>~{service.durationMinutes || 60} mins</span>
          </div>
          <div className="flex items-center space-x-1 text-emerald-600 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>30-Day Guarantee</span>
          </div>
        </div>

        {/* Price & CTA Action */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">Starting from</span>
            <div className="flex items-baseline space-x-1">
              <span className="text-lg font-extrabold text-slate-900">
                ₹{service.basePrice.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              to={`/services/${service.slug || service.id}`}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-xs font-medium"
              title="Details"
            >
              Info
            </Link>
            <button
              onClick={() => navigate(`/book/${service.id}`)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm hover:shadow transition-all"
            >
              <span>Book</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
