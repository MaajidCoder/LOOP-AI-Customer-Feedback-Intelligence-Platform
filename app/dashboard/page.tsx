"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { MessageSquare, Star, AlertTriangle, Calendar, TrendingUp, Loader, Shield, Edit, Eye, UserPlus, FileSpreadsheet, RefreshCw } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

// Dynamically import Recharts with SSR disabled to prevent React 19 hydration issues
const ResponsiveContainer = dynamic(() => import("recharts").then((m) => m.ResponsiveContainer), { ssr: false });
const AreaChart = dynamic(() => import("recharts").then((m) => m.AreaChart), { ssr: false });
const Area = dynamic(() => import("recharts").then((m) => m.Area), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const BarChart = dynamic(() => import("recharts").then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then((m) => m.Bar), { ssr: false });
const Cell = dynamic(() => import("recharts").then((m) => m.Cell), { ssr: false });
const PieChart = dynamic(() => import("recharts").then((m) => m.PieChart), { ssr: false });
const Pie = dynamic(() => import("recharts").then((m) => m.Pie), { ssr: false });

const SENTIMENT_COLORS = ["#10b981", "#64748b", "#ef4444"]; // Positive, Neutral, Negative
const CATEGORY_COLORS = ["#ef4444", "#3b82f6", "#10b981", "#8b5cf6"]; // Bugs, Features, Improvements, Other

interface AnalyticsData {
  totalCount: number;
  avgRating: number;
  percentNegative: number;
  newThisWeek: number;
  volumeOverTime: { date: string; count: number }[];
  sentimentBreakdown: { name: string; value: number }[];
  categoryBreakdown: { name: string; value: number }[];
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const userName = session?.user?.name || "User";
  const userRole = (session?.user as any)?.role || "VIEWER";

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
        console.error("Failed to load dashboard metrics", err);
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
          <p className="text-sm font-semibold text-slate-500">Generating analytics metrics...</p>
        </div>
      </div>
    );
  }

  const kpis = [
    {
      title: "Total Feedback",
      value: data?.totalCount ?? 0,
      icon: MessageSquare,
      color: "bg-indigo-50 text-indigo-600 border-indigo-100",
      description: "Total messages ingested",
    },
    {
      title: "Average Rating",
      value: `${data?.avgRating ?? 0}/5`,
      icon: Star,
      color: "bg-amber-50 text-amber-600 border-amber-100",
      description: "Overall customer satisfaction",
    },
    {
      title: "Negative Share",
      value: `${data?.percentNegative ?? 0}%`,
      icon: AlertTriangle,
      color: "bg-rose-50 text-rose-600 border-rose-100",
      description: "Ratio of critical issues",
    },
    {
      title: "New This Week",
      value: data?.newThisWeek ?? 0,
      icon: Calendar,
      color: "bg-emerald-50 text-emerald-600 border-emerald-100",
      description: "Ingested in the last 7 days",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Dynamic Role-Based Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Welcome, {userName}!
            </h1>
            {userRole === "ADMIN" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 border border-indigo-100">
                <Shield className="h-3 w-3" />
                Workspace Admin
              </span>
            )}
            {userRole === "ANALYST" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-100">
                <Edit className="h-3 w-3" />
                Feedback Analyst
              </span>
            )}
            {userRole === "VIEWER" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 border border-slate-200">
                <Eye className="h-3 w-3" />
                Viewer (Read-only)
              </span>
            )}
          </div>
          <p className="mt-2 text-sm text-slate-500">
            {userRole === "ADMIN" && "Here is your administrative command center for team access and customer intelligence."}
            {userRole === "ANALYST" && "Analyze recent submissions, upload spreadsheets, and simulate data channels below."}
            {userRole === "VIEWER" && "View customer satisfaction index reports and category trends in read-only mode."}
          </p>
        </div>

        {/* Dynamic Quick Actions Panel based on Roles */}
        <div className="flex flex-wrap gap-2">
          {userRole === "ADMIN" && (
            <>
              <Link
                href="/dashboard/settings"
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
              >
                <UserPlus className="h-4 w-4" />
                Manage Members
              </Link>
              <Link
                href="/dashboard/feedback"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
                View Inboxes
              </Link>
            </>
          )}
          {userRole === "ANALYST" && (
            <>
              <Link
                href="/dashboard/feedback"
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 transition-colors"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Ingest Data (CSV)
              </Link>
              <Link
                href="/dashboard/analytics"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
              >
                <TrendingUp className="h-4 w-4" />
                Satisfaction Trends
              </Link>
            </>
          )}
          {userRole === "VIEWER" && (
            <>
              <Link
                href="/dashboard/feedback"
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
                Browse Feedbacks
              </Link>
              <Link
                href="/dashboard/analytics"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
              >
                <TrendingUp className="h-4 w-4" />
                View Analytics
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Seeding Banner when empty */}
      {data?.totalCount === 0 && userRole !== "VIEWER" && (
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-left">
            <h3 className="text-base font-bold text-slate-900">Initialize Workspace with Sample Data</h3>
            <p className="text-sm text-slate-600">Your workspace is currently empty. Click the button to simulate and ingest customer feedback records dynamically!</p>
          </div>
          <button
            onClick={async () => {
              setIsLoading(true);
              try {
                const res = await fetch("/api/feedback/simulate", { method: "POST" });
                if (res.ok) {
                  // Force reload page to fetch fresh database metrics
                  window.location.reload();
                }
              } catch (err) {
                console.error("Failed to seed dynamic feedback", err);
              } finally {
                setIsLoading(false);
              }
            }}
            className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-500 transition duration-200 cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            Seed Sample Data
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition duration-200 flex items-center justify-between"
            >
              <div className="space-y-1">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">{kpi.title}</h3>
                <p className="text-3xl font-extrabold text-slate-900">{kpi.value}</p>
                <p className="text-xs text-slate-500">{kpi.description}</p>
              </div>
              <div className={`rounded-xl border p-3 ${kpi.color}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Volume over time */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2 flex flex-col">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900">Feedback Volume</h3>
            <p className="text-xs text-slate-500">Submissions received over the last 7 days</p>
          </div>
          <div className="h-64 flex-1">
            {data && data.volumeOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.volumeOverTime}>
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorVolume)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">No volume data to display.</div>
            )}
          </div>
        </div>

        {/* Sentiment breakdown */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900">Customer Sentiment</h3>
            <p className="text-xs text-slate-500">Distribution based on user ratings</p>
          </div>
          <div className="h-64 flex-1 relative flex items-center justify-center">
            {data && data.sentimentBreakdown.some((s) => s.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.sentimentBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {data.sentimentBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={SENTIMENT_COLORS[index % SENTIMENT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-sm text-slate-400">No sentiment data.</div>
            )}
            {/* Legend Overlay */}
            {data && data.sentimentBreakdown.some((s) => s.value > 0) && (
              <div className="absolute bottom-0 inset-x-0 flex justify-center gap-4 text-xs font-semibold text-slate-600">
                {data.sentimentBreakdown.map((s, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: SENTIMENT_COLORS[idx] }} />
                    <span>{s.name} ({s.value})</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Category breakdown */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3 flex flex-col">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900">Category Distribution</h3>
            <p className="text-xs text-slate-500">Breakdown of feedback categories in the workspace</p>
          </div>
          <div className="h-64 flex-1">
            {data && data.categoryBreakdown.some((c) => c.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.categoryBreakdown}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={50}>
                    {data.categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">No category breakdown data.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
