"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getBiasBg } from "@/lib/utils";

interface Stats {
  totalTrades: number;
  openTrades: number;
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

interface WeeklyAnalysis {
  id: string;
  weekStart: string;
  htfBias: string;
  marketStructure: string;
  biasReasoning: string;
}

interface GamificationProfile {
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  level: number;
  nlpSessionsTotal: number;
  habitsCompleted: number;
}

interface HabitStats {
  total: number;
  completed: number;
  percentage: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [latestWeekly, setLatestWeekly] = useState<WeeklyAnalysis | null>(null);
  const [gamification, setGamification] = useState<GamificationProfile | null>(null);
  const [habitStats, setHabitStats] = useState<HabitStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, weeklyRes, gamRes, habitsRes] = await Promise.all([
          fetch("/api/trades/stats"),
          fetch("/api/weekly-analysis"),
          fetch("/api/gamification"),
          fetch("/api/habits"),
        ]);
        const statsData = await statsRes.json();
        const weeklyData = await weeklyRes.json();
        const gamData = await gamRes.json();
        const habitsData = await habitsRes.json();
        setStats(statsData.stats);
        if (weeklyData.analyses?.length > 0) {
          setLatestWeekly(weeklyData.analyses[0]);
        }
        if (gamData.profile) setGamification(gamData.profile);
        if (habitsData.todayStats) setHabitStats(habitsData.todayStats);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Dashboard</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Stay disciplined. Trade with the higher timeframe.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/weekly-analysis/new"
            className="bg-white/10 hover:bg-white/15 text-white px-5 py-2 rounded-full text-[13px] font-medium transition-colors"
          >
            + Weekly Analysis
          </Link>
          <Link
            href="/daily-plans/new"
            className="bg-white/10 hover:bg-white/15 text-white px-5 py-2 rounded-full text-[13px] font-medium transition-colors"
          >
            + Daily Plan
          </Link>
          <Link
            href="/journal/new"
            className="bg-white text-black hover:bg-white/90 px-5 py-2 rounded-full text-[13px] font-medium transition-colors"
          >
            + Log Trade
          </Link>
        </div>
      </div>

      {/* Coaching & Mindset Quick Access */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Gamification Summary */}
        <div className="bg-[#1c1c1e] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#ff9f0a]/15 flex items-center justify-center">
              <span className="text-[#ff9f0a] font-semibold text-sm">
                L{gamification?.level || 1}
              </span>
            </div>
            <div>
              <p className="text-white font-medium text-sm">Trader Level</p>
              <p className="text-[#ff9f0a] text-xs">
                {gamification?.totalPoints || 0} points
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-zinc-500">Streak</span>
              <p className="text-[#ff9f0a] font-semibold">{gamification?.currentStreak || 0} days</p>
            </div>
            <div>
              <span className="text-zinc-500">NLP Sessions</span>
              <p className="text-white font-semibold">{gamification?.nlpSessionsTotal || 0}</p>
            </div>
            <div>
              <span className="text-zinc-500">Habits Done</span>
              <p className="text-white font-semibold">{gamification?.habitsCompleted || 0}</p>
            </div>
          </div>
          <Link href="/habits" className="block mt-4 text-[#0a84ff] hover:text-[#409cff] text-xs font-medium">
            View Progress →
          </Link>
        </div>

