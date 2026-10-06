import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertCircle,
  FileText,
  KeyRound,
  Package,
  User,
} from 'lucide-react';
import { LostFoundItem, Claim } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface ClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: LostFoundItem;
  onClaimSubmitted: (claim: Claim) => void;
}

export const ClaimModal: React.FC<ClaimModalProps> = ({
  isOpen,
  onClose,
  item,
  onClaimSubmitted,
}) => {
  const { currentUser } = useAuth();

  const [claimantName, setClaimantName] = useState(currentUser?.name || '');
  const [claimantEmail, setClaimantEmail] = useState(currentUser?.email || '');
  const [claimantStudentId, setClaimantStudentId] = useState(currentUser?.studentOrStaffId || '');
  const [claimantDepartment, setClaimantDepartment] = useState(currentUser?.department || 'Engineering');

  const [uniqueFeatureProof, setUniqueFeatureProof] = useState('');
  const [itemContentsProof, setItemContentsProof] = useState('');
  const [approximatePurchaseInfo, setApproximatePurchaseInfo] = useState('');
  const [privateDescription, setPrivateDescription] = useState('');
  const [additionalEvidence, setAdditionalEvidence] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uniqueFeatureProof.trim() || !privateDescription.trim()) {
      setError('Please provide the distinguishing unique features and private description to verify ownership.');
      return;
    }

    const finalName = (currentUser?.name || claimantName).trim();
    const finalEmail = (currentUser?.email || claimantEmail).trim();
    const finalId = (currentUser?.studentOrStaffId || claimantStudentId).trim();

    if (!finalName || !finalEmail) {
      setError('Please provide your full name and college email address.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const claim = await api.submitClaim({
        itemId: item.id,
        claimantId: currentUser?.id || `claimant-${Date.now().toString(36)}`,
        claimantName: finalName,
        claimantEmail: finalEmail,
        claimantStudentId: finalId || 'CAMPUS-STUDENT',
        claimantDepartment: (currentUser?.department || claimantDepartment).trim(),
        uniqueFeatureProof: uniqueFeatureProof.trim(),
        itemContentsProof: itemContentsProof.trim() || undefined,
        approximatePurchaseInfo: approximatePurchaseInfo.trim() || undefined,
        privateDescription: privateDescription.trim(),
        additionalEvidence: additionalEvidence.trim() || undefined,
      });

      setSuccess(true);
      setTimeout(() => {
        onClaimSubmitted(claim);
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to submit claim. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-blue-600/30 border border-blue-400/30 text-blue-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Ownership Verification Claim</h3>
              <p className="text-xs text-slate-400">
                Item #{item.id} • {item.title}
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

        {/* Content */}
        {success ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Claim Submitted Successfully</h4>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Your verification details have been routed to Campus Security Administration. You will receive a notification once reviewed.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* Privacy notice banner */}
            <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100 flex items-start space-x-2.5 text-xs text-blue-950">
              <Lock className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Confidential Ownership Proof: </span>
                <span className="text-blue-900">
                  Your verification responses are encrypted and accessible exclusively by authorized campus security personnel during physical handover inspection.
                </span>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Claimant identity */}
            {currentUser ? (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                <div>
                  <span className="text-slate-500">Claimant: </span>
                  <span className="font-bold text-slate-900">{currentUser.name}</span>
                  <span className="text-slate-500"> ({currentUser.studentOrStaffId})</span>
                </div>
                <span className="text-slate-500 text-[11px]">{currentUser.department}</span>
              </div>
            ) : (
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <span className="font-bold text-slate-800 block">Claimant Identity Information</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    value={claimantName}
                    onChange={(e) => setClaimantName(e.target.value)}
                    placeholder="Your Full Name *"
                    className="w-full text-xs rounded-xl border border-slate-300 p-2 bg-white outline-none focus:border-blue-600"
                  />
                  <input
                    type="email"
                    required
                    value={claimantEmail}
                    onChange={(e) => setClaimantEmail(e.target.value)}
                    placeholder="College Email *"
                    className="w-full text-xs rounded-xl border border-slate-300 p-2 bg-white outline-none focus:border-blue-600"
                  />
                  <input
                    type="text"
                    value={claimantStudentId}
                    onChange={(e) => setClaimantStudentId(e.target.value)}
                    placeholder="Student / Staff ID"
                    className="w-full text-xs rounded-xl border border-slate-300 p-2 bg-white outline-none focus:border-blue-600"
                  />
                  <input
                    type="text"
                    value={claimantDepartment}
                    onChange={(e) => setClaimantDepartment(e.target.value)}
                    placeholder="Department"
                    className="w-full text-xs rounded-xl border border-slate-300 p-2 bg-white outline-none focus:border-blue-600"
                  />
                </div>
              </div>
            )}

            {/* Question 1: Distinguishing features */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                1. Secret / Distinguishing Marks or Serial Digits <span className="text-rose-500">*</span>
              </label>
              <p className="text-[11px] text-slate-500">
                Specific scratches, stickers, custom keychain charms, engraved initials, or serial digits not visible in public photos.
              </p>
              <textarea
                rows={2}
                required
                value={uniqueFeatureProof}
                onChange={(e) => setUniqueFeatureProof(e.target.value)}
                placeholder="e.g., A small sticker outline on top right corner, initials carved under cover."
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
              />
            </div>

            {/* Question 2: Contents inside */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                2. Internal Contents or Stored Items (If Applicable)
              </label>
              <p className="text-[11px] text-slate-500">
                For bags, wallets, pencil cases, or folders: What cards, receipts, notes, or specific items are inside?
              </p>
              <textarea
                rows={2}
                value={itemContentsProof}
                onChange={(e) => setItemContentsProof(e.target.value)}
                placeholder="e.g., College ID card, Metro smart card, blue gel pen."
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
              />
            </div>

            {/* Question 3: Private description / last known handling */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                3. Private Ownership Narrative & Circumstances <span className="text-rose-500">*</span>
              </label>
              <p className="text-[11px] text-slate-500">
                Where exactly were you seated or what were you doing when you misplaced it?
              </p>
              <textarea
                rows={2}
                required
                value={privateDescription}
                onChange={(e) => setPrivateDescription(e.target.value)}
                placeholder="e.g., I was attending the practical exam at Desk 14 in Block A around 11:30 AM."
                className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
              />
            </div>

            {/* Question 4: Purchase details / physical proof */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Approximate Purchase / Issue Date
                </label>
                <input
                  type="text"
                  value={approximatePurchaseInfo}
                  onChange={(e) => setApproximatePurchaseInfo(e.target.value)}
                  placeholder="e.g., Bought online recently"
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Available Physical Handover Proof
                </label>
                <input
                  type="text"
                  value={additionalEvidence}
                  onChange={(e) => setAdditionalEvidence(e.target.value)}
                  placeholder="e.g., DigiLocker card, original bill, box photo"
                  className="w-full text-xs rounded-xl border border-slate-300 p-2.5 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-900 hover:bg-blue-800 text-white transition-all shadow-md disabled:opacity-50 flex items-center space-x-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{submitting ? 'Encrypting & Submitting...' : 'Submit Verification Claim'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
