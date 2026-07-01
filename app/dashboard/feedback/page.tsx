"use client";

import { useState, useEffect } from "react";
import { Plus, ChevronLeft, ChevronRight, Loader, Upload, RefreshCw, AlertCircle, CheckCircle2, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import FeedbackForm from "@/components/FeedbackForm";
import FeedbackCard from "@/components/FeedbackCard";
import FeedbackFilters from "@/components/FeedbackFilters";

interface Feedback {
  id: string;
  title: string;
  description: string;
  rating: number;
  category: string;
  status: string;
  createdAt: string;
  user: { id: string; name: string; email: string } | null;
}

export default function FeedbackPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || "VIEWER";
  const isViewer = userRole === "VIEWER";

  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);

  // Ingestion states
  const [showIngest, setShowIngest] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadFeedback = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
        ...(categoryFilter && { category: categoryFilter }),
      });

      const res = await fetch(`/api/feedback?${params}`);
      const data = await res.json();

      setFeedback(data.data || []);
      setTotalPages(data.pagination?.pages || 1);
      setTotal(data.pagination?.total || 0);
    } catch (err) {
      console.error("Failed to load feedback:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, categoryFilter]);

  useEffect(() => {
    loadFeedback();
  }, [page, search, statusFilter, categoryFilter, refreshKey]);

  const handleCreateSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create feedback");
      }

      setShowForm(false);
      loadFeedback();
    } catch (err) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (data: any) => {
    if (!editingId) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/feedback/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update feedback");
      }

      setEditingId(null);
      loadFeedback();
    } catch (err) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (isViewer) return;
    if (!confirm("Are you sure you want to delete this feedback?")) return;

    setDeleteLoading(id);
    try {
      const res = await fetch(`/api/feedback/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete feedback");
      }

      loadFeedback();
    } catch (err) {
      console.error("Failed to delete feedback:", err);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleClearAll = async () => {
    if (isViewer) return;
    if (!confirm("WARNING: This will permanently delete ALL feedback in your workspace. Are you sure you want to proceed?")) return;

    setIsClearing(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to clear feedback");
      }

      loadFeedback();
    } catch (err) {
      console.error("Failed to clear feedback:", err);
      alert(err instanceof Error ? err.message : "Failed to clear feedback");
    } finally {
      setIsClearing(false);
    }
  };

  const handleEdit = (id: string) => {
    if (isViewer) return;
    setEditingId(id);
    setShowForm(true);
  };

  // CSV file reading & submission
  const handleCSVImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) return;

    setIsImporting(true);
    setImportStatus(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const res = await fetch("/api/feedback/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ csvText: text }),
        });

        const result = await res.json();
        if (!res.ok) {
          throw new Error(result.error || "Failed to import feedback CSV");
        }

        setImportStatus({
          type: result.imported > 0 ? "success" : "error",
          text: `Imported ${result.imported} rows successfully. (${result.failed} rows failed)`,
        });
        setImportErrors(result.errors || []);
        setCsvFile(null);
        if (result.imported > 0) setRefreshKey((k) => k + 1);
      } catch (err) {
        setImportStatus({
          type: "error",
          text: err instanceof Error ? err.message : "Failed to parse file",
        });
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(csvFile);
  };

  // Simulate Feed
  const handleSimulate = async () => {
    setIsSimulating(true);
    setImportStatus(null);
    try {
      const res = await fetch("/api/feedback/simulate", { method: "POST" });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Failed to run simulation");
      }
      setImportStatus({ type: "success", text: result.message });
      loadFeedback();
    } catch (err) {
      setImportStatus({
        type: "error",
        text: err instanceof Error ? err.message : "Simulation failed",
      });
    } finally {
      setIsSimulating(false);
    }
  };

  const editingFeedback = editingId
    ? feedback.find((f) => f.id === editingId)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Feedback</h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage, triage, and analyze customer feedback items ({total} total)
          </p>
        </div>
        {!isViewer && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowIngest(!showIngest)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <Upload className="h-4 w-4" />
              Ingest Data
            </button>
            <button
              onClick={() => {
                setEditingId(null);
                setShowForm(true);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              <Plus className="h-4 w-4" />
              New Feedback
            </button>
            {total > 0 && (
              <button
                onClick={handleClearAll}
                disabled={isClearing}
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 shadow-sm hover:bg-red-50 disabled:opacity-50"
              >
                {isClearing ? (
                  <Loader className="h-4 w-4 animate-spin text-red-600" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Clear All
              </button>
            )}
          </div>
        )}
      </div>

      {/* CSV & Simulation Ingest Panel */}
      {showIngest && !isViewer && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-800">Ingestion Center</h3>
          
          {importStatus && (
            <div className={`text-sm rounded-lg p-4 border ${
              importStatus.type === "success" 
                ? "bg-green-50 text-green-700 border-green-200" 
                : "bg-red-50 text-red-700 border-red-200"
            }`}>
              <div className="flex items-center gap-2">
                {importStatus.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                <span className="font-semibold">{importStatus.text}</span>
              </div>
              {importErrors.length > 0 && (
                <ul className="mt-2 ml-6 space-y-0.5 text-xs list-disc text-red-600">
                  {importErrors.slice(0, 5).map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                  {importErrors.length > 5 && <li>...and {importErrors.length - 5} more errors</li>}
                </ul>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CSV Form */}
            <form onSubmit={handleCSVImport} className="space-y-3 bg-white p-5 border border-slate-200 rounded-xl shadow-sm">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">CSV Bulk Import</label>
              <p className="text-xs text-slate-500">Provide a file with columns: <code>title</code>, <code>description</code>, and <code>rating</code>.</p>
              
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 file:cursor-pointer hover:file:bg-indigo-100"
                />
                <button
                  type="submit"
                  disabled={isImporting || !csvFile}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
                >
                  {isImporting ? <Loader className="h-4.5 w-4.5 animate-spin" /> : "Upload"}
                </button>
              </div>
            </form>

            {/* Simulation Block */}
            <div className="space-y-3 bg-white p-5 border border-slate-200 rounded-xl shadow-sm flex flex-col justify-between">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Simulation Feed</label>
                <p className="text-xs text-slate-500 mt-1">Simulate live integrations by importing 5 realistic reviews and tickets from App Store / Intercom feeds.</p>
              </div>
              <button
                onClick={handleSimulate}
                disabled={isSimulating}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 py-3.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 disabled:opacity-60"
              >
                <RefreshCw className={`h-4 w-4 ${isSimulating ? "animate-spin" : ""}`} />
                Pull simulated feed items
              </button>
            </div>
          </div>
        </div>
      )}

      <FeedbackFilters
        searchQuery={search}
        statusFilter={statusFilter}
        categoryFilter={categoryFilter}
        onSearchChange={setSearch}
        onStatusChange={setStatusFilter}
        onCategoryChange={setCategoryFilter}
      />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      ) : feedback.length > 0 ? (
        <>
          <div className="space-y-3">
            {feedback.map((item) => (
              <FeedbackCard
                key={item.id}
                {...item}
                onEdit={handleEdit}
                onDelete={handleDelete}
                showActions={!isViewer}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4">
              <div className="text-sm text-slate-600">
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-50">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-50">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white p-12 text-center">
          <p className="text-slate-600">
            {search || statusFilter || categoryFilter
              ? "No feedback matches your filters."
              : "No feedback yet. Create your first feedback to get started."}
          </p>
        </div>
      )}

      {showForm && (
        <FeedbackForm
          onSubmit={editingId ? handleEditSubmit : handleCreateSubmit}
          onClose={() => {
            setShowForm(false);
            setEditingId(null);
          }}
          initialData={
            editingFeedback
              ? {
                  title: editingFeedback.title,
                  description: editingFeedback.description,
                  rating: editingFeedback.rating,
                  category: editingFeedback.category as any,
                }
              : undefined
          }
          isLoading={isSubmitting}
        />
      )}
    </div>
  );
}
