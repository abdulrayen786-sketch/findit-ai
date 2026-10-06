import React from 'react';
import { MapPin, Calendar, Clock, Sparkles, Tag, ChevronRight, CheckCircle2 } from 'lucide-react';
import { LostFoundItem } from '../types';
import { STATUS_CONFIG } from '../utils/constants';

interface ItemCardProps {
  item: LostFoundItem;
  onViewDetails: (id: string) => void;
  onClaim?: (item: LostFoundItem) => void;
  matchScore?: number;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  onViewDetails,
  onClaim,
  matchScore,
}) => {
  const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.LOST;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col justify-between">
      <div>
        {/* Image / Header area */}
        <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-4">
              <Tag className="w-10 h-10 mb-1 opacity-50" />
              <span className="text-xs font-medium">No Image Attached</span>
            </div>
          )}

          {/* Type Badge (Lost vs Found) */}
          <div className="absolute top-3 left-3">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${
                item.type === 'lost'
                  ? 'bg-rose-600 text-white'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {item.type === 'lost' ? 'Lost Item' : 'Found Item'}
            </span>
          </div>

          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <span
              className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium border shadow-xs backdrop-blur-md bg-white/90 ${statusCfg.color}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
              <span>{statusCfg.label}</span>
            </span>
          </div>

          {/* AI Match Overlay if provided */}
          {(matchScore !== undefined || (item.status === 'POTENTIAL_MATCH' && item.matchScore !== undefined)) && (
            <div className="absolute bottom-3 left-3 right-3">
              <div className="bg-slate-900/90 backdrop-blur-md text-amber-300 text-xs px-2.5 py-1 rounded-lg flex items-center justify-between border border-amber-500/30 shadow-md">
                <span className="flex items-center space-x-1 font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>AI Potential Match</span>
                </span>
                <span className="font-bold text-white bg-amber-500/20 px-1.5 py-0.5 rounded">
                  {matchScore ?? item.matchScore}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Content info */}
        <div className="p-4 space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-medium text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                {item.category}
              </span>
              <span className="font-mono text-[11px] text-slate-400">#{item.id}</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-900 transition-colors line-clamp-1">
              {item.title}
            </h3>
            <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Details metadata */}
          <div className="space-y-1.5 text-xs text-slate-500 pt-1 border-t border-slate-100">
            <div className="flex items-center space-x-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">
                {item.location} • <span className="text-slate-400">{item.buildingOrArea}</span>
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center space-x-1 text-slate-500">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{item.date}</span>
              </div>
              <div className="flex items-center space-x-1 text-slate-400">
                <Clock className="w-3 h-3" />
                <span>approx {item.approximateTime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card Actions */}
      <div className="p-4 pt-0 flex items-center space-x-2">
        <button
          onClick={() => onViewDetails(item.id)}
          className="flex-1 py-2 px-3 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors flex items-center justify-center space-x-1"
        >
          <span>View Details</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {item.type === 'found' && item.status !== 'RETURNED' && onClaim && (
          <button
            onClick={() => onClaim(item)}
            className="py-2 px-3 text-xs font-semibold rounded-xl bg-blue-900 hover:bg-blue-800 text-white transition-colors flex items-center space-x-1 shadow-xs"
          >
            <span>Is this yours?</span>
          </button>
        )}
      </div>
    </div>
  );
};
