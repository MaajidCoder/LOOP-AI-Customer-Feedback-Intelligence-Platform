"use client";

interface FeedbackFiltersProps {
  statusFilter: string;
  categoryFilter: string;
  searchQuery: string;
  onStatusChange: (status: string) => void;
  onCategoryChange: (category: string) => void;
  onSearchChange: (query: string) => void;
}

export default function FeedbackFilters({
  statusFilter,
  categoryFilter,
  searchQuery,
  onStatusChange,
  onCategoryChange,
  onSearchChange,
}: FeedbackFiltersProps) {
  return (
    <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
      <div>
        <label className="block text-sm font-medium text-slate-900">
          Search
        </label>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search feedback..."
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-900">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
            <option value="" className="text-slate-800 bg-white">All Statuses</option>
            <option value="NEW" className="text-slate-800 bg-white">New</option>
            <option value="REVIEW" className="text-slate-800 bg-white">In Review</option>
            <option value="RESOLVED" className="text-slate-800 bg-white">Resolved</option>
            <option value="ARCHIVED" className="text-slate-800 bg-white">Archived</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-900">
            Category
          </label>
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
            <option value="" className="text-slate-800 bg-white">All Categories</option>
            <option value="BUG" className="text-slate-800 bg-white">Bug</option>
            <option value="FEATURE" className="text-slate-800 bg-white">Feature Request</option>
            <option value="IMPROVEMENT" className="text-slate-800 bg-white">Improvement</option>
            <option value="OTHER" className="text-slate-800 bg-white">Other</option>
          </select>
        </div>
      </div>
    </div>
  );
}
