import React, { useEffect, useState } from 'react';
import {
  Award,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  History,
  HeartHandshake,
  Lock,
} from 'lucide-react';
import { FinderScoreProfile } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const FinderScoreView: React.FC = () => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState<FinderScoreProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUser) return;
      try {
        setLoading(true);
        const data = await api.getFinderProfile(currentUser.id);
        setProfile(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [currentUser]);

  if (loading || !profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-3">
        <div className="w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500">Loading Finder Score reputation profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-400/30">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Campus Community Integrity Model</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            The Finder Score™
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            FINDIT AI’s reputation system recognizes honest campus members who report and hand over found belongings without fostering unhealthy competition.
          </p>
        </div>

        {/* Reputation Score Card */}
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 text-center shrink-0 w-52 shadow-2xl">
          <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider block">
            Your Trust Index
          </span>
          <div className="text-5xl font-black text-white mt-1">
            {profile.finderScore}
            <span className="text-xl text-slate-300 font-normal">/100</span>
          </div>
          <div className="mt-2 text-xs font-semibold text-emerald-400 flex items-center justify-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Exemplary Citizen</span>
          </div>
        </div>
      </div>

      {/* Numerical Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Finder Score</span>
            <div className="text-2xl font-black text-slate-900">{profile.finderScore}</div>
            <span className="text-[10px] text-slate-400">Campus reputation index</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Items Successfully Returned</span>
            <div className="text-2xl font-black text-emerald-600">{profile.itemsReturnedCount}</div>
            <span className="text-[10px] text-emerald-600">Restored to rightful owners</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Verified Helpful Actions</span>
            <div className="text-2xl font-black text-blue-900">{profile.verifiedHelpfulActionsCount}</div>
            <span className="text-[10px] text-slate-400">Cooperations & handovers</span>
          </div>
        </div>
      </div>

      {/* Earned Badges Showcase */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Earned Integrity Badges</h2>
          <p className="text-xs text-slate-500">
            Recognitions verified through security desk handovers
          </p>
        </div>

        {profile.badges.length === 0 ? (
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
            No integrity badges earned yet. Restoring misplaced belongings back to verified owners unlocks recognition badges.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {profile.badges.map((b) => (
              <div
                key={b.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start space-x-3"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-xs text-slate-900">{b.title}</h4>
                  <p className="text-[11px] text-slate-500 leading-snug">{b.description}</p>
                  <span className="text-[10px] font-mono text-slate-400 block pt-1">
                    Earned: {b.earnedAt}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reputation Audit History & Ethical Guidelines Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: History Timeline */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center space-x-2">
            <History className="w-4 h-4 text-blue-900" />
            <h3 className="font-bold text-sm text-slate-900">Score Audit Log</h3>
          </div>

          <div className="divide-y divide-slate-100">
            {profile.history.map((h) => (
              <div key={h.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-slate-900">{h.action}</p>
                  <p className="text-[11px] text-slate-500">{h.reason}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-600">+{h.points} pts</span>
                  <p className="text-[10px] text-slate-400">{h.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Academic / Ethical Policy (Essential for Viva) */}
        <div className="lg:col-span-5 bg-slate-50 rounded-3xl border border-slate-200 p-6 space-y-3">
          <div className="flex items-center space-x-2 text-blue-900 font-bold text-xs uppercase tracking-wide">
            <ShieldCheck className="w-4 h-4" />
            <span>Ethical Design Philosophy</span>
          </div>

          <h4 className="font-bold text-sm text-slate-900">
            Why It’s Not a "Game"
          </h4>

          <p className="text-xs text-slate-600 leading-relaxed">
            Gamifying lost property with competitive leaderboards or material bounties can inadvertently incentivize users to hoard found items.
          </p>

          <div className="space-y-2 pt-2 text-xs text-slate-600">
            <div className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>No Public Leaderboard:</strong> Scores are individual trust indicators, avoiding competitive scavenging.
              </span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Security Verification:</strong> Points are only credited after college security records the physical handover.
              </span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Anti-Fraud Dampening:</strong> Repeated frivolous claims or suspicious patterns halt score progression.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
