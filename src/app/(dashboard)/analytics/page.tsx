"use client";

import { useState, useEffect } from "react";

// ── Types ───────────────────────────────────────────────────────────────────
interface Stats {
  totalTrades: number;
  wins: number;
  losses: number;
  breakeven: number;
  winRate: number;
  totalPnl: number;
  avgRiskReward: number;
  disciplineScore: number;
  alignedTrades: number;
  counterTrades: number;
  alignedWinRate: number;
  counterWinRate: number;
  alignedPnl: number;
  counterPnl: number;
}

interface Trade {
  id: string;
  date: string;
  pair: string;
  direction: string;
  pnl: number;
  result: string;
  emotionalState: string;
  mistakes: string;
  htfAlignment: boolean;
  createdAt: string;
}

interface NlpSession {
  id: string;
  technique: string;
  createdAt: string;
}

interface GamificationData {
  profile: {
    level: number;
    totalPoints: number;
    currentStreak: number;
    longestStreak: number;
  };
  habitCompletionRate?: number;
}

// ── Constants ───────────────────────────────────────────────────────────────
const ERROR_KEYWORDS = [
  "Loss Aversion",
  "Greed",
  "Overtrading",
  "Revenge Trading",
  "FOMO",
  "Emotional Trading",
  "Confirmation Bias",
  "Impatience",
];

const EMOTIONAL_STATES = [
  { key: "CALM", label: "Calm", color: "#10b981" },
  { key: "ANXIOUS", label: "Anxious", color: "#ef4444" },
  { key: "FOMO", label: "FOMO", color: "#f59e0b" },
  { key: "REVENGE", label: "Revenge", color: "#8b5cf6" },
  { key: "CONFIDENT", label: "Confident", color: "#3b82f6" },
];

const DATE_RANGES = [
  { label: "7 Days", days: 7 },
  { label: "30 Days", days: 30 },
  { label: "90 Days", days: 90 },
];

