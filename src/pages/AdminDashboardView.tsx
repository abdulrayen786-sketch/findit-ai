import React, { useEffect, useState } from 'react';
import {
  Shield,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  Users,
  Package,
  Award,
  Trash2,
  Eye,
  Filter,
  RefreshCw,
  Search,
  Check,
  X,
} from 'lucide-react';
import { LostFoundItem, Claim, ItemMatch, AdminStats } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface AdminDashboardViewProps {
  onViewDetails: (id: string) => void;
  onNavigate: (view: string) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  onViewDetails,
  onNavigate,
}) => {
  const { currentUser } = useAuth();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [matches, setMatches] = useState<ItemMatch[]>([]);
  const [activeTab, setActiveTab] = useState<'claims' | 'items' | 'matches'>('claims');
  const [loading, setLoading] = useState(true);

  // Review modal state
  const [selectedClaimForReview, setSelectedClaimForReview] = useState<Claim | null>(null);
  const [adminReviewNotes, setAdminReviewNotes] = useState('');
  const [reviewAction, setReviewAction] = useState<'approved' | 'rejected'>('approved');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Deletion confirm state
  const [itemToDelete, setItemToDelete] = useState<LostFoundItem | null>(null);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [adminStats, allClaims, allItems, allMatches] = await Promise.all([
        api.getAdminStats(),
        api.getClaims(),
        api.getItems(),
        api.getAllMatches(),
      ]);
      setStats(adminStats);
      setClaims(allClaims);
      setItems(allItems);
      setMatches(allMatches);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      loadAdminData();
    }
  }, [currentUser]);

  // If user is not admin, display role-based protection screen
  if (currentUser?.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Restricted Administrative Area</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Access to campus moderation, ownership claim approval, and student audit records requires authorized staff or security administration credentials.
        </p>
        <p className="text-xs text-blue-900 font-semibold bg-blue-50 p-3 rounded-xl border border-blue-200">
          To access this control center, please register or sign in with an account having the <strong>Administrator</strong> role.
        </p>
        <button
          onClick={() => onNavigate('home')}
          className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold"
        >
          Return to Campus Portal
        </button>
      </div>
    );
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClaimForReview) return;

    try {
      setSubmittingReview(true);
      await api.reviewClaim(
        selectedClaimForReview.id,
        reviewAction,
        adminReviewNotes,
        currentUser.id
      );

      // Reload
      await loadAdminData();
      setSelectedClaimForReview(null);
      setAdminReviewNotes('');
    } catch (err: any) {
      alert(err.message || 'Failed to review claim');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleMarkReturned = async (itemId: string) => {
    const confirmed = window.confirm('Mark this item as successfully restored and returned to verified student?');
    if (!confirmed) return;
    try {
      await api.updateItemStatus(itemId, 'RETURNED');
      await loadAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await api.deleteItem(itemId);
      setItemToDelete(null);
      await loadAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-500/30 text-purple-300 border border-purple-400/30">
              Campus Security Operations
            </span>
            <span className="text-xs text-slate-400">Admin Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            FINDIT AI Management Console
          </h1>
          <p className="text-xs text-slate-300">
            Logged in as: {currentUser.name} ({currentUser.department})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={loadAdminData}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center space-x-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={async () => {
              if (window.confirm('Load isolated dev seed data for viva testing?')) {
                await fetch('/api/admin/dev-seed', { method: 'POST' });
                await loadAdminData();
              }
            }}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-700 flex items-center space-x-1.5 transition-colors"
            title="Load isolated development seed"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Load Dev Seed</span>
          </button>
          {items.length > 0 && (
            <button
              onClick={async () => {
                if (window.confirm('Reset database back to clean empty state?')) {
                  await fetch('/api/admin/clear-all', { method: 'POST' });
                  await loadAdminData();
                }
              }}
              className="px-3 py-2 text-xs font-semibold rounded-xl bg-rose-900/40 hover:bg-rose-900/80 text-rose-300 border border-rose-800 flex items-center space-x-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Database</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Overview Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] text-slate-500 font-medium block">Total Reports</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.totalReports}</div>
            <span className="text-[10px] text-slate-400">Campus records</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] text-slate-500 font-medium block">Pending Claims</span>
            <div className="text-2xl font-black text-amber-600 mt-1">{stats.pendingClaimsCount}</div>
            <span className="text-[10px] text-amber-600 font-semibold">Requires action</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] text-slate-500 font-medium block">Restored Items</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">{stats.returnedItemsCount}</div>
            <span className="text-[10px] text-slate-400">Physical returns</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] text-slate-500 font-medium block">Recovery Rate</span>
            <div className="text-2xl font-black text-blue-900 mt-1">{stats.recoveryRatePercent}%</div>
            <span className="text-[10px] text-slate-400">Restoration ratio</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] text-slate-500 font-medium block">AI Correlations</span>
            <div className="text-2xl font-black text-purple-600 mt-1">{stats.strongMatchesCount}</div>
            <span className="text-[10px] text-slate-400">High confidence</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[11px] text-slate-500 font-medium block">Registered Users</span>
            <div className="text-2xl font-black text-slate-800 mt-1">{stats.activeUsersCount}</div>
            <span className="text-[10px] text-slate-400">Students & staff</span>
          </div>
        </div>
      )}

      {/* Admin Module Tabs */}
      <div className="border-b border-slate-200 flex items-center space-x-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('claims')}
          className={`pb-3 px-4 border-b-2 transition-colors flex items-center space-x-2 ${
            activeTab === 'claims'
              ? 'border-blue-900 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Claims Review Queue ({claims.filter((c) => c.status === 'pending').length} Pending)</span>
        </button>

        <button
          onClick={() => setActiveTab('items')}
          className={`pb-3 px-4 border-b-2 transition-colors flex items-center space-x-2 ${
            activeTab === 'items'
              ? 'border-blue-900 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Manage Campus Reports ({items.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('matches')}
          className={`pb-3 px-4 border-b-2 transition-colors flex items-center space-x-2 ${
            activeTab === 'matches'
              ? 'border-blue-900 text-blue-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>AI Matches Audit ({matches.length})</span>
        </button>
      </div>

      {/* TAB CONTENT: CLAIMS REVIEW QUEUE */}
      {activeTab === 'claims' && (
        <div className="space-y-4">
          {claims.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-xs text-slate-500">
              No ownership claims filed yet.
            </div>
          ) : (
            <div className="space-y-4">
              {claims.map((claim) => (
                <div
                  key={claim.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-slate-900">
                          Claim for "{claim.itemTitle}"
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">#{claim.id}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Claimant: <strong>{claim.claimantName}</strong> ({claim.claimantStudentId}) • {claim.claimantDepartment}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
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

                      {claim.status === 'pending' && (
                        <button
                          onClick={() => setSelectedClaimForReview(claim)}
                          className="px-3 py-1.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold shadow-xs"
                        >
                          Review & Decide
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Private Proof Answers (Confidential to Admin) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div>
                      <span className="font-bold text-slate-700 block">
                        Secret Unique Feature Proof:
                      </span>
                      <p className="text-slate-600 mt-0.5">{claim.uniqueFeatureProof}</p>
                    </div>

                    <div>
                      <span className="font-bold text-slate-700 block">
                        Internal Contents / Denominations:
                      </span>
                      <p className="text-slate-600 mt-0.5">
                        {claim.itemContentsProof || 'None listed'}
                      </p>
                    </div>

                    <div>
                      <span className="font-bold text-slate-700 block">
                        Circumstances & Private Description:
                      </span>
                      <p className="text-slate-600 mt-0.5">{claim.privateDescription}</p>
                    </div>

                    <div>
                      <span className="font-bold text-slate-700 block">
                        Purchase / Issue Details:
                      </span>
                      <p className="text-slate-600 mt-0.5">
                        {claim.approximatePurchaseInfo || 'None specified'}
                      </p>
                    </div>
                  </div>

                  {claim.adminNotes && (
                    <div className="text-xs bg-purple-50 text-purple-900 p-3 rounded-xl border border-purple-100">
                      <strong>Administrative Decision Note: </strong>
                      {claim.adminNotes} (Reviewed by #{claim.reviewedBy})
                    </div>
                  )}

                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span>Filed: {new Date(claim.createdAt).toLocaleString()}</span>
                    <button
                      onClick={() => onViewDetails(claim.itemId)}
                      className="text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      Inspect Item Report #{claim.itemId} →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: MANAGE ALL CAMPUS REPORTS */}
      {activeTab === 'items' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold tracking-wider">
                <tr>
                  <th className="p-3">ID / Title</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Reporter</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {items.map((i) => (
                  <tr key={i.id} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-900">
                      <div>{i.title}</div>
                      <span className="font-mono text-[10px] text-slate-400">#{i.id}</span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          i.type === 'lost'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {i.type}
                      </span>
                    </td>
                    <td className="p-3">{i.category}</td>
                    <td className="p-3">
                      <div>{i.location}</div>
                      <span className="text-[10px] text-slate-400">{i.buildingOrArea}</span>
                    </td>
                    <td className="p-3">
                      <div>{i.userName}</div>
                      <span className="text-[10px] text-slate-400">{i.userRole}</span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-800">
                        {i.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => onViewDetails(i.id)}
                        className="p-1.5 hover:bg-slate-200 rounded text-slate-600"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {i.status !== 'RETURNED' && (
                        <button
                          onClick={() => handleMarkReturned(i.id)}
                          className="px-2 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded text-[10px] font-bold"
                          title="Mark returned"
                        >
                          Mark Returned
                        </button>
                      )}

                      <button
                        onClick={() => setItemToDelete(i)}
                        className="p-1.5 hover:bg-rose-100 rounded text-rose-600"
                        title="Remove duplicate/fraudulent"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: AI MATCHES AUDIT */}
      {activeTab === 'matches' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches.map((m) => (
              <div
                key={m.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 font-mono">
                    Match Reference: {m.id}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-black text-blue-900">{m.score}%</span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      {m.confidenceLabel}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-rose-600 font-bold block text-[10px] uppercase">
                      Lost Item
                    </span>
                    <p className="font-semibold text-slate-900">{m.lostItemTitle}</p>
                    <span className="text-[10px] font-mono text-slate-400">#{m.lostItemId}</span>
                  </div>

                  <div>
                    <span className="text-emerald-600 font-bold block text-[10px] uppercase">
                      Found Item
                    </span>
                    <p className="font-semibold text-slate-900">{m.foundItemTitle}</p>
                    <span className="text-[10px] font-mono text-slate-400">#{m.foundItemId}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <p className="font-semibold text-slate-800">AI Corroboration Reasoning:</p>
                  <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-600">
                    {m.reasoning.reasons.map((r, idx) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CLAIM DECISION MODAL */}
      {selectedClaimForReview && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">Review Ownership Claim</h3>
                <p className="text-xs text-slate-400">
                  Claim #{selectedClaimForReview.id} • {selectedClaimForReview.itemTitle}
                </p>
              </div>
              <button
                onClick={() => setSelectedClaimForReview(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 block">Claimant's Secret Evidence:</span>
                <p className="text-slate-600 mt-1">{selectedClaimForReview.uniqueFeatureProof}</p>
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-800">Decision</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewAction('approved')}
                    className={`py-2 text-center rounded-xl font-bold border transition-colors ${
                      reviewAction === 'approved'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    Approve Claim
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewAction('rejected')}
                    className={`py-2 text-center rounded-xl font-bold border transition-colors ${
                      reviewAction === 'rejected'
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    Reject Claim
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-800">
                  Administrative Notes / Handover Instructions
                </label>
                <textarea
                  rows={3}
                  required
                  value={adminReviewNotes}
                  onChange={(e) => setAdminReviewNotes(e.target.value)}
                  placeholder={
                    reviewAction === 'approved'
                      ? 'e.g., Claim verified. Student instructed to present DigiLocker student card at Security Desk Cabin A.'
                      : 'e.g., Identifying scratch position does not match physical item found.'
                  }
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 outline-none focus:border-blue-600"
                />
              </div>

              <div className="pt-2 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setSelectedClaimForReview(null)}
                  className="px-4 py-2 font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2.5 rounded-xl font-bold bg-blue-900 text-white disabled:opacity-50"
                >
                  {submittingReview ? 'Updating Database...' : 'Finalize Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETION CONFIRMATION DIALOG */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-sm p-6 text-center space-y-4 animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Remove Campus Report?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete "#{itemToDelete.id}" ({itemToDelete.title})? This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-center space-x-2 pt-2 text-xs">
              <button
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteItem(itemToDelete.id)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold"
              >
                Yes, Delete Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
