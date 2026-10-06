import React from 'react';
import {
  X,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  MapPin,
  Calendar,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { LostFoundItem, ItemMatch } from '../types';

interface AIExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  lostItem: LostFoundItem;
  foundItem: LostFoundItem;
  match: ItemMatch;
  onInitiateClaim?: (foundItem: LostFoundItem) => void;
}

export const AIExplanationModal: React.FC<AIExplanationModalProps> = ({
  isOpen,
  onClose,
  lostItem,
  foundItem,
  match,
  onInitiateClaim,
}) => {
  if (!isOpen) return null;

  const { score, confidenceLabel, reasoning } = match;

  const getScoreColor = () => {
    if (score >= 90) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 70) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 50) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-slate-600 bg-slate-50 border-slate-200';
  };

  const getScoreBadgeColor = () => {
    if (score >= 90) return 'bg-emerald-600 text-white';
    if (score >= 70) return 'bg-blue-600 text-white';
    if (score >= 50) return 'bg-amber-600 text-white';
    return 'bg-slate-600 text-white';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-blue-600/30 border border-blue-400/30 text-amber-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold">FINDIT AI Match Analysis</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 uppercase tracking-wider">
                  Gemini Core
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Multi-attribute semantic correlation between campus reports
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Side-by-side Items Comparison Header */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            {/* Lost Item */}
            <div className="space-y-1.5 border-b sm:border-b-0 sm:border-r border-slate-200 pb-3 sm:pb-0 sm:pr-4">
              <span className="inline-flex px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-rose-100 text-rose-800">
                Reported Lost #{lostItem.id}
              </span>
              <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{lostItem.title}</h4>
              <p className="text-xs text-slate-600 line-clamp-2">{lostItem.description}</p>
              <div className="flex items-center space-x-1 text-[11px] text-slate-500 pt-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span className="truncate">{lostItem.location}</span>
              </div>
            </div>

            {/* Found Item */}
            <div className="space-y-1.5 sm:pl-2">
              <span className="inline-flex px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-emerald-100 text-emerald-800">
                Reported Found #{foundItem.id}
              </span>
              <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{foundItem.title}</h4>
              <p className="text-xs text-slate-600 line-clamp-2">{foundItem.description}</p>
              <div className="flex items-center space-x-1 text-[11px] text-slate-500 pt-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span className="truncate">{foundItem.location}</span>
              </div>
            </div>
          </div>

          {/* AI Match Score Gauge & Confidence Banner */}
          <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${getScoreColor()}`}>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-slate-200/80 flex flex-col items-center justify-center shrink-0">
                <span className="text-2xl font-black text-slate-900 leading-none">{score}%</span>
                <span className="text-[9px] uppercase font-bold text-slate-400 mt-0.5">Match</span>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${getScoreBadgeColor()}`}>
                    {confidenceLabel}
                  </span>
                  <span className="text-xs text-slate-500">AI Confidence Interval</span>
                </div>
                <p className="text-xs text-slate-700 mt-1 leading-snug">
                  {reasoning.recommendation}
                </p>
              </div>
            </div>
          </div>

          {/* Metric Breakdown Progress Grid */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Factor-by-Factor Evaluation
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-600 font-medium">Category</span>
                  <span className={`font-bold ${reasoning.categoryMatch ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {reasoning.categoryMatch ? '100% Exact' : 'Mismatch'}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className={`h-full ${reasoning.categoryMatch ? 'bg-emerald-500' : 'bg-slate-400'}`} style={{ width: reasoning.categoryMatch ? '100%' : '20%' }} />
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-600 font-medium">Color & Brand</span>
                  <span className={`font-bold ${reasoning.colorMatch ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {reasoning.colorMatch ? 'Matched' : 'Unspecified'}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className={`h-full ${reasoning.colorMatch ? 'bg-emerald-500' : 'bg-slate-400'}`} style={{ width: reasoning.colorMatch ? '90%' : '30%' }} />
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-600 font-medium">Location Proximity</span>
                  <span className="font-bold text-slate-800">{reasoning.locationProximityScore}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${reasoning.locationProximityScore}%` }} />
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-600 font-medium">Date Proximity</span>
                  <span className="font-bold text-slate-800">{reasoning.timeProximityScore}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${reasoning.timeProximityScore}%` }} />
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-600 font-medium">Semantic Similarity</span>
                  <span className="font-bold text-slate-800">{reasoning.semanticSimilarityScore}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-600 rounded-full" style={{ width: `${reasoning.semanticSimilarityScore}%` }} />
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-600 font-medium">Features / Markings</span>
                  <span className="font-bold text-slate-800">{reasoning.featureMatchScore}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-600 rounded-full" style={{ width: `${reasoning.featureMatchScore}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Explainable Reasoning Points */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Explainable AI Reasoning
            </h4>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              {reasoning.reasons.map((reason, idx) => (
                <div key={idx} className="flex items-start space-x-2 text-xs text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{reason}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Crucial Ethical / Safety Notice */}
          <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-200/80 flex items-start space-x-3 text-xs text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Human Verification Required: </span>
              <span>
                FINDIT AI identifies statistical correlations only and never automatically transfers ownership. Rightful owners must submit identifying verification questions to campus security.
              </span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Close Analysis
          </button>

          {onInitiateClaim && (
            <button
              onClick={() => {
                onClose();
                onInitiateClaim(foundItem);
              }}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-900 hover:bg-blue-800 text-white transition-all shadow-md flex items-center space-x-2"
            >
              <span>Verify & Claim This Item</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