// ── Helpers ─────────────────────────────────────────────────────────────────
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function getWeekLabel(date: string): string {
  const d = new Date(date + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [nlpSessions, setNlpSessions] = useState<NlpSession[]>([]);
  const [gamification, setGamification] = useState<GamificationData | null>(null);
  const [dateRange, setDateRange] = useState(30);
  const [loading, setLoading] = useState(true);

  // ── Fetch data ──────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [statsRes, tradesRes, nlpRes, gamRes] = await Promise.all([
          fetch("/api/trades/stats"),
          fetch("/api/trades"),
          fetch("/api/nlp-sessions"),
          fetch("/api/gamification"),
        ]);
        const statsData = await statsRes.json();
        const tradesData = await tradesRes.json();
        const nlpData = await nlpRes.json();
        const gamData = await gamRes.json();

        setStats(statsData.stats || null);
        setTrades(tradesData.trades || []);
        setNlpSessions(nlpData.sessions || []);
        setGamification(gamData || null);
      } catch (err) {
        console.error("Failed to load analytics:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ── Computed data based on date range ───────────────────────────────────
  const cutoffDate = daysAgo(dateRange);
  const filteredTrades = trades.filter(
    (t) => (t.date || t.createdAt || "").slice(0, 10) >= cutoffDate
  );

  // Win rate with trend (compare current period vs previous period)
  const prevCutoff = daysAgo(dateRange * 2);
  const prevTrades = trades.filter(
    (t) => {
      const d = (t.date || t.createdAt || "").slice(0, 10);
      return d >= prevCutoff && d < cutoffDate;
    }
  );
  const currentWinRate = filteredTrades.length > 0
    ? Math.round((filteredTrades.filter((t) => t.result === "WIN").length / filteredTrades.length) * 100)
    : 0;
  const prevWinRate = prevTrades.length > 0
    ? Math.round((prevTrades.filter((t) => t.result === "WIN").length / prevTrades.length) * 100)
    : 0;
  const winRateTrend = currentWinRate - prevWinRate;

  // Total P&L for period
  const periodPnl = filteredTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);

  // Avg Risk:Reward
  const avgRR = stats?.avgRiskReward || 0;

  // Discipline Score
  const disciplineScore = stats?.disciplineScore || 0;

  // ── Error Frequency ─────────────────────────────────────────────────────
  const errorCounts: Record<string, number> = {};
  ERROR_KEYWORDS.forEach((kw) => { errorCounts[kw] = 0; });
  filteredTrades.forEach((t) => {
    if (t.mistakes) {
      const mistakeLower = t.mistakes.toLowerCase();
      ERROR_KEYWORDS.forEach((kw) => {
        if (mistakeLower.includes(kw.toLowerCase())) {
          errorCounts[kw]++;
        }
      });
    }
  });
  const maxErrorCount = Math.max(...Object.values(errorCounts), 1);

  // ── Emotional State Distribution ────────────────────────────────────────
  const emotionCounts: Record<string, number> = {};
  EMOTIONAL_STATES.forEach((es) => { emotionCounts[es.key] = 0; });
  filteredTrades.forEach((t) => {
    if (t.emotionalState) {
      const stateUpper = t.emotionalState.toUpperCase();
      if (emotionCounts[stateUpper] !== undefined) {
        emotionCounts[stateUpper]++;
      }
    }
  });
  const emotionTotal = Object.values(emotionCounts).reduce((a, b) => a + b, 0) || 1;

  // Build conic-gradient segments
  let currentDeg = 0;
  const conicSegments: string[] = [];
  EMOTIONAL_STATES.forEach((es) => {
    const pct = (emotionCounts[es.key] / emotionTotal) * 360;
    conicSegments.push(`${es.color} ${currentDeg}deg ${currentDeg + pct}deg`);
    currentDeg += pct;
  });
  const conicGradient = conicSegments.length > 0
    ? `conic-gradient(${conicSegments.join(", ")})`
    : "conic-gradient(#1f2937 0deg 360deg)";

  // ── Weekly Performance Timeline (last 8 weeks) ─────────────────────────
  const weeklyData: { label: string; pnl: number }[] = [];
  for (let i = 7; i >= 0; i--) {
    const weekStart = daysAgo(i * 7 + 6);
    const weekEnd = daysAgo(i * 7);
    const weekTrades = trades.filter((t) => {
      const d = (t.date || t.createdAt || "").slice(0, 10);
      return d >= weekStart && d <= weekEnd;
    });
    const weekPnl = weekTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    weeklyData.push({ label: getWeekLabel(weekStart), pnl: Math.round(weekPnl * 100) / 100 });
  }
  const maxWeeklyPnl = Math.max(...weeklyData.map((w) => Math.abs(w.pnl)), 1);

  // ── NLP Sessions per technique ──────────────────────────────────────────
  const nlpTechniqueCounts: Record<string, number> = {};
  nlpSessions.forEach((s) => {
    const tech = s.technique || "Unknown";
    nlpTechniqueCounts[tech] = (nlpTechniqueCounts[tech] || 0) + 1;
  });
  const maxNlpCount = Math.max(...Object.values(nlpTechniqueCounts), 1);

  // ── Alignment Analysis ──────────────────────────────────────────────────
  const alignedTrades = filteredTrades.filter((t) => t.htfAlignment === true);
  const counterTrades = filteredTrades.filter((t) => t.htfAlignment === false);
  const alignedWR = alignedTrades.length > 0
    ? Math.round((alignedTrades.filter((t) => t.result === "WIN").length / alignedTrades.length) * 100)
    : 0;
  const counterWR = counterTrades.length > 0
    ? Math.round((counterTrades.filter((t) => t.result === "WIN").length / counterTrades.length) * 100)
    : 0;
  const alignedPnl = alignedTrades.reduce((s, t) => s + (t.pnl || 0), 0);
  const counterPnl = counterTrades.reduce((s, t) => s + (t.pnl || 0), 0);

  // ── Error Reduction Timeline ────────────────────────────────────────────
  const thisMonthCutoff = daysAgo(30);
  const lastMonthCutoff = daysAgo(60);
  const thisMonthErrors = trades.filter((t) => {
    const d = (t.date || t.createdAt || "").slice(0, 10);
    return d >= thisMonthCutoff && t.mistakes && t.mistakes.trim().length > 0;
  }).length;
  const lastMonthErrors = trades.filter((t) => {
    const d = (t.date || t.createdAt || "").slice(0, 10);
    return d >= lastMonthCutoff && d < thisMonthCutoff && t.mistakes && t.mistakes.trim().length > 0;
  }).length;
  const errorChange = lastMonthErrors > 0
    ? Math.round(((thisMonthErrors - lastMonthErrors) / lastMonthErrors) * 100)
    : 0;

  // ── Render ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-400">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Trading Analytics</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Deep insights into your trading performance and psychology
          </p>
        </div>
        <div className="flex items-center gap-2">
          {DATE_RANGES.map((dr) => (
            <button
              key={dr.days}
              onClick={() => setDateRange(dr.days)}
              className={`px-5 py-2 rounded-full text-[13px] font-medium transition-colors ${
                dateRange === dr.days
                  ? "bg-white text-black"
                  : "bg-white/10 text-zinc-400 hover:bg-white/15"
              }`}
            >
              {dr.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Performance Overview (4 cards) ──────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Win Rate */}
        <div className="bg-[#1c1c1e] rounded-2xl p-6">
          <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-2">Win Rate</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-white">{currentWinRate}%</span>
            {winRateTrend !== 0 && (
              <span className={`text-sm font-medium flex items-center ${winRateTrend > 0 ? "text-[#30d158]" : "text-[#ff453a]"}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 ${winRateTrend < 0 ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                </svg>
                {Math.abs(winRateTrend)}%
              </span>
            )}
          </div>
          <p className="text-zinc-500 text-xs mt-1">
            {filteredTrades.filter((t) => t.result === "WIN").length}W / {filteredTrades.filter((t) => t.result === "LOSS").length}L
          </p>
        </div>

        {/* Total P&L */}
        <div className="bg-[#1c1c1e] rounded-2xl p-6">
          <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-2">Total P&amp;L</p>
          <span className={`text-3xl font-bold ${periodPnl >= 0 ? "text-[#30d158]" : "text-[#ff453a]"}`}>
            {periodPnl >= 0 ? "+" : ""}{Math.round(periodPnl * 100) / 100}
          </span>
          <p className="text-zinc-500 text-xs mt-1">{filteredTrades.length} trades</p>
        </div>

        {/* Avg R:R */}
        <div className="bg-[#1c1c1e] rounded-2xl p-6">
          <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-2">Avg Risk:Reward</p>
          <span className="text-3xl font-bold text-white">1:{avgRR}</span>
          <p className="text-zinc-500 text-xs mt-1">target ratio</p>
        </div>

        {/* Discipline Score */}
        <div className="bg-[#1c1c1e] rounded-2xl p-6">
          <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-2">Discipline Score</p>
          <span className={`text-3xl font-bold ${
            disciplineScore >= 80 ? "text-[#30d158]" : disciplineScore >= 60 ? "text-[#ff9f0a]" : "text-[#ff453a]"
          }`}>
            {disciplineScore}%
          </span>
          <p className="text-zinc-500 text-xs mt-1">HTF alignment</p>
        </div>
      </div>

      {/* ── Error Frequency Chart ───────────────────────────────────────── */}
      <div className="bg-[#1c1c1e] rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-white tracking-tight mb-6">Error Frequency</h2>
        <div className="space-y-3">
          {ERROR_KEYWORDS.map((kw) => {
            const count = errorCounts[kw];
            const pct = (count / maxErrorCount) * 100;
            return (
              <div key={kw} className="flex items-center gap-3">
                <span className="text-sm text-zinc-400 w-40 flex-shrink-0 text-right">{kw}</span>
                <div className="flex-1 bg-white/10 rounded-full h-6 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#ff453a]/60 flex items-center justify-end pr-2 transition-all duration-500"
                    style={{ width: `${Math.max(pct, count > 0 ? 8 : 0)}%` }}
                  >
                    {count > 0 && (
                      <span className="text-xs text-white font-medium">{count}</span>
                    )}
                  </div>
                </div>
                {count === 0 && <span className="text-xs text-zinc-600 w-6">0</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Emotional State Distribution & Weekly Timeline ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Emotional State Pie */}
        <div className="bg-[#1c1c1e] rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white tracking-tight mb-6">Emotional State Distribution</h2>
          <div className="flex flex-col items-center gap-6">
            <div
              className="w-48 h-48 rounded-full border-4 border-white/10"
              style={{ background: conicGradient }}
            />
            <div className="flex flex-wrap justify-center gap-4">
              {EMOTIONAL_STATES.map((es) => {
                const count = emotionCounts[es.key];
                const pct = emotionTotal > 0 ? Math.round((count / emotionTotal) * 100) : 0;
                return (
                  <div key={es.key} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: es.color }} />
                    <span className="text-sm text-zinc-400">{es.label}</span>
                    <span className="text-sm text-zinc-500">({pct}%)</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Weekly Performance Timeline */}
        <div className="bg-[#1c1c1e] rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white tracking-tight mb-6">Weekly Performance</h2>
          <div className="flex items-end gap-2 h-48">
            {weeklyData.map((week, i) => {
              const barHeight = maxWeeklyPnl > 0 ? (Math.abs(week.pnl) / maxWeeklyPnl) * 100 : 0;
              const isPositive = week.pnl >= 0;
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                  <div className="flex-1 flex items-end w-full justify-center">
                    <div
                      className={`w-full max-w-8 rounded-t-md transition-all duration-500 ${
                        isPositive ? "bg-[#30d158]/80" : "bg-[#ff453a]/80"
                      }`}
                      style={{ height: `${Math.max(barHeight, week.pnl !== 0 ? 4 : 1)}%` }}
                      title={`${week.label}: ${week.pnl >= 0 ? "+" : ""}${week.pnl}`}
                    />
                  </div>
                  <span className="text-[10px] text-zinc-500 mt-2 truncate w-full text-center">{week.label}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-zinc-500">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-[#30d158]/80" />
              <span>Positive</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-[#ff453a]/80" />
              <span>Negative</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── NLP & Habit Progress ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* NLP Sessions per Technique */}
        <div className="bg-[#1c1c1e] rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white tracking-tight mb-6">NLP Sessions by Technique</h2>
          {Object.keys(nlpTechniqueCounts).length === 0 ? (
            <p className="text-zinc-500 text-sm">No NLP sessions recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(nlpTechniqueCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([technique, count]) => {
                  const pct = (count / maxNlpCount) * 100;
                  return (
                    <div key={technique} className="flex items-center gap-3">
                      <span className="text-sm text-zinc-400 w-28 flex-shrink-0 text-right capitalize">{technique}</span>
                      <div className="flex-1 bg-white/10 rounded-full h-5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-white/40 flex items-center justify-end pr-2 transition-all duration-500"
                          style={{ width: `${Math.max(pct, 8)}%` }}
                        >
                          <span className="text-xs text-white font-medium">{count}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Habit & Streak Progress */}
        <div className="bg-[#1c1c1e] rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white tracking-tight mb-6">Habit &amp; Streak Progress</h2>
          <div className="space-y-6">
            {/* Habit completion rate */}
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-zinc-400">Habit Completion Rate (30 days)</span>
                <span className="text-[#ff9f0a] font-medium">
                  {gamification?.habitCompletionRate != null ? `${gamification.habitCompletionRate}%` : "N/A"}
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3">
                <div
                  className="bg-[#ff9f0a] h-3 rounded-full transition-all duration-500"
                  style={{ width: `${gamification?.habitCompletionRate || 0}%` }}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <div className="text-[#ff9f0a] mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-white">{gamification?.profile?.currentStreak || 0}</p>
                <p className="text-zinc-500 text-xs">Current Streak</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <div className="text-[#ff9f0a] mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-white">{gamification?.profile?.longestStreak || 0}</p>
                <p className="text-zinc-500 text-xs">Longest Streak</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <div className="text-[#ff9f0a] mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-white">{gamification?.profile?.totalPoints || 0}</p>
                <p className="text-zinc-500 text-xs">Total Points</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <div className="text-[#ff9f0a] mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-white">Lv.{gamification?.profile?.level || 1}</p>
                <p className="text-zinc-500 text-xs">Current Level</p>
              </div>
            </div>

            {/* NLP total */}
            <div className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 text-sm">Total NLP Sessions</span>
                <span className="text-[#ff9f0a] font-bold text-lg">{nlpSessions.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Alignment Analysis ──────────────────────────────────────────── */}
      <div className="bg-[#1c1c1e] rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-white tracking-tight mb-6">Alignment Analysis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Aligned */}
          <div className="bg-[#1c1c1e] rounded-2xl p-6 border border-white/[0.06]">
            <div className="flex items-center gap-2 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#30d158]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <h3 className="text-lg font-semibold text-[#30d158]">Aligned with HTF</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Trades</p>
                <p className="text-white text-2xl font-bold">{alignedTrades.length}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Win Rate</p>
                <p className="text-[#30d158] text-2xl font-bold">{alignedWR}%</p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">P&amp;L</p>
                <p className={`text-2xl font-bold ${alignedPnl >= 0 ? "text-[#30d158]" : "text-[#ff453a]"}`}>
                  {alignedPnl >= 0 ? "+" : ""}{Math.round(alignedPnl * 100) / 100}
                </p>
              </div>
            </div>
          </div>

          {/* Counter */}
          <div className="bg-[#1c1c1e] rounded-2xl p-6 border border-white/[0.06]">
            <div className="flex items-center gap-2 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#ff453a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <h3 className="text-lg font-semibold text-[#ff453a]">Counter HTF</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Trades</p>
                <p className="text-white text-2xl font-bold">{counterTrades.length}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Win Rate</p>
                <p className="text-[#ff453a] text-2xl font-bold">{counterWR}%</p>
              </div>
              <div>
                <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">P&amp;L</p>
                <p className={`text-2xl font-bold ${counterPnl >= 0 ? "text-[#30d158]" : "text-[#ff453a]"}`}>
                  {counterPnl >= 0 ? "+" : ""}{Math.round(counterPnl * 100) / 100}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Error Reduction Timeline ───────────────────────────────────── */}
      <div className="bg-[#1c1c1e] rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-white tracking-tight mb-4">Error Reduction Timeline</h2>
        <p className="text-zinc-400 text-sm mb-6">Comparing trading errors this month vs. last month</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white/5 rounded-xl p-5 text-center">
            <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1">This Month</p>
            <p className="text-3xl font-bold text-white">{thisMonthErrors}</p>
            <p className="text-zinc-500 text-xs">trades with errors</p>
          </div>
          <div className="bg-white/5 rounded-xl p-5 text-center">
            <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1">Last Month</p>
            <p className="text-3xl font-bold text-white">{lastMonthErrors}</p>
            <p className="text-zinc-500 text-xs">trades with errors</p>
          </div>
          <div className="bg-white/5 rounded-xl p-5 text-center">
            <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-1">Change</p>
            <div className="flex items-center justify-center gap-2">
              {errorChange !== 0 && (
                <svg xmlns="http://www.w3.org/2000/svg" className={`w-5 h-5 ${errorChange < 0 ? "text-[#30d158]" : "text-[#ff453a] rotate-180"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                </svg>
              )}
              <span className={`text-3xl font-bold ${
                errorChange < 0 ? "text-[#30d158]" : errorChange > 0 ? "text-[#ff453a]" : "text-zinc-400"
              }`}>
                {errorChange === 0 ? "0" : `${Math.abs(errorChange)}%`}
              </span>
            </div>
            <p className={`text-xs mt-1 ${errorChange < 0 ? "text-[#30d158]" : errorChange > 0 ? "text-[#ff453a]" : "text-zinc-500"}`}>
              {errorChange < 0 ? "Improving!" : errorChange > 0 ? "Needs attention" : "No change"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
