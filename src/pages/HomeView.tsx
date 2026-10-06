import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  ShieldCheck,
  Award,
  ArrowRight,
  MapPin,
  Clock,
  Compass,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  SlidersHorizontal,
  Package,
  Layers,
} from 'lucide-react';
import { LostFoundItem, ItemMatch } from '../types';
import { ItemCard } from '../components/ItemCard';
import { ITEM_CATEGORIES, CAMPUS_LOCATIONS } from '../utils/constants';

interface HomeViewProps {
  items: LostFoundItem[];
  onNavigate: (view: string, param?: string) => void;
  onOpenReport: (type: 'lost' | 'found') => void;
  onViewDetails: (id: string) => void;
  onClaim: (item: LostFoundItem) => void;
  onInspectMatch: (lost: LostFoundItem, found: LostFoundItem) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  items,
  onNavigate,
  onOpenReport,
  onViewDetails,
  onClaim,
  onInspectMatch,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('browse', searchQuery);
  };

  const recentItems = items.slice(0, 6);
  const potentialMatchesCount = items.filter((i) => i.status === 'POTENTIAL_MATCH').length;
  const returnedCount = items.filter((i) => i.status === 'RETURNED').length;
  const recoveryRate = items.length > 0 ? Math.round((returnedCount / items.length) * 100) : 0;

  return (
    <div className="space-y-16 pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-radial from-blue-950 via-slate-900 to-slate-950 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-blue-900/60 border border-blue-400/30 text-blue-300 text-xs font-semibold backdrop-blur-md shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>AI-Powered Campus Lost & Found Digital Infrastructure</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white font-sans max-w-4xl mx-auto leading-tight">
            Lost Something on Campus? <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300">
              FINDIT AI Connects Finders & Owners
            </span>
          </h1>

          {/* Supporting Copy */}
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Eliminating unorganized physical lost-property logbooks with deep semantic AI matching, verifiable ownership claims, and positive campus community trust.
          </p>

          {/* Quick Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-2xl mx-auto bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-2xl flex flex-col sm:flex-row gap-2"
          >
            <div className="relative flex-1 flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by item name, Casio calculator, black wallet, ID card..."
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-md flex items-center justify-center space-x-2"
            >
              <span>Search Campus</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Primary Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => onOpenReport('lost')}
              className="px-6 py-3 rounded-xl text-sm font-bold bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-lg hover:shadow-rose-900/30 flex items-center space-x-2"
            >
              <span>Report Lost Item</span>
              <span className="text-xs bg-rose-700/60 px-1.5 py-0.5 rounded">I Lost</span>
            </button>

            <button
              onClick={() => onOpenReport('found')}
              className="px-6 py-3 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg hover:shadow-emerald-900/30 flex items-center space-x-2"
            >
              <span>Report Found Item</span>
              <span className="text-xs bg-emerald-700/60 px-1.5 py-0.5 rounded">I Found</span>
            </button>

            <button
              onClick={() => onNavigate('browse')}
              className="px-6 py-3 rounded-xl text-sm font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur transition-colors"
            >
              Browse Campus Directory
            </button>
          </div>

          {/* Quick category pills */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
            <span className="text-xs text-slate-400 mr-1">Frequent:</span>
            {['College ID Card', 'Wallet / Purse', 'Scientific Calculators', 'Earphones & Headphones', 'Water Bottles & Flasks'].map((cat) => (
              <button
                key={cat}
                onClick={() => onNavigate('browse', cat)}
                className="text-xs px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* DYNAMIC STATISTICS SECTION (100% computed from actual records) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-black text-slate-900">
              {items.length}
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Campus Reports Filed
            </p>
            <p className="text-[11px] text-slate-400">Total items recorded</p>
          </div>

          <div className="space-y-1 border-l border-slate-100 pl-4 sm:pl-0">
            <div className="text-3xl sm:text-4xl font-black text-emerald-600">
              {returnedCount}
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Restored to Owners
            </p>
            <p className="text-[11px] text-emerald-600 font-medium">Verified handovers</p>
          </div>

          <div className="space-y-1 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0">
            <div className="text-3xl sm:text-4xl font-black text-blue-900 flex items-center justify-center space-x-1">
              <span>{potentialMatchesCount}</span>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              AI Potential Matches
            </p>
            <p className="text-[11px] text-slate-400">Active correlations</p>
          </div>

          <div className="space-y-1 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 pl-4 sm:pl-0">
            <div className="text-3xl sm:text-4xl font-black text-purple-600">
              {recoveryRate}%
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Recovery Rate
            </p>
            <p className="text-[11px] text-slate-400">Verified restoration ratio</p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
          <span className="text-xs font-bold text-blue-900 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
            Streamlined Campus Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            How FINDIT AI Works on Campus
          </h2>
          <p className="text-sm text-slate-600">
            A 4-step framework uniting automated intelligence with physical verification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center font-bold text-sm mb-4">
              01
            </div>
            <h3 className="font-bold text-base text-slate-900 mb-2">Report Belonging</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              File a structured report specifying the campus zone, time, distinctive marks, brand, and optional photo.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-900 flex items-center justify-center font-bold text-sm mb-4">
              02
            </div>
            <h3 className="font-bold text-base text-slate-900 mb-2">AI Semantic Match</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Gemini 3.8 Flash assesses semantic similarity, temporal proximity, and campus zone overlap to generate potential matches.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-900 flex items-center justify-center font-bold text-sm mb-4">
              03
            </div>
            <h3 className="font-bold text-base text-slate-900 mb-2">Claim & Verify</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Owners answer confidential questions (serial code, contents, scratches) reviewed only by campus security.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-900 flex items-center justify-center font-bold text-sm mb-4">
              04
            </div>
            <h3 className="font-bold text-base text-slate-900 mb-2">Finder Reputation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Upon successful handover, the finder receives verified Finder Score recognition, fostering campus integrity.
            </p>
          </div>
        </div>
      </section>

      {/* AI MATCHING SHOWCASE & EXPLAINABILITY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-800">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Explainable AI Engine</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                No Guesswork. Just Transparent, Explainable Matches.
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                FINDIT AI does not simply match exact titles. It evaluates descriptions, synonyms, campus geography, and temporal sequences using Google Gemini.
              </p>

              <div className="space-y-2 pt-2">
                <div className="flex items-start space-x-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Multi-Attribute Corroboration:</strong> Evaluates category, color, brand, campus building, and time delta.
                  </span>
                </div>
                <div className="flex items-start space-x-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Never Declares Ownership:</strong> Safeguards rightful owners by classifying results as "Potential Match" requiring human review.
                  </span>
                </div>
                <div className="flex items-start space-x-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Confidence Grading:</strong> Clear intervals (90%+ Strong, 70-89% Possible, 50-69% Weak).
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onNavigate('browse')}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md inline-flex items-center space-x-2"
                >
                  <span>Explore Active Campus Matches</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Architecture Explanatory Card */}
            <div className="bg-slate-800/90 rounded-2xl p-6 border border-slate-700/80 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <span className="text-xs font-bold text-amber-400 flex items-center space-x-1.5">
                  <Layers className="w-4 h-4" />
                  <span>AI CORRELATION ARCHITECTURE</span>
                </span>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-mono">
                  Gemini 3.8 Flash
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-start space-x-3 bg-slate-900/60 p-3 rounded-xl border border-slate-700">
                  <span className="w-6 h-6 rounded-full bg-blue-900 text-blue-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <h5 className="font-bold text-white">Semantic Text Understanding</h5>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Extracts latent embeddings, synonyms, and distinctive descriptors across titles and notes.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 bg-slate-900/60 p-3 rounded-xl border border-slate-700">
                  <span className="w-6 h-6 rounded-full bg-blue-900 text-blue-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <h5 className="font-bold text-white">Campus Spatial & Temporal Graph</h5>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Maps campus building zones (Library, Canteen, Academic Blocks) and checks loss-to-find timestamps.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 bg-slate-900/60 p-3 rounded-xl border border-slate-700">
                  <span className="w-6 h-6 rounded-full bg-blue-900 text-blue-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <h5 className="font-bold text-white">Transparent Reasoning Generator</h5>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Generates bulleted explainability points to guide campus security during claimant interviews.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-center pt-1 text-[11px] text-slate-400">
                Matches are automatically calculated in real time when new reports are submitted.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RECENT CAMPUS ITEMS FEED */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Recent Campus Lost & Found Items
            </h2>
            <p className="text-xs text-slate-500">
              Live reports filed by students and faculty across departments
            </p>
          </div>
          <button
            onClick={() => onNavigate('browse')}
            className="text-xs font-bold text-blue-900 hover:text-blue-700 flex items-center space-x-1"
          >
            <span>View All ({items.length} Reports)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentItems.length === 0 ? (
          /* EXACT REQUIRED EMPTY STATE: Requirement 8 */
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3 shadow-xs">
            <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Package className="w-7 h-7 opacity-50" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No items reported yet</h3>
            <p className="text-xs text-slate-500">Be the first to report a lost or found item.</p>
            <div className="flex items-center justify-center gap-2 pt-2">
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
            {recentItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onViewDetails={onViewDetails}
                onClaim={onClaim}
              />
            ))}
          </div>
        )}
      </section>

      {/* TRUST & SECURITY SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-100 rounded-3xl p-6 sm:p-10 border border-slate-200">
          <div className="max-w-3xl mx-auto text-center space-y-4 mb-8">
            <span className="text-xs font-bold text-blue-900 uppercase tracking-widest bg-blue-100 px-3 py-1 rounded-full">
              Integrity & Cyber Safety
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Built for Campus Trust & Fraud Prevention
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Traditional lost-and-found groups on messaging apps expose student phone numbers and permit fraudulent claims. FINDIT AI enforces strict security safeguards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Protected Contact Details</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Student mobile numbers and personal email addresses are never exposed to public view. All notifications route securely through the platform.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-900 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Reputation-Driven Finder Score</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Discourages scavenging and rewards genuine citizenship. Points only increase when security desks confirm honest handovers.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-900 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Physical Campus Verification</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Claims must be verified in person at the Central Security Desk with valid university student identification cards.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
