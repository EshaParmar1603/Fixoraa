import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { ServiceCard } from '../../components/cards/ServiceCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { servicesApi, categoriesApi } from '../../services/api';
import { Service, Category } from '../../types';

export const Services: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('category') || '';
  const searchFromUrl = searchParams.get('search') || '';

  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryFromUrl);
  const [searchTerm, setSearchTerm] = useState<string>(searchFromUrl);
  const [sortBy, setSortBy] = useState<string>('name');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const cats = await categoriesApi.getCategories();
        setCategories(cats || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCats();
  }, []);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const data = await servicesApi.getServices({
          categorySlug: selectedCategory || undefined,
          search: searchTerm || undefined,
          sortBy
        });
        setServices(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, [selectedCategory, searchTerm, sortBy]);

  const handleCategoryClick = (slug: string) => {
    const nextSlug = selectedCategory === slug ? '' : slug;
    setSelectedCategory(nextSlug);
    if (nextSlug) {
      searchParams.set('category', nextSlug);
    } else {
      searchParams.delete('category');
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Explore Appliance Services
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Select from certified repair packages with upfront fixed rates and guaranteed parts
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by repair type, part, or problem..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition-all"
          />
        </div>

        {/* Sort Selector */}
        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          <ArrowUpDown className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-600">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-500"
          >
            <option value="name">Name (A-Z)</option>
            <option value="price-asc">Price (Low to High)</option>
            <option value="price-desc">Price (High to Low)</option>
          </select>
        </div>
      </div>

      {/* Category Pills Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => handleCategoryClick('')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            selectedCategory === ''
              ? 'bg-brand-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryClick(cat.slug)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat.slug
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Services Grid or Loading / Empty */}
      {loading ? (
        <LoadingSpinner message="Searching available service packages..." />
      ) : services.length === 0 ? (
        <EmptyState
          title="No services found"
          description="We couldn't find any services matching your search criteria. Try removing filters or searching for another appliance keyword."
          actionText="Clear Filters"
          onAction={() => {
            setSelectedCategory('');
            setSearchTerm('');
            setSearchParams({});
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}
    </div>
  );
};
