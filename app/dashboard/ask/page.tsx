"use client";

import { useState } from "react";
import { Sparkles, MessageSquare, ArrowRight, Loader, Star, AlertCircle, CheckCircle2, RefreshCw, HelpCircle } from "lucide-react";

interface Citation {
  id: string;
  title: string;
  description: string;
  sentiment: string;
  rating: number;
  similarity: number;
}

export default function AskLoopPage() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [citations, setCitations] = useState<Citation[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      setIsLoading(true);
      setError(null);
      setAnswer(null);
      setCitations([]);

      const res = await fetch("/api/feedback/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to retrieve AI response");
      }

      const data = await res.json();
      setAnswer(data.answer);
      setCitations(data.citations);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const samplePrompts = [
    "What are the main bugs or system crashes reported?",
    "Show me feature requests related to onboarding.",
    "Are clients satisfied with our dashboard look and speed?",
    "Summarize what users think about our billing plans.",
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Title Header */}
      <div>
        <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm uppercase tracking-wider">
          <Sparkles className="h-4 w-4 text-indigo-500 animate-pulse" />
          <span>Semantic AI Search</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-1">Ask LOOP</h1>
        <p className="mt-2 text-sm text-slate-500">
          Query your workspace feedback database semantically. Ask questions in plain English and retrieve answers grounded in customer quotes.
        </p>
      </div>

      {/* Query Console Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <form onSubmit={handleAsk} className="flex gap-2">
          <input
            type="text"
            placeholder="Type your question about customer feedback... (e.g. What are the common login issues?)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-50"
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors disabled:bg-indigo-300 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <span>Ask AI</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Suggestion Prompts */}
        {!answer && !isLoading && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Suggested Questions</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {samplePrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => setQuery(prompt)}
                  className="text-left text-xs text-slate-600 border border-slate-200 rounded-lg p-2.5 hover:bg-indigo-50/50 hover:border-indigo-150 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Loading Status */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center p-12 space-y-4">
          <Loader className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-sm font-semibold text-slate-500">Searching embeddings & reasoning context...</p>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="rounded-xl border border-red-150 bg-red-50 p-4 text-sm text-red-700 flex items-start gap-2.5">
          <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* AI Answer & References */}
      {answer && (
        <div className="space-y-6">
          {/* Answer Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-600" />
            
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                <Sparkles className="h-4.5 w-4.5" />
              </div>
              <h3 className="font-bold text-slate-900">LOOP AI Response</h3>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
              {answer}
            </p>
          </div>

          {/* Citations / Grounded Sources */}
          {citations.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-700">Cited Feedback Sources ({citations.length})</h4>
                <span className="text-xs text-slate-400">Sorted by semantic similarity</span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {citations.map((cite, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-2 flex flex-col justify-between hover:border-slate-300 transition duration-150"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="text-sm font-bold text-slate-900 line-clamp-1">{cite.title}</h5>
                        <span className="shrink-0 inline-flex items-center rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                          Match: {Math.round(cite.similarity * 100)}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-3 mt-1.5 leading-relaxed">{cite.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < cite.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"
                            }`}
                          />
                        ))}
                      </div>

                      {cite.sentiment === "POS" && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-100">
                          <CheckCircle2 className="h-2.5 w-2.5" /> Positive
                        </span>
                      )}
                      {cite.sentiment === "NEG" && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-rose-50 px-1.5 py-0.5 text-[10px] font-semibold text-rose-700 border border-rose-100">
                          <AlertCircle className="h-2.5 w-2.5" /> Critical
                        </span>
                      )}
                      {cite.sentiment === "NEU" && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 border border-slate-200">
                          <HelpCircle className="h-2.5 w-2.5" /> Neutral
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