        {/* Today's Habits */}
        <div className="bg-[#1c1c1e] rounded-2xl p-6">
          <p className="text-zinc-400 text-sm font-medium mb-3">Today&apos;s Habits</p>
          {habitStats && habitStats.total > 0 ? (
            <>
              <div className="flex items-end gap-2 mb-3">
                <span className={`text-3xl font-semibold ${habitStats.percentage >= 80 ? "text-[#30d158]" : habitStats.percentage >= 50 ? "text-[#ff9f0a]" : "text-zinc-400"}`}>
                  {habitStats.completed}/{habitStats.total}
                </span>
                <span className="text-zinc-500 text-sm mb-1">completed</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all ${habitStats.percentage >= 80 ? "bg-[#30d158]" : habitStats.percentage >= 50 ? "bg-[#ff9f0a]" : "bg-zinc-600"}`}
                  style={{ width: `${habitStats.percentage}%` }}
                />
              </div>
            </>
          ) : (
            <p className="text-zinc-500 text-sm">No habits set up yet</p>
          )}
          <Link href="/habits" className="block mt-4 text-[#0a84ff] hover:text-[#409cff] text-xs font-medium">
            Manage Habits →
          </Link>
        </div>

        {/* Quick NLP & Coach Access */}
        <div className="bg-[#1c1c1e] rounded-2xl p-6">
          <p className="text-zinc-400 text-sm font-medium mb-3">Quick Actions</p>
          <div className="space-y-2">
            <Link
              href="/coach"
              className="flex items-center gap-2.5 w-full bg-white/5 hover:bg-white/[0.08] text-white px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-colors"
            >
              <svg className="w-4 h-4 text-[#ff9f0a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              Talk to AI Coach
            </Link>
            <Link
              href="/nlp"
              className="flex items-center gap-2.5 w-full bg-white/5 hover:bg-white/[0.08] text-white px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-colors"
            >
              <svg className="w-4 h-4 text-[#bf5af2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              NLP Training
            </Link>
            <Link
              href="/analytics"
              className="flex items-center gap-2.5 w-full bg-white/5 hover:bg-white/[0.08] text-white px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-colors"
            >
              <svg className="w-4 h-4 text-[#0a84ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              View Analytics
            </Link>
          </div>
        </div>
      </div>

      {/* Current HTF Bias Banner */}
      {latestWeekly && (
        <div className="bg-[#1c1c1e] rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-500 text-sm mb-2">
                Current Weekly Bias
              </p>
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${getBiasBg(
                    latestWeekly.htfBias
                  )}`}
                >
                  {latestWeekly.htfBias}
                </span>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm border ${getBiasBg(
                    latestWeekly.marketStructure
                  )}`}
                >
                  {latestWeekly.marketStructure}
                </span>
              </div>
              <p className="text-zinc-400 text-sm mt-3 max-w-xl">
                {latestWeekly.biasReasoning}
              </p>
            </div>
            <Link
              href="/weekly-analysis"
              className="text-[#0a84ff] hover:text-[#409cff] text-sm"
            >
              View Details
            </Link>
          </div>
        </div>
      )}

      {!latestWeekly && (
        <div className="bg-[#1c1c1e] rounded-2xl p-6 text-center">
          <p className="text-[#ff9f0a] font-medium">No weekly analysis yet</p>
          <p className="text-zinc-500 text-sm mt-1">
            Start by creating your weekly analysis to define your HTF bias
          </p>
          <Link
            href="/weekly-analysis/new"
            className="inline-block mt-4 bg-white/10 hover:bg-white/15 text-white px-5 py-2 rounded-full text-[13px] font-medium transition-colors"
          >
            Create Weekly Analysis
          </Link>
        </div>
      )}

      {/* Discipline Score */}
      {stats && stats.totalTrades > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#1c1c1e] rounded-2xl p-6">
            <p className="text-zinc-500 text-sm mb-2">
              Discipline Score
            </p>
            <div className="flex items-end gap-2">
              <span
                className={`text-4xl font-semibold ${
                  stats.disciplineScore >= 80
                    ? "text-[#30d158]"
                    : stats.disciplineScore >= 60
                    ? "text-[#ff9f0a]"
                    : "text-[#ff453a]"
                }`}
              >
                {stats.disciplineScore}%
              </span>
              <span className="text-zinc-500 text-sm mb-1">
                trades aligned with HTF
              </span>
            </div>
            <div className="mt-3 w-full bg-white/10 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all ${
                  stats.disciplineScore >= 80
                    ? "bg-[#30d158]"
                    : stats.disciplineScore >= 60
                    ? "bg-[#ff9f0a]"
                    : "bg-[#ff453a]"
                }`}
                style={{ width: `${stats.disciplineScore}%` }}
              />
            </div>
          </div>

          <div className="bg-[#1c1c1e] rounded-2xl p-6">
            <p className="text-zinc-500 text-sm mb-2">
              Win Rate
            </p>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-semibold text-white">
                {stats.winRate}%
              </span>
              <span className="text-zinc-500 text-sm mb-1">
                {stats.wins}W / {stats.losses}L / {stats.breakeven}BE
              </span>
            </div>
          </div>

