import React from 'react';
import { Compass, ShieldCheck, Mail, Phone, MapPin, Sparkles, ExternalLink } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
  onOpenReport: (type: 'lost' | 'found') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenReport }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          {/* Brand info */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">FINDIT AI</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Centralized AI-powered Lost & Found digital infrastructure for colleges and universities. Eliminating manual lost logs through intelligent semantic matching.
            </p>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 text-[11px] border border-slate-700">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Powered by Gemini 3.8 Flash</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Portal Access
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-white transition-colors"
                >
                  Campus Homepage
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('browse')}
                  className="hover:text-white transition-colors"
                >
                  Browse Lost & Found Directory
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenReport('lost')}
                  className="text-rose-400 hover:text-rose-300 transition-colors"
                >
                  Report a Lost Item
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenReport('found')}
                  className="text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Report a Found Item
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('finder-score')}
                  className="hover:text-white transition-colors"
                >
                  Finder Score & Integrity Model
                </button>
              </li>
            </ul>
          </div>

          {/* Campus Support & Physical Handover */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Physical Verification Hub
            </h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>Central Security Room, Ground Floor Admin Block A</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Campus Helpline: +91 (0281) 7123456 (Ext. 204)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span>lostandfound@marwadiuniversity.ac.in</span>
              </div>
              <p className="text-[11px] text-slate-500 pt-1">
                Office Hours: Monday – Saturday (8:30 AM to 5:30 PM)
              </p>
            </div>
          </div>

          {/* Academic IPE Note & Trust */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Academic Project & Trust
            </h4>
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 text-[11px] space-y-1.5">
              <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Strict Ownership Privacy</span>
              </div>
              <p className="text-slate-400 leading-tight">
                Private serial codes, detailed descriptions, and claimant answers are protected and only reviewed by authorized personnel to deter fraud.
              </p>
            </div>
            <p className="text-[10px] text-slate-500">
              Semester 3 CSE (AI/ML) Integrated Practical Experience (IPE) Project.
            </p>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 FINDIT AI — Marwadi University Campus Edition. All rights reserved.</p>
          <div className="flex items-center space-x-4 mt-2 sm:mt-0 text-[11px]">
            <span>Lost it? FINDIT.</span>
            <span>•</span>
            <span className="text-slate-400">Explainable AI Matching Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
