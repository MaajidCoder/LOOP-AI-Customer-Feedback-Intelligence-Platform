"use client";

import { useState, useEffect } from "react";
import { Loader, BarChart3, TrendingUp, HelpCircle } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamically import Recharts with SSR disabled to prevent React 19 hydration issues
const ResponsiveContainer = dynamic(() => import("recharts").then((m) => m.ResponsiveContainer), { ssr: false });
const AreaChart = dynamic(() => import("recharts").then((m) => m.AreaChart), { ssr: false });
const Area = dynamic(() => import("recharts").then((m) => m.Area), { ssr: false });
const BarChart = dynamic(() => import("recharts").then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then((m) => m.Bar), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((m) => m.CartesianGrid), { ssr: false });
const Legend = dynamic(() => import("recharts").then((m) => m.Legend), { ssr: false });

interface AnalyticsData {
  totalCount: number;
  avgRating: number;
  percentNegative: number;
  newThisWeek: number;
  volumeOverTime: { date: string; count: number }[];
  sentimentBreakdown: { name: string; value: number }[];
  categoryBreakdown: { name: string; value: number }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/analytics");
        if (res.ok) {
          const result = await res.json();
          setData(result);
        }
      } catch (err) {
        console.error("Failed to load analytics metrics", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="h-10 w-10 animate-spin text-indigo-600" />
          <p className="text-sm font-semibold text-slate-500">Retrieving analytical breakdowns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Analytics</h1>
        <p className="mt-2 text-sm text-slate-500">Analyze user satisfaction trends, category splits, and issues reporting ratios.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total volume</h3>
          <p className="mt-2 text-3xl font-extrabold text-slate-900">{data?.totalCount ?? 0}</p>
          <p className="text-xs text-slate-500 mt-1">All-time database items</p>
        </div>

        {/* Metric 2 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Satisfaction Score</h3>
          <p className="mt-2 text-3xl font-extrabold text-slate-900">{data?.avgRating ?? 0} / 5.0</p>
          <div className="mt-1 flex items-center gap-1">
            <span className="text-xs font-semibold text-slate-500">Average rating index</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Critical Rate</h3>
          <p className="mt-2 text-3xl font-extrabold text-red-600">{data?.percentNegative ?? 0}%</p>
          <p className="text-xs text-slate-500 mt-1">Feedback rating ≤ 2</p>
        </div>
      </div>

      {/* Deep-dive charts */}
      <div className="space-y-6">
        {/* Trend chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-indigo-600" />
              Volume Trend Analysis
            </h3>
            <p className="text-xs text-slate-500">Granular view of user submissions over the past week</p>
          </div>
          <div className="h-80">
            {data && data.volumeOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.volumeOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip />
                  <Legend />
                  <Area
                    name="Ingested Feedbacks"
                    type="monotone"
                    dataKey="count"
                    stroke="#4f46e5"
                    strokeWidth={3}
                    fill="#e0e7ff"
                    activeDot={{ r: 8 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">No volume data to display.</div>
            )}
          </div>
        </div>

        {/* Sentiment & Category side-by-side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-emerald-600" />
                Category Distribution
              </h3>
              <p className="text-xs text-slate-500">Distribution of customer messages across tags</p>
            </div>
            <div className="h-72">
              {data && data.categoryBreakdown.some((c) => c.value > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.categoryBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">No data available.</div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-blue-600" />
                Sentiment Indices
              </h3>
              <p className="text-xs text-slate-500">Groupings of user comments by sentiment rating</p>
            </div>
            <div className="h-72">
              {data && data.sentimentBreakdown.some((s) => s.value > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.sentimentBreakdown} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" stroke="#64748b" fontSize={11} />
                    <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">No data available.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
