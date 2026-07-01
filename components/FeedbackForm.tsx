"use client";

import { useState } from "react";
import { X, Bug, Lightbulb, Zap, MoreHorizontal, Star, AlertCircle } from "lucide-react";

interface FeedbackFormProps {
  onSubmit: (data: {
    title: string;
    description: string;
    rating: number;
    category: "BUG" | "FEATURE" | "IMPROVEMENT" | "OTHER";
  }) => Promise<void>;
  onClose: () => void;
  initialData?: {
    title: string;
    description: string;
    rating: number;
    category: "BUG" | "FEATURE" | "IMPROVEMENT" | "OTHER";
  };
  isLoading?: boolean;
}

const CATEGORIES: {
  value: "BUG" | "FEATURE" | "IMPROVEMENT" | "OTHER";
  label: string;
  icon: React.ElementType;
  color: string;
  activeColor: string;
}[] = [
  {
    value: "BUG",
    label: "Bug",
    icon: Bug,
    color: "border-red-200 text-red-600 bg-red-50 hover:bg-red-100",
    activeColor: "border-red-500 bg-red-500 text-white shadow-red-200 shadow-md",
  },
  {
    value: "FEATURE",
    label: "Feature",
    icon: Lightbulb,
    color: "border-violet-200 text-violet-600 bg-violet-50 hover:bg-violet-100",
    activeColor: "border-violet-500 bg-violet-500 text-white shadow-violet-200 shadow-md",
  },
  {
    value: "IMPROVEMENT",
    label: "Improvement",
    icon: Zap,
    color: "border-amber-200 text-amber-600 bg-amber-50 hover:bg-amber-100",
    activeColor: "border-amber-500 bg-amber-500 text-white shadow-amber-200 shadow-md",
  },
  {
    value: "OTHER",
    label: "Other",
    icon: MoreHorizontal,
    color: "border-slate-200 text-slate-600 bg-slate-50 hover:bg-slate-100",
    activeColor: "border-slate-500 bg-slate-600 text-white shadow-slate-200 shadow-md",
  },
];

const RATING_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: "Very Poor", color: "text-red-500" },
  2: { label: "Poor", color: "text-orange-500" },
  3: { label: "Average", color: "text-amber-500" },
  4: { label: "Good", color: "text-lime-600" },
  5: { label: "Excellent", color: "text-emerald-500" },
};

export default function FeedbackForm({
  onSubmit,
  onClose,
  initialData,
  isLoading = false,
}: FeedbackFormProps) {
  const [formData, setFormData] = useState(
    initialData || {
      title: "",
      description: "",
      rating: 3,
      category: "OTHER" as const,
    },
  );
  const [error, setError] = useState<string | null>(null);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }

    if (!formData.description.trim()) {
      setError("Description is required");
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const displayRating = hoveredStar ?? formData.rating;
  const ratingInfo = RATING_LABELS[displayRating];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(15,23,42,0.6)", backdropFilter: "blur(6px)" }}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden"
        style={{ animation: "modalPop 0.22s cubic-bezier(0.34,1.56,0.64,1)" }}
      >
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {initialData ? "Edit Feedback" : "New Feedback"}
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {initialData ? "Update the details below" : "Share your thoughts with the team"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">
          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-3 focus:ring-indigo-500/15"
              placeholder="e.g. App crashes on login"
            />
          </div>

          {/* Category chips */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Category</label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map(({ value, label, icon: Icon, color, activeColor }) => {
                const isActive = formData.category === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: value })}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-semibold transition-all duration-150 cursor-pointer ${
                      isActive ? activeColor : color
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-3 focus:ring-indigo-500/15 resize-none"
              placeholder="Describe the issue, feature idea, or improvement in detail..."
            />
          </div>

          {/* Star Rating */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-slate-700">Rating</label>
              <span className={`text-xs font-semibold transition-colors ${ratingInfo.color}`}>
                {ratingInfo.label}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(null)}
                  onClick={() => setFormData({ ...formData, rating: star })}
                  className="transition-transform hover:scale-110 cursor-pointer"
                >
                  <Star
                    className={`h-8 w-8 transition-colors duration-100 ${
                      star <= displayRating
                        ? "fill-amber-400 text-amber-400"
                        : "fill-slate-100 text-slate-200"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 transition-all duration-150 cursor-pointer"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                  </svg>
                  Saving...
                </span>
              ) : (
                initialData ? "Save Changes" : "Submit Feedback"
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes modalPop {
          from { opacity: 0; transform: scale(0.92) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
