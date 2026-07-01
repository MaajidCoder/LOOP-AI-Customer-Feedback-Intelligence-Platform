"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { FileText, Sparkles, PlusCircle, Loader, User, Calendar, Quote, CheckSquare, ChevronRight, AlertCircle, ArrowLeft } from "lucide-react";

interface Report {
  id: string;
  title: string;
  periodStart: string;
  periodEnd: string;
  contentJson: string;
  generatedBy?: { name: string };
  createdAt: string;
}

export default function ReportsPage() {
  const { data: session } = useSession();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const userRole = (session?.user as any)?.role || "VIEWER";
  const isViewer = userRole === "VIEWER";

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/reports");
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (err) {
      console.error("Failed to load reports:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleGenerateReport = async () => {
    if (isViewer) return;

    try {
      setIsGenerating(true);
      setError(null);

      const res = await fetch("/api/reports", {
        method: "POST",
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to generate AI report");
      }

      const newReport = await res.json();
      setReports((prev) => [newReport, ...prev]);
      setSelectedReport(newReport); // Auto-open new report
    } catch (err: any) {
      setError(err.message || "An error occurred during report generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper to parse content JSON safely
  const parseReportContent = (contentJson: string) => {
    try {
      return JSON.parse(contentJson);
    } catch (e) {
      return {
        summary: "Error parsing report content summary.",
        themes: [],
        quotes: [],
        actions: [],
      };
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Voice of Customer Reports</h1>
          <p className="mt-2 text-sm text-slate-500">
            Generate and browse weekly AI summaries synthesized from customer feedback entries in your active workspace.
          </p>
        </div>
        {!isViewer && (
          <button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors disabled:bg-indigo-300 disabled:cursor-not-allowed shrink-0"
          >
            {isGenerating ? (
              <>
                <Loader className="h-4.5 w-4.5 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <PlusCircle className="h-4.5 w-4.5" />
                <span>Generate Weekly Summary</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Error alert banner */}
      {error && (
        <div className="rounded-xl border border-red-150 bg-red-50 p-4 text-sm text-red-700 flex items-start gap-2.5">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
          <div className="space-y-1">
            <p className="font-bold">Generation Blocked</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Dual Layout: Report List & Detail Viewer */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Side: Report List */}
        <div className={`space-y-4 lg:col-span-1 ${selectedReport ? "hidden lg:block" : "block"}`}>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Reports Log</h3>

          {isLoading ? (
            <div className="flex justify-center p-12">
              <Loader className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : reports.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
              <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-400">No reports generated yet</p>
              {!isViewer && (
                <p className="text-xs text-slate-500 mt-1">Click the button above to synthesize your first weekly report.</p>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm divide-y divide-slate-100">
              {reports.map((report) => (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className={`w-full text-left p-4 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 ${
                    selectedReport?.id === report.id ? "bg-slate-50 border-r-4 border-indigo-600" : ""
                  }`}
                >
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate">{report.title}</h4>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                      {report.generatedBy && (
                        <span className="flex items-center gap-1 truncate">
                          <User className="h-3 w-3" />
                          {report.generatedBy.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side / Mobile Modal: Detail Viewer */}
        <div className={`lg:col-span-2 space-y-6 ${selectedReport ? "block" : "hidden lg:block bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center p-12 text-slate-400 text-center"}`}>
          {selectedReport ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6 relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />

              {/* Mobile Back Button */}
              <button
                onClick={() => setSelectedReport(null)}
                className="lg:hidden flex items-center gap-1 text-xs text-indigo-600 font-semibold mb-4"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to log
              </button>

              {/* Detail Header */}
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900">{selectedReport.title}</h2>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1.5">
                    <span>Generated on {new Date(selectedReport.createdAt).toLocaleString()}</span>
                    {selectedReport.generatedBy && (
                      <span>by {selectedReport.generatedBy.name}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Render Report Sections */}
              {(() => {
                const content = parseReportContent(selectedReport.contentJson);
                return (
                  <div className="space-y-6">
                    {/* Executive Summary */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-indigo-500" />
                        Executive Summary
                      </h4>
                      <p className="text-sm text-slate-600 leading-relaxed bg-indigo-50/20 rounded-xl p-4 border border-indigo-50/40">
                        {content.summary}
                      </p>
                    </div>

                    {/* Key Themes List */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="h-4 w-4 text-purple-500" />
                        Dominant Themes
                      </h4>
                      <ul className="grid gap-2 sm:grid-cols-2">
                        {content.themes.map((theme: string, idx: number) => (
                          <li key={idx} className="text-xs text-slate-600 bg-slate-50 border border-slate-100 rounded-lg p-3">
                            {theme}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Customer Quotes */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Quote className="h-4 w-4 text-emerald-500" />
                        Verbatim Highlights
                      </h4>
                      <div className="space-y-2.5">
                        {content.quotes.map((quote: string, idx: number) => (
                          <blockquote key={idx} className="text-xs italic text-slate-500 border-l-2 border-slate-200 pl-3.5 py-0.5">
                            "{quote}"
                          </blockquote>
                        ))}
                      </div>
                    </div>

                    {/* Action Items */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckSquare className="h-4 w-4 text-rose-500" />
                        Recommended Actions
                      </h4>
                      <ul className="space-y-2">
                        {content.actions.map((action: string, idx: number) => (
                          <li key={idx} className="text-xs text-slate-700 flex items-start gap-2 bg-rose-50/10 border border-rose-100/30 rounded-lg p-2.5">
                            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-rose-50 font-bold text-[10px] text-rose-600 mt-0.5">
                              {idx + 1}
                            </span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-12 text-slate-400 text-center">
              <FileText className="h-12 w-12 mx-auto mb-3" />
              <p className="font-bold text-sm">No report selected</p>
              <p className="text-xs mt-1">Select a report from the log list on the left to read its AI insights.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
