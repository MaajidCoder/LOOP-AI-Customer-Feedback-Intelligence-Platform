"use client";

import { Trash2, Edit2 } from "lucide-react";

interface FeedbackCardProps {
  id: string;
  title: string;
  description: string;
  rating: number;
  category: string;
  status: string;
  createdAt: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  showActions?: boolean;
}

const categoryColors = {
  BUG: "bg-red-50 text-red-700 ring-red-600/20",
  FEATURE: "bg-blue-50 text-blue-700 ring-blue-600/20",
  IMPROVEMENT: "bg-green-50 text-green-700 ring-green-600/20",
  OTHER: "bg-slate-50 text-slate-700 ring-slate-600/20",
};

const statusColors = {
  NEW: "bg-yellow-50 text-yellow-700 ring-yellow-600/20",
  REVIEW: "bg-blue-50 text-blue-700 ring-blue-600/20",
  RESOLVED: "bg-green-50 text-green-700 ring-green-600/20",
  ARCHIVED: "bg-slate-50 text-slate-700 ring-slate-600/20",
};

export default function FeedbackCard({
  id,
  title,
  description,
  rating,
  category,
  status,
  createdAt,
  onEdit,
  onDelete,
  showActions = true,
}: FeedbackCardProps) {
  const date = new Date(createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <h3 className="font-semibold text-slate-900">{title}</h3>
          <p className="line-clamp-2 text-sm text-slate-600">{description}</p>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${categoryColors[category as keyof typeof categoryColors] || categoryColors.OTHER}`}>
              {category}
            </span>
            <span
              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${statusColors[status as keyof typeof statusColors] || statusColors.NEW}`}>
              {status}
            </span>
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-amber-600">
                ★ {rating}/5
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-500">{date}</p>
        </div>

        {showActions && (
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(id)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700">
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(id)}
              className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
