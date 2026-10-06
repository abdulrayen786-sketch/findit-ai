import React, { useEffect, useState } from 'react';
import {
  User,
  Sparkles,
  Award,
  Package,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  PlusCircle,
  FileText,
  Bell,
} from 'lucide-react';
import { LostFoundItem, Claim, ItemMatch } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ItemCard } from '../components/ItemCard';

interface DashboardViewProps {
  onNavigate: (view: string, param?: string) => void;
  onOpenReport: (type: 'lost' | 'found') => void;
  onViewDetails: (id: string) => void;
  onClaim: (item: LostFoundItem) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenReport,
  onViewDetails,
  onClaim,
}) => {
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'lost' | 'found' | 'matches' | 'claims' | 'notifications'>('lost');
  const [userItems, setUserItems] = useState<LostFoundItem[]>([]);
  const [userClaims, setUserClaims] = useState<Claim[]>([]);
  const [matches, setMatches] = useState<ItemMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      if (!currentUser) return;
      try {
        setLoading(true);
        const [items, claims, allMatches] = await Promise.all([
          api.getItems({ userId: currentUser.id }),
          api.getClaims({ claimantId: currentUser.id }),
          api.getAllMatches(),
        ]);

        setUserItems(items);
        setUserClaims(claims);

        // Filter matches related to current user's items
        const userItemIds = items.map((i) => i.id);
        const relevantMatches = allMatches.filter(
          (m) => userItemIds.includes(m.lostItemId) || userItemIds.includes(m.foundItemId)
        );
        setMatches(relevantMatches);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [currentUser]);

  const lostItems = userItems.filter((i) => i.type === 'lost');
  const foundItems = userItems.filter((i) => i.type === 'found');
  const returnedCount = userItems.filter((i) => i.status === 'RETURNED').length;

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-900 flex items-center justify-center mx-auto">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Personal Dashboard Access</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Please sign in or register your student or faculty account to track your reported items, potential AI matches, and ownership claims.
        </p>
        <button
          onClick={() => onNavigate('home')}
          className="px-5 py-2.5 rounded-xl bg-blue-900 text-white text-xs font-bold shadow-xs"
        >
          Return to Campus Portal
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* User Header / Hero Summary */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <img
            src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
            alt={currentUser?.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-200 shadow-xs"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                {currentUser?.name}
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                {currentUser?.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentUser?.department} • ID: <span className="font-mono">{currentUser?.studentOrStaffId}</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">{currentUser?.email}</p>
          </div>
        </div>

        {/* Finder Score & Stats Badges */}
        <div className="flex flex-wrap items-center gap-3">
          <div
            onClick={() => onNavigate('finder-score')}
            className="bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-2xl flex items-center space-x-3 cursor-pointer hover:bg-amber-100 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase text-amber-800 block">
                Finder Score
              </span>
              <span className="text-lg font-black text-amber-950">
                {currentUser?.finderScore || 50}/100
              </span>
            </div>
          </div>

          <button
            onClick={() => onOpenReport('lost')}
            className="px-4 py-2.5 text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-2xl transition-colors"
          >
            + Report Lost
          </button>
          <button
            onClick={() => onOpenReport('found')}
            className="px-4 py-2.5 text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-2xl transition-colors"
          >
            + Report Found
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">My Lost Reports</span>
          <div className="text-2xl font-black text-rose-600 mt-1">{lostItems.length}</div>
          <span className="text-[10px] text-slate-400">Items you misplaced</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">My Found Reports</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">{foundItems.length}</div>
          <span className="text-[10px] text-slate-400">Items you reported found</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Active AI Matches</span>
          <div className="text-2xl font-black text-amber-600 mt-1">{matches.length}</div>
          <span className="text-[10px] text-slate-400">Potential correlations</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">My Ownership Claims</span>
          <div className="text-2xl font-black text-blue-900 mt-1">{userClaims.length}</div>
          <span className="text-[10px] text-slate-400">Verification in progress</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 flex items-center space-x-2 text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab('lost')}
          className={`pb-3 px-3 transition-colors border-b-2 flex items-center space-x-1.5 whitespace-nowrap ${
            activeTab === 'lost'
              ? 'border-blue-900 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>My Lost Reports ({lostItems.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('found')}
          className={`pb-3 px-3 transition-colors border-b-2 flex items-center space-x-1.5 whitespace-nowrap ${
            activeTab === 'found'
              ? 'border-blue-900 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>My Found Reports ({foundItems.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('matches')}
          className={`pb-3 px-3 transition-colors border-b-2 flex items-center space-x-1.5 whitespace-nowrap ${
            activeTab === 'matches'
              ? 'border-blue-900 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Potential Matches ({matches.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('claims')}
          className={`pb-3 px-3 transition-colors border-b-2 flex items-center space-x-1.5 whitespace-nowrap ${
            activeTab === 'claims'
              ? 'border-blue-900 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>My Claims ({userClaims.length})</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'lost' && (
          <div>
            {lostItems.length === 0 ? (
              <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-xs text-slate-500 space-y-3">
                <p>You have not reported any lost belongings.</p>
                <button
                  onClick={() => onOpenReport('lost')}
                  className="px-4 py-2 bg-rose-600 text-white rounded-xl font-bold"
                >
                  File a Lost Report
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {lostItems.map((item) => (
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
        )}

        {activeTab === 'found' && (
          <div>
            {foundItems.length === 0 ? (
              <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-xs text-slate-500 space-y-3">
                <p>You have not reported any found belongings on campus.</p>
                <button
                  onClick={() => onOpenReport('found')}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold"
                >
                  Report a Found Belonging
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {foundItems.map((item) => (
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
        )}

        {activeTab === 'matches' && (
          <div className="space-y-4">
            {matches.length === 0 ? (
              <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-xs text-slate-500">
                No potential matches currently flagged for your belongings.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matches.map((m) => (
                  <div
                    key={m.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                        AI Correlation: {m.score}%
                      </span>
                      <span className="text-xs font-semibold text-slate-400 font-mono">
                        {m.id}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs">
                      <p className="font-bold text-slate-900">
                        {m.lostItemTitle} ↔ {m.foundItemTitle}
                      </p>
                      <p className="text-slate-500 text-[11px] leading-relaxed">
                        {m.reasoning.recommendation}
                      </p>
                    </div>

                    <div className="pt-2 flex justify-between items-center text-xs">
                      <button
                        onClick={() => onViewDetails(m.lostItemId)}
                        className="text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        View #{m.lostItemId}
                      </button>
                      <button
                        onClick={() => onViewDetails(m.foundItemId)}
                        className="text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        View #{m.foundItemId}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'claims' && (
          <div className="space-y-4">
            {userClaims.length === 0 ? (
              <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-xs text-slate-500">
                You haven't filed any ownership claims.
              </div>
            ) : (
              <div className="space-y-3">
                {userClaims.map((claim) => (
                  <div
                    key={claim.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-900">
                          Claim for "{claim.itemTitle}"
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono ml-2">
                          #{claim.id}
                        </span>
                      </div>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase ${
                          claim.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : claim.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {claim.status}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
                      <p className="text-slate-500">
                        <strong>Submitted Proof: </strong>
                        {claim.uniqueFeatureProof}
                      </p>
                      {claim.adminNotes && (
                        <p className="text-blue-900 font-medium">
                          <strong>Admin Feedback: </strong>
                          {claim.adminNotes}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-between items-center text-xs text-slate-400">
                      <span>Submitted on {new Date(claim.createdAt).toLocaleDateString()}</span>
                      <button
                        onClick={() => onViewDetails(claim.itemId)}
                        className="text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        View Item Report #{claim.itemId}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