          <div className="bg-[#1c1c1e] rounded-2xl p-6">
            <p className="text-zinc-500 text-sm mb-2">
              Total P&L
            </p>
            <span
              className={`text-4xl font-semibold ${
                stats.totalPnl >= 0 ? "text-[#30d158]" : "text-[#ff453a]"
              }`}
            >
              {stats.totalPnl >= 0 ? "+" : ""}
              {stats.totalPnl}
            </span>
          </div>
        </div>
      )}

      {/* Aligned vs Counter Trend Comparison */}
      {stats && stats.totalTrades > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#1c1c1e] rounded-2xl p-6">
            <h3 className="text-sm font-medium text-[#30d158] mb-4">
              Aligned with HTF
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-zinc-500 text-xs">Trades</p>
                <p className="text-white text-xl font-semibold">{stats.alignedTrades}</p>
              </div>
              <div>
                <p className="text-zinc-500 text-xs">Win Rate</p>
                <p className="text-[#30d158] text-xl font-semibold">{stats.alignedWinRate}%</p>
              </div>
              <div>
                <p className="text-zinc-500 text-xs">P&L</p>
                <p className={`text-xl font-semibold ${stats.alignedPnl >= 0 ? "text-[#30d158]" : "text-[#ff453a]"}`}>
                  {stats.alignedPnl >= 0 ? "+" : ""}{stats.alignedPnl}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#1c1c1e] rounded-2xl p-6">
            <h3 className="text-sm font-medium text-[#ff453a] mb-4">
              Counter HTF
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-zinc-500 text-xs">Trades</p>
                <p className="text-white text-xl font-semibold">{stats.counterTrades}</p>
              </div>
              <div>
                <p className="text-zinc-500 text-xs">Win Rate</p>
                <p className="text-[#ff453a] text-xl font-semibold">{stats.counterWinRate}%</p>
              </div>
              <div>
                <p className="text-zinc-500 text-xs">P&L</p>
                <p className={`text-xl font-semibold ${stats.counterPnl >= 0 ? "text-[#30d158]" : "text-[#ff453a]"}`}>
                  {stats.counterPnl >= 0 ? "+" : ""}{stats.counterPnl}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#1c1c1e] rounded-2xl p-5">
            <p className="text-zinc-500 text-xs">Total Trades</p>
            <p className="text-2xl font-semibold text-white mt-1">{stats.totalTrades}</p>
          </div>
          <div className="bg-[#1c1c1e] rounded-2xl p-5">
            <p className="text-zinc-500 text-xs">Open Trades</p>
            <p className="text-2xl font-semibold text-[#0a84ff] mt-1">{stats.openTrades}</p>
          </div>
          <div className="bg-[#1c1c1e] rounded-2xl p-5">
            <p className="text-zinc-500 text-xs">Avg Risk:Reward</p>
            <p className="text-2xl font-semibold text-white mt-1">1:{stats.avgRiskReward}</p>
          </div>
          <div className="bg-[#1c1c1e] rounded-2xl p-5">
            <p className="text-zinc-500 text-xs">Aligned Trades</p>
            <p className="text-2xl font-semibold text-[#30d158] mt-1">
              {stats.alignedTrades}/{stats.totalTrades}
            </p>
          </div>
        </div>
      )}

      {/* Daily Checklist Reminder */}
      <div className="bg-[#1c1c1e] rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4">Daily Trading Checklist</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <Link href="/nlp" className="flex items-center gap-2.5 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/[0.08] rounded-xl px-4 py-3 transition-colors">
            <svg className="w-5 h-5 text-[#30d158]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Complete NLP exercise
          </Link>
          <Link href="/habits" className="flex items-center gap-2.5 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/[0.08] rounded-xl px-4 py-3 transition-colors">
            <svg className="w-5 h-5 text-[#30d158]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Complete daily habits
          </Link>
          <Link href="/coach" className="flex items-center gap-2.5 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/[0.08] rounded-xl px-4 py-3 transition-colors">
            <svg className="w-5 h-5 text-[#30d158]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Pre-trade coaching session
          </Link>
        </div>
      </div>

      {/* Legal Disclaimer */}
      <div className="text-center text-zinc-600 text-xs py-4 border-t border-white/[0.06]">
        <p>This application is for educational purposes only and does not constitute financial advice.</p>
        <p>Trading involves significant risk. Past performance is not indicative of future results.</p>
      </div>
    </div>
  );
}
