import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Sparkles,
  Shield,
  ShieldCheck,
  Tag,
  Share2,
  AlertTriangle,
  CheckCircle2,
  User,
  Building2,
} from 'lucide-react';
import { LostFoundItem, ItemMatch } from '../types';
import { STATUS_CONFIG } from '../utils/constants';
import { api } from '../services/api';

interface ItemDetailsViewProps {
  itemId: string;
  onBack: () => void;
  onClaim: (item: LostFoundItem) => void;
  onInspectMatch: (lost: LostFoundItem, found: LostFoundItem, match: ItemMatch) => void;
  onViewDetails: (id: string) => void;
}

export const ItemDetailsView: React.FC<ItemDetailsViewProps> = ({
  itemId,
  onBack,
  onClaim,
  onInspectMatch,
  onViewDetails,
}) => {
  const [item, setItem] = useState<LostFoundItem | null>(null);
  const [matches, setMatches] = useState<ItemMatch[]>([]);
  const [allOppositeItems, setAllOppositeItems] = useState<LostFoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        const data = await api.getItemById(itemId);
        setItem(data.item);
        setMatches(data.matches || []);

        // Also fetch candidate opposite items
        const oppositeType = data.item.type === 'lost' ? 'found' : 'lost';
        const opps = await api.getItems({ type: oppositeType });
        setAllOppositeItems(opps);
      } catch (err: any) {
        setError(err.message || 'Failed to load item details');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [itemId]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Retrieving campus report #{itemId}...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900">Belonging Record Not Found</h2>
        <p className="text-xs text-slate-500">{error || 'This item ID does not exist or was closed.'}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 text-white"
        >
          Return to Directory
        </button>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.LOST;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Campus Directory</span>
        </button>
      </div>

      {/* Main Item Card Layout */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left column: Image & status */}
        <div className="lg:col-span-5 bg-slate-100 relative min-h-[320px] flex items-center justify-center p-4">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full max-h-[460px] object-cover rounded-2xl shadow-sm"
            />
          ) : (
            <div className="text-center p-8 text-slate-400">
              <Tag className="w-16 h-16 mx-auto mb-2 opacity-40" />
              <p className="text-xs font-medium">No Photographic Evidence Uploaded</p>
              <p className="text-[11px] text-slate-400 mt-1">Verified via textual distinguishing features</p>
            </div>
          )}

          {/* Type tag */}
          <div className="absolute top-4 left-4">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-md text-white ${
                item.type === 'lost' ? 'bg-rose-600' : 'bg-emerald-600'
              }`}
            >
              {item.type === 'lost' ? 'Lost Belonging' : 'Found Belonging'}
            </span>
          </div>
        </div>

        {/* Right column: Structured Details */}
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Top metadata */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold bg-blue-50 text-blue-900 px-2.5 py-1 rounded-md">
                  {item.category}
                </span>
                <span className="text-xs font-mono text-slate-400">ID #{item.id}</span>
              </div>

              {/* Status pill */}
              <span
                className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusCfg.color}`}
              >
                <span className={`w-2 h-2 rounded-full ${statusCfg.dot}`} />
                <span>{statusCfg.label}</span>
              </span>
            </div>

            {/* Title & Description */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {item.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                {item.description}
              </p>
            </div>

            {/* Specifications Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Primary Color</span>
                <span className="font-bold text-slate-800">{item.color}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Brand / Maker</span>
                <span className="font-bold text-slate-800">{item.brand || 'Unbranded'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Reported Date</span>
                <span className="font-bold text-slate-800">{item.date}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Campus Zone</span>
                <span className="font-bold text-slate-800 truncate block">{item.location}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-400 block text-[11px]">Specific Area / Room</span>
                <span className="font-bold text-slate-800 truncate block">{item.buildingOrArea}</span>
              </div>
            </div>

            {/* Distinguishing Features */}
            {item.distinguishingFeatures && (
              <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200/80 text-xs text-amber-900 space-y-1">
                <span className="font-bold flex items-center space-x-1 text-amber-800">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Distinguishing Marks / Identifiers:</span>
                </span>
                <p className="leading-snug text-slate-700">{item.distinguishingFeatures}</p>
              </div>
            )}

            {/* Privacy Shield Notice regarding Personal Contact Info */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start space-x-2.5 text-xs text-slate-600">
              <Shield className="w-4 h-4 text-blue-900 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900">Protected Reporter Privacy: </span>
                <span>
                  Reported by {item.userName} ({item.userRole}, {item.userDepartment || 'Campus'}).
                  Contact details are protected by FINDIT AI cybersecurity policy to deter unsolicited fraud.
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
            {item.type === 'found' && item.status !== 'RETURNED' && (
              <button
                onClick={() => onClaim(item)}
                className="flex-1 py-3 px-6 rounded-2xl font-bold text-xs bg-blue-900 hover:bg-blue-800 text-white transition-all shadow-md flex items-center justify-center space-x-2"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Is this your item? Claim & Verify</span>
              </button>
            )}

            {item.status === 'RETURNED' && (
              <div className="flex-1 py-3 px-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold text-center flex items-center justify-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>Successfully Restored to Verified Owner</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI POTENTIAL MATCHES SECTION */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                AI Potential Matches for #{item.id}
              </h2>
              <p className="text-xs text-slate-500">
                Semantic correlations evaluated by Gemini AI across opposite campus reports
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
            {matches.length} Match(es) Available
          </span>
        </div>

        {matches.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-xs text-slate-500 space-y-2">
            <p className="font-semibold text-slate-700">No active AI matches found yet.</p>
            <p className="max-w-md mx-auto">
              As students report new belongings in this category ({item.category}), FINDIT AI will compare attributes in real time and notify you.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches.map((m) => {
              const oppId = item.type === 'lost' ? m.foundItemId : m.lostItemId;
              const oppTitle = item.type === 'lost' ? m.foundItemTitle : m.lostItemTitle;
              const oppositeItem = allOppositeItems.find((o) => o.id === oppId);

              return (
                <div
                  key={m.id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-blue-400 p-5 shadow-xs space-y-4 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                        {item.type === 'lost' ? 'Matched Found Report' : 'Matched Lost Report'}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 mt-1 line-clamp-1">
                        {oppTitle}
                      </h4>
                      <span className="text-[11px] font-mono text-slate-400">ID #{oppId}</span>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-black text-blue-900">{m.score}%</div>
                      <span
                        className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          m.score >= 90
                            ? 'bg-emerald-100 text-emerald-800'
                            : m.score >= 70
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {m.confidenceLabel}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    "{m.reasoning.reasons[0] || m.reasoning.recommendation}"
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => onViewDetails(oppId)}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                    >
                      View Report #{oppId}
                    </button>

                    <button
                      onClick={() => {
                        if (oppositeItem) {
                          const lostObj = item.type === 'lost' ? item : oppositeItem;
                          const foundObj = item.type === 'found' ? item : oppositeItem;
                          onInspectMatch(lostObj, foundObj, m);
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold shadow-xs flex items-center space-x-1"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Inspect AI Breakdown</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
