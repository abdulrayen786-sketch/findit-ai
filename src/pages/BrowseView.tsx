import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  Sparkles,
  MapPin,
  Tag,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { LostFoundItem } from '../types';
import { ItemCard } from '../components/ItemCard';
import { ITEM_CATEGORIES, CAMPUS_LOCATIONS, COMMON_COLORS } from '../utils/constants';

interface BrowseViewProps {
  items: LostFoundItem[];
  initialSearch?: string;
  onViewDetails: (id: string) => void;
  onClaim: (item: LostFoundItem) => void;
  onOpenReport: (type: 'lost' | 'found') => void;
}

export const BrowseView: React.FC<BrowseViewProps> = ({
  items,
  initialSearch = '',
  onViewDetails,
  onClaim,
  onOpenReport,
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedType, setSelectedType] = useState<'all' | 'lost' | 'found'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [onlyMatches, setOnlyMatches] = useState<boolean>(false);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Type
      if (selectedType !== 'all' && item.type !== selectedType) return false;

      // Category
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;

      // Location
      if (
        selectedLocation !== 'all' &&
        !item.location.toLowerCase().includes(selectedLocation.toLowerCase())
      ) {
        return false;
      }

      // Color
      if (
        selectedColor !== 'all' &&
        !item.color.toLowerCase().includes(selectedColor.toLowerCase())
      ) {
        return false;
      }

      // Status
      if (selectedStatus !== 'all' && item.status !== selectedStatus) return false;

      // Only potential matches
      if (onlyMatches && item.status !== 'POTENTIAL_MATCH') return false;

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchesQuery =
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q) ||
          item.buildingOrArea.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q) ||
          (item.brand && item.brand.toLowerCase().includes(q)) ||
          (item.distinguishingFeatures && item.distinguishingFeatures.toLowerCase().includes(q));

        if (!matchesQuery) return false;
      }

      return true;
    });
  }, [
    items,
    selectedType,
    selectedCategory,
    selectedLocation,
    selectedColor,
    selectedStatus,
    onlyMatches,
    searchTerm,
  ]);

  const hasActiveFilters =
    searchTerm !== '' ||
    selectedType !== 'all' ||
    selectedCategory !== 'all' ||
    selectedLocation !== 'all' ||
    selectedColor !== 'all' ||
    selectedStatus !== 'all' ||
    onlyMatches;

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedType('all');
    setSelectedCategory('all');
    setSelectedLocation('all');
    setSelectedColor('all');
    setSelectedStatus('all');
    setOnlyMatches(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header and Type Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Browse Campus Items
          </h1>
          <p className="text-xs text-slate-500">
            Real-time searchable directory of all reported belongings across campus
          </p>
        </div>

        {/* Type Filter Pills */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              selectedType === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Items ({items.length})
          </button>
          <button
            onClick={() => setSelectedType('lost')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              selectedType === 'lost'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Lost ({items.filter((i) => i.type === 'lost').length})
          </button>
          <button
            onClick={() => setSelectedType('found')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              selectedType === 'found'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Found ({items.filter((i) => i.type === 'found').length})
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Main search text input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by keywords, model, color, serial, building zone, or report ID..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick AI Match toggle */}
          <button
            onClick={() => setOnlyMatches(!onlyMatches)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors shrink-0 ${
              onlyMatches
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>AI Matches Only</span>
          </button>
        </div>

        {/* Dropdown Filters Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-100 text-xs">
          {/* Category */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 outline-none cursor-pointer"
          >
            <option value="all">All Categories</option>
            {ITEM_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Location */}
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 outline-none cursor-pointer"
          >
            <option value="all">All Campus Locations</option>
            {CAMPUS_LOCATIONS.map((loc) => (
              <option key={loc.area} value={loc.area}>
                {loc.area}
              </option>
            ))}
          </select>

          {/* Color */}
          <select
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 outline-none cursor-pointer"
          >
            <option value="all">All Colors</option>
            {COMMON_COLORS.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>

          {/* Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="LOST">Lost</option>
            <option value="FOUND">Found</option>
            <option value="POTENTIAL_MATCH">Potential Match</option>
            <option value="CLAIMED">Claimed</option>
            <option value="VERIFICATION_PENDING">Verification Pending</option>
            <option value="RETURNED">Returned</option>
          </select>
        </div>

        {/* Filter Summary & Reset */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
            <span>
              Showing <strong>{filteredItems.length}</strong> matching results
            </span>
            <button
              onClick={resetFilters}
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Items Grid or Empty State */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-8 h-8 opacity-60" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {items.length === 0 ? 'No items reported yet' : 'No Belongings Match Your Filter'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {items.length === 0
                ? 'Be the first to report a lost or found item.'
                : "We couldn't locate any records matching your specific search or filter criteria. You can clear filters or file a report below."}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 pt-2">
            {items.length > 0 && (
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800"
              >
                Clear Filters
              </button>
            )}
            <button
              onClick={() => onOpenReport('lost')}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
            >
              Report Lost Item
            </button>
            <button
              onClick={() => onOpenReport('found')}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
            >
              Report Found Item
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onViewDetails={onViewDetails}
              onClaim={onClaim}
            />
          ))}
        </div>
      )}
    </div>
  );
};
