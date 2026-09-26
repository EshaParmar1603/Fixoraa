import React, { useState, useEffect } from 'react';
import { Heart, Layers, Users } from 'lucide-react';
import { favoritesApi } from '../../services/api';
import { Favorite } from '../../types';
import { ServiceCard } from '../../components/cards/ServiceCard';
import { ProviderCard } from '../../components/cards/ProviderCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { useNavigate } from 'react-router-dom';

export const Favorites: React.FC = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [activeTab, setActiveTab] = useState<'SERVICES' | 'PROVIDERS'>('SERVICES');
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const data = await favoritesApi.getMyFavorites();
      setFavorites(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const savedServices = favorites.filter((f) => f.service);
  const savedProviders = favorites.filter((f) => f.provider);

  if (loading) {
    return <LoadingSpinner message="Retrieving your saved favorites..." fullScreen />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2.5">
          <Heart className="w-7 h-7 text-rose-500 fill-rose-500" />
          <span>My Saved Favorites</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Quickly access your preferred certified technicians and frequently booked repair services
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('SERVICES')}
          className={`flex items-center space-x-2 py-2 px-4 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'SERVICES'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Saved Services ({savedServices.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('PROVIDERS')}
          className={`flex items-center space-x-2 py-2 px-4 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'PROVIDERS'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Preferred Technicians ({savedProviders.length})</span>
        </button>
      </div>

      {/* Content */}
      {activeTab === 'SERVICES' ? (
        savedServices.length === 0 ? (
          <EmptyState
            icon={Layers}
            title="No saved services"
            description="Browse services and click the heart icon on any card to save it for quick booking."
            actionText="Explore Services"
            onAction={() => navigate('/services')}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedServices.map((fav) => (
              <ServiceCard
                key={fav.id}
                service={fav.service!}
                isFavorited={true}
                onFavoriteToggle={() => fetchFavorites()}
              />
            ))}
          </div>
        )
      ) : savedProviders.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No preferred technicians saved"
          description="Save top-rated technicians you like to easily schedule recurring maintenance with them."
          actionText="Find Technicians"
          onAction={() => navigate('/services')}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedProviders.map((fav) => (
            <ProviderCard
              key={fav.id}
              provider={fav.provider!}
              isFavorited={true}
              onSelect={() => navigate('/services')}
            />
          ))}
        </div>
      )}
    </div>
  );
};
