import React, { useState } from 'react';
import {
  Upload,
  Sparkles,
  MapPin,
  Calendar,
  Clock,
  Tag,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  ArrowRight,
  Shield,
  Layers,
  User,
} from 'lucide-react';
import { LostFoundItem, ItemType, ItemMatch } from '../types';
import { ITEM_CATEGORIES, CAMPUS_LOCATIONS, COMMON_COLORS } from '../utils/constants';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface ReportItemViewProps {
  initialType?: ItemType;
  onItemReported: (item: LostFoundItem, matches: ItemMatch[]) => void;
  onCancel: () => void;
  onViewMatches: (item: LostFoundItem) => void;
}

export const ReportItemView: React.FC<ReportItemViewProps> = ({
  initialType = 'lost',
  onItemReported,
  onCancel,
  onViewMatches,
}) => {
  const { currentUser } = useAuth();

  const [type, setType] = useState<ItemType>(initialType);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>(ITEM_CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [approximateTime, setApproximateTime] = useState('14:00');
  const [selectedLocationArea, setSelectedLocationArea] = useState<string>(CAMPUS_LOCATIONS[0].area);
  const [buildingOrArea, setBuildingOrArea] = useState<string>(CAMPUS_LOCATIONS[0].zones[0]);
  const [color, setColor] = useState<string>('Black');
  const [brand, setBrand] = useState('');
  const [distinguishingFeatures, setDistinguishingFeatures] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [contactPreference, setContactPreference] = useState<'portal_only' | 'email' | 'phone'>('portal_only');

  // Reporter Identity
  const [reporterName, setReporterName] = useState(currentUser?.name || '');
  const [reporterEmail, setReporterEmail] = useState(currentUser?.email || '');
  const [reporterIdNumber, setReporterIdNumber] = useState(currentUser?.studentOrStaffId || '');
  const [reporterDept, setReporterDept] = useState(currentUser?.department || 'Computer Science & Engineering');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [completedResult, setCompletedResult] = useState<{
    item: LostFoundItem;
    matches: ItemMatch[];
  } | null>(null);

  // Available sub-zones for currently selected area
  const currentAreaZones = CAMPUS_LOCATIONS.find((l) => l.area === selectedLocationArea)?.zones || [];

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Read as base64 data URL
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !category || !selectedLocationArea) {
      setError('Please complete all required item fields.');
      return;
    }

    if (!currentUser && (!reporterName.trim() || !reporterEmail.trim())) {
      setError('Please provide your name and contact email for verification.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const result = await api.reportItem({
        type,
        title: title.trim(),
        category,
        description: description.trim(),
        date,
        approximateTime,
        location: selectedLocationArea,
        buildingOrArea,
        color,
        brand: brand.trim(),
        distinguishingFeatures: distinguishingFeatures.trim(),
        imageUrl: imageUrl.trim() || undefined,
        contactPreference,
        userId: currentUser?.id || `usr-${Date.now().toString(36)}`,
        userName: (currentUser?.name || reporterName).trim(),
        userRole: currentUser?.role || 'student',
        userDepartment: (currentUser?.department || reporterDept).trim(),
      });

      setCompletedResult(result);
      onItemReported(result.item, result.matches);
    } catch (err: any) {
      setError(err.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {completedResult ? (
        /* Submission Success & Immediate AI Match Display */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-8 space-y-6 animate-in fade-in">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              Report Successfully Filed!
            </h2>
            <p className="text-xs text-slate-500 font-mono">
              Report ID: #{completedResult.item.id}
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Item Title:</span>
              <span className="font-bold text-slate-900">{completedResult.item.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Category & Location:</span>
              <span className="text-slate-700">
                {completedResult.item.category} • {completedResult.item.location}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Status:</span>
              <span className="font-bold text-blue-900 uppercase">
                {completedResult.item.status}
              </span>
            </div>
          </div>

          {/* AI Matching Immediate Result */}
          {completedResult.matches.length > 0 ? (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center space-x-2 text-blue-950 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>
                  FINDIT AI Found {completedResult.matches.length} Potential Match(es)!
                </span>
              </div>
              <p className="text-xs text-blue-900 leading-relaxed">
                Gemini 3.8 Flash compared your report against current campus database items and detected a potential match ({completedResult.matches[0].score}% confidence).
              </p>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">
                  Top Match: {completedResult.matches[0].lostItemTitle || completedResult.matches[0].foundItemTitle}
                </span>
                <button
                  onClick={() => onViewMatches(completedResult.item)}
                  className="px-4 py-2 text-xs font-bold bg-blue-900 hover:bg-blue-800 text-white rounded-xl shadow-xs flex items-center space-x-1.5"
                >
                  <span>Inspect AI Matches</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 text-center space-y-1">
              <p className="font-semibold text-slate-800">No immediate matches found yet.</p>
              <p className="text-slate-500">
                FINDIT AI will continuously monitor new reports and notify your account if a correlation is identified.
              </p>
            </div>
          )}

          <div className="flex justify-center pt-2">
            <button
              onClick={onCancel}
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
            >
              Done / Return to Directory
            </button>
          </div>
        </div>
      ) : (
        /* Report Form */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-slate-900 text-white p-6 sm:p-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">
                Official Campus Report
              </span>
              <span className="text-xs text-slate-400">Campus Lost & Found Desk</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {type === 'lost' ? 'Report a Lost Belonging' : 'Report a Found Belonging'}
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Please provide precise details to facilitate accurate AI matching and safe recovery.
            </p>

            {/* Type Switcher Buttons */}
            <div className="grid grid-cols-2 gap-2 mt-5 bg-slate-800 p-1.5 rounded-2xl border border-slate-700">
              <button
                type="button"
                onClick={() => setType('lost')}
                className={`py-2 text-xs font-bold rounded-xl transition-all ${
                  type === 'lost'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                I Lost Something
              </button>
              <button
                type="button"
                onClick={() => setType('found')}
                className={`py-2 text-xs font-bold rounded-xl transition-all ${
                  type === 'found'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                I Found Something
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Reporter Profile Block if guest */}
            {!currentUser && (
              <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-100 space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold text-blue-950">
                  <User className="w-4 h-4 text-blue-900" />
                  <span>Reporter Identity Information</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={reporterName}
                      onChange={(e) => setReporterName(e.target.value)}
                      placeholder="e.g., Alex Johnson"
                      className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-white outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700">College Email *</label>
                    <input
                      type="email"
                      required
                      value={reporterEmail}
                      onChange={(e) => setReporterEmail(e.target.value)}
                      placeholder="alex.j@campus.edu"
                      className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-white outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700">Student / Staff ID</label>
                    <input
                      type="text"
                      value={reporterIdNumber}
                      onChange={(e) => setReporterIdNumber(e.target.value)}
                      placeholder="e.g., MU24CSE100"
                      className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-white outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700">Department</label>
                    <input
                      type="text"
                      value={reporterDept}
                      onChange={(e) => setReporterDept(e.target.value)}
                      placeholder="e.g., Information Technology"
                      className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-white outline-none focus:border-blue-600"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                1. Item Identification
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Item Title / Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Blue Water Bottle, Scientific Calculator, Leather Wallet"
                    className="w-full text-xs rounded-xl border border-slate-300 p-3 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-white outline-none cursor-pointer"
                  >
                    {ITEM_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Primary Color <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-white outline-none cursor-pointer"
                  >
                    {COMMON_COLORS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Brand / Manufacturer (Optional)
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g., Apple, Samsung, Dell, Casio, Titan"
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 outline-none focus:border-blue-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Distinguishing Markings / Stickers (Critical for AI)
                  </label>
                  <input
                    type="text"
                    value={distinguishingFeatures}
                    onChange={(e) => setDistinguishingFeatures(e.target.value)}
                    placeholder="e.g., Corner scratch, custom sticker, engraved initials"
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 outline-none focus:border-blue-600"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Full Description <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detailed description of the belonging, material, appearance, and physical condition..."
                    className="w-full text-xs rounded-xl border border-slate-300 p-3 outline-none focus:border-blue-600"
                  />
                </div>
              </div>
            </div>

            {/* Campus Spatial and Temporal Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                2. Campus Location & Timing
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Campus Zone / Area <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedLocationArea}
                    onChange={(e) => {
                      const newArea = e.target.value;
                      setSelectedLocationArea(newArea);
                      const z = CAMPUS_LOCATIONS.find((l) => l.area === newArea)?.zones[0];
                      if (z) setBuildingOrArea(z);
                    }}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-white outline-none cursor-pointer"
                  >
                    {CAMPUS_LOCATIONS.map((loc) => (
                      <option key={loc.area} value={loc.area}>
                        {loc.area}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Specific Room, Floor, or Desk
                  </label>
                  <select
                    value={buildingOrArea}
                    onChange={(e) => setBuildingOrArea(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-white outline-none cursor-pointer"
                  >
                    {currentAreaZones.map((z) => (
                      <option key={z} value={z}>
                        {z}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Date {type === 'lost' ? 'Lost' : 'Found'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 outline-none focus:border-blue-600 bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Approximate Time {type === 'lost' ? 'Misplaced' : 'Discovered'}
                  </label>
                  <input
                    type="time"
                    value={approximateTime}
                    onChange={(e) => setApproximateTime(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 outline-none focus:border-blue-600 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Photo / Visual Evidence */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                3. Photo Attachment (Optional)
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Upload Photo from Device:
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-900 hover:file:bg-blue-100 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Or Image URL:
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/photo.jpg"
                    className="w-full text-xs rounded-xl border border-slate-300 p-2.5 outline-none focus:border-blue-600"
                  />
                </div>

                {imageUrl && (
                  <div className="mt-2 relative w-36 h-24 rounded-xl overflow-hidden border border-slate-200 shadow-xs">
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            {/* Privacy & Contact Preference */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
                <Shield className="w-4 h-4 text-blue-900" />
                <span>Contact Privacy Guarantee</span>
              </div>
              <p className="text-[11px] text-slate-500">
                FINDIT AI protects your contact information. Handover coordination will happen securely through campus verification desks.
              </p>
              <div className="flex gap-4 pt-1 text-xs">
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="contactPreference"
                    checked={contactPreference === 'portal_only'}
                    onChange={() => setContactPreference('portal_only')}
                    className="text-blue-900 focus:ring-0"
                  />
                  <span className="font-medium text-slate-800">Campus Portal Handover (Recommended)</span>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className={`px-6 py-3 rounded-xl text-xs font-bold text-white transition-all shadow-md flex items-center space-x-2 ${
                  type === 'lost'
                    ? 'bg-rose-600 hover:bg-rose-500'
                    : 'bg-emerald-600 hover:bg-emerald-500'
                } disabled:opacity-50`}
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>
                  {submitting
                    ? 'Filing Report & Running AI Matching...'
                    : `Submit ${type === 'lost' ? 'Lost' : 'Found'} Report`}
                </span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
