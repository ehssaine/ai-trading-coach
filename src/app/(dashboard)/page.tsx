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
        <div style={{ color: '#4A5568' }}>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#E8ECF1]" style={{ letterSpacing: '-0.02em' }}>Dashboard</h1>
          <p className="font-body text-sm mt-1" style={{ color: '#7A8BA7' }}>
            Stay disciplined. Trade with the higher timeframe.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/weekly-analysis/new"
            className="font-body rounded-lg px-5 py-2.5 text-sm font-semibold transition-all duration-200 hover:border-[#00D4AA]/30"
            style={{ border: '1px solid rgba(0,212,170,0.3)', color: '#00D4AA' }}
          >
            + Weekly Analysis
          </Link>
          <Link
            href="/daily-plans/new"
            className="font-body rounded-lg px-5 py-2.5 text-sm font-semibold transition-all duration-200 hover:border-[#00D4AA]/30"
            style={{ border: '1px solid rgba(0,212,170,0.3)', color: '#00D4AA' }}
          >
            + Daily Plan
          </Link>
          <Link
            href="/journal/new"
            className="font-body text-white font-semibold rounded-lg px-5 py-2.5 text-sm transition-all duration-200"
            style={{ background: 'linear-gradient(135deg, #00D4AA 0%, #3B82F6 100%)' }}
          >
            + Log Trade
          </Link>
        </div>
      </div>

      {/* Coaching & Mindset Quick Access */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Gamification Summary */}
        <div className="rounded-xl p-6 hover:border-[#00D4AA]/30 transition-all duration-200" style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.15)' }}>
              <span className="font-mono text-[#F59E0B] font-semibold text-sm">
                L{gamification?.level || 1}
              </span>
            </div>
            <div>
              <p className="font-body text-sm font-medium" style={{ color: '#E8ECF1' }}>Trader Level</p>
              <p className="font-mono text-[#F59E0B] text-xs">
                {gamification?.totalPoints || 0} points
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-body">
            <div>
              <span style={{ color: '#4A5568' }}>Streak</span>
              <p className="font-mono text-[#F59E0B] font-semibold">{gamification?.currentStreak || 0} days</p>
            </div>
            <div>
              <span style={{ color: '#4A5568' }}>NLP Sessions</span>
              <p className="font-mono font-semibold" style={{ color: '#E8ECF1' }}>{gamification?.nlpSessionsTotal || 0}</p>
            </div>
            <div>
              <span style={{ color: '#4A5568' }}>Habits Done</span>
              <p className="font-mono font-semibold" style={{ color: '#E8ECF1' }}>{gamification?.habitsCompleted || 0}</p>
            </div>
          </div>
          <Link href="/habits" className="block mt-4 text-[#3B82F6] hover:text-[#60A5FA] text-xs font-medium">
            View Progress →
          </Link>
        </div>

        {/* Today's Habits */}
        <div className="rounded-xl p-6 hover:border-[#00D4AA]/30 transition-all duration-200" style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="font-body text-sm font-medium mb-3" style={{ color: '#7A8BA7' }}>Today&apos;s Habits</p>
          {habitStats && habitStats.total > 0 ? (
            <>
              <div className="flex items-end gap-2 mb-3">
                <span className={`font-mono text-3xl font-semibold ${habitStats.percentage >= 80 ? "text-[#00D4AA]" : habitStats.percentage >= 50 ? "text-[#F59E0B]" : ""}`} style={habitStats.percentage < 50 ? { color: '#7A8BA7' } : undefined}>
                  {habitStats.completed}/{habitStats.total}
                </span>
                <span className="font-body text-sm mb-1" style={{ color: '#4A5568' }}>completed</span>
              </div>
              <div className="w-full rounded-full h-1.5" style={{ background: '#1A1F2E' }}>
                <div
                  className={`h-1.5 rounded-full transition-all ${habitStats.percentage >= 80 ? "bg-[#00D4AA]" : habitStats.percentage >= 50 ? "bg-[#F59E0B]" : "bg-[#4A5568]"}`}
                  style={{ width: `${habitStats.percentage}%` }}
                />
              </div>
            </>
          ) : (
            <p className="font-body text-sm" style={{ color: '#4A5568' }}>No habits set up yet</p>
          )}
          <Link href="/habits" className="block mt-4 text-[#3B82F6] hover:text-[#60A5FA] text-xs font-medium">
            Manage Habits →
          </Link>
        </div>

        {/* Quick NLP & Coach Access */}
        <div className="rounded-xl p-6 hover:border-[#00D4AA]/30 transition-all duration-200" style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="font-body text-sm font-medium mb-3" style={{ color: '#7A8BA7' }}>Quick Actions</p>
          <div className="space-y-2">
            <Link
              href="/coach"
              className="flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 hover:border-[#8B5CF6]/30"
              style={{ background: '#1A1F2E', border: '1px solid rgba(255,255,255,0.06)', color: '#E8ECF1' }}
            >
              <svg className="w-4 h-4 text-[#8B5CF6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              Talk to AI Coach
            </Link>
            <Link
              href="/nlp"
              className="flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 hover:border-[#8B5CF6]/30"
              style={{ background: '#1A1F2E', border: '1px solid rgba(255,255,255,0.06)', color: '#E8ECF1' }}
            >
              <svg className="w-4 h-4 text-[#8B5CF6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              NLP Training
            </Link>
            <Link
              href="/analytics"
              className="flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 hover:border-[#3B82F6]/30"
              style={{ background: '#1A1F2E', border: '1px solid rgba(255,255,255,0.06)', color: '#E8ECF1' }}
            >
              <svg className="w-4 h-4 text-[#3B82F6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              View Analytics
            </Link>
          </div>
        </div>
      </div>

      {/* Current HTF Bias Banner */}
      {latestWeekly && (
        <div className="rounded-xl p-6" style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-body text-xs font-medium uppercase tracking-wider mb-2" style={{ color: '#4A5568' }}>
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
              <p className="font-body text-sm mt-3 max-w-xl" style={{ color: '#7A8BA7' }}>
                {latestWeekly.biasReasoning}
              </p>
            </div>
            <Link
              href="/weekly-analysis"
              className="text-[#3B82F6] hover:text-[#60A5FA] text-sm transition-colors"
            >
              View Details
            </Link>
          </div>
        </div>
      )}

      {!latestWeekly && (
        <div className="rounded-xl p-6 text-center" style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="font-body text-[#F59E0B] font-medium">No weekly analysis yet</p>
          <p className="font-body text-sm mt-1" style={{ color: '#4A5568' }}>
            Start by creating your weekly analysis to define your HTF bias
          </p>
          <Link
            href="/weekly-analysis/new"
            className="inline-block mt-4 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all duration-200"
            style={{ border: '1px solid rgba(0,212,170,0.3)', color: '#00D4AA' }}
          >
            Create Weekly Analysis
          </Link>
        </div>
      )}

      {/* Discipline Score */}
      {stats && stats.totalTrades > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl p-6 hover:border-[#00D4AA]/30 transition-all duration-200" style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="font-body text-xs font-medium uppercase tracking-wider mb-2" style={{ color: '#4A5568' }}>
              Discipline Score
            </p>
            <div className="flex items-end gap-2">
              <span
                className={`font-mono text-4xl font-semibold ${
                  stats.disciplineScore >= 80
                    ? "text-[#00D4AA]"
                    : stats.disciplineScore >= 60
                    ? "text-[#F59E0B]"
                    : "text-[#EF4444]"
                }`}
              >
                {stats.disciplineScore}%
              </span>
              <span className="font-body text-sm mb-1" style={{ color: '#4A5568' }}>
                trades aligned with HTF
              </span>
            </div>
            <div className="mt-3 w-full rounded-full h-1.5" style={{ background: '#1A1F2E' }}>
              <div
                className={`h-1.5 rounded-full transition-all ${
                  stats.disciplineScore >= 80
                    ? "bg-[#00D4AA]"
                    : stats.disciplineScore >= 60
                    ? "bg-[#F59E0B]"
                    : "bg-[#EF4444]"
                }`}
                style={{ width: `${stats.disciplineScore}%` }}
              />
            </div>
          </div>

          <div className="rounded-xl p-6 hover:border-[#00D4AA]/30 transition-all duration-200" style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="font-body text-xs font-medium uppercase tracking-wider mb-2" style={{ color: '#4A5568' }}>
              Win Rate
            </p>
            <div className="flex items-end gap-2">
              <span className="font-mono text-4xl font-semibold" style={{ color: '#E8ECF1' }}>
                {stats.winRate}%
              </span>
              <span className="font-body text-sm mb-1" style={{ color: '#4A5568' }}>
                {stats.wins}W / {stats.losses}L / {stats.breakeven}BE
              </span>
            </div>
          </div>

          <div className="rounded-xl p-6 hover:border-[#00D4AA]/30 transition-all duration-200" style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="font-body text-xs font-medium uppercase tracking-wider mb-2" style={{ color: '#4A5568' }}>
              Total P&L
            </p>
            <span
              className={`font-mono text-4xl font-semibold ${
                stats.totalPnl >= 0 ? "text-[#00D4AA]" : "text-[#EF4444]"
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
          <div className="rounded-xl p-6 hover:border-[#00D4AA]/30 transition-all duration-200" style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 className="font-display text-sm font-medium text-[#00D4AA] mb-4">
              Aligned with HTF
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="font-body text-xs" style={{ color: '#4A5568' }}>Trades</p>
                <p className="font-mono text-xl font-semibold" style={{ color: '#E8ECF1' }}>{stats.alignedTrades}</p>
              </div>
              <div>
                <p className="font-body text-xs" style={{ color: '#4A5568' }}>Win Rate</p>
                <p className="font-mono text-[#00D4AA] text-xl font-semibold">{stats.alignedWinRate}%</p>
              </div>
              <div>
                <p className="font-body text-xs" style={{ color: '#4A5568' }}>P&L</p>
                <p className={`font-mono text-xl font-semibold ${stats.alignedPnl >= 0 ? "text-[#00D4AA]" : "text-[#EF4444]"}`}>
                  {stats.alignedPnl >= 0 ? "+" : ""}{stats.alignedPnl}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl p-6 hover:border-[#EF4444]/30 transition-all duration-200" style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 className="font-display text-sm font-medium text-[#EF4444] mb-4">
              Counter HTF
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="font-body text-xs" style={{ color: '#4A5568' }}>Trades</p>
                <p className="font-mono text-xl font-semibold" style={{ color: '#E8ECF1' }}>{stats.counterTrades}</p>
              </div>
              <div>
                <p className="font-body text-xs" style={{ color: '#4A5568' }}>Win Rate</p>
                <p className="font-mono text-[#EF4444] text-xl font-semibold">{stats.counterWinRate}%</p>
              </div>
              <div>
                <p className="font-body text-xs" style={{ color: '#4A5568' }}>P&L</p>
                <p className={`font-mono text-xl font-semibold ${stats.counterPnl >= 0 ? "text-[#00D4AA]" : "text-[#EF4444]"}`}>
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
          <div className="rounded-xl p-5 hover:border-[#00D4AA]/30 transition-all duration-200" style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="font-body text-xs font-medium uppercase tracking-wider" style={{ color: '#4A5568' }}>Total Trades</p>
            <p className="font-mono text-2xl font-semibold mt-1" style={{ color: '#E8ECF1' }}>{stats.totalTrades}</p>
          </div>
          <div className="rounded-xl p-5 hover:border-[#00D4AA]/30 transition-all duration-200" style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="font-body text-xs font-medium uppercase tracking-wider" style={{ color: '#4A5568' }}>Open Trades</p>
            <p className="font-mono text-2xl font-semibold text-[#3B82F6] mt-1">{stats.openTrades}</p>
          </div>
          <div className="rounded-xl p-5 hover:border-[#00D4AA]/30 transition-all duration-200" style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="font-body text-xs font-medium uppercase tracking-wider" style={{ color: '#4A5568' }}>Avg Risk:Reward</p>
            <p className="font-mono text-2xl font-semibold mt-1" style={{ color: '#E8ECF1' }}>1:{stats.avgRiskReward}</p>
          </div>
          <div className="rounded-xl p-5 hover:border-[#00D4AA]/30 transition-all duration-200" style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="font-body text-xs font-medium uppercase tracking-wider" style={{ color: '#4A5568' }}>Aligned Trades</p>
            <p className="font-mono text-2xl font-semibold text-[#00D4AA] mt-1">
              {stats.alignedTrades}/{stats.totalTrades}
            </p>
          </div>
        </div>
      )}

      {/* Daily Checklist Reminder */}
      <div className="rounded-xl p-6" style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}>
        <h3 className="font-display font-semibold mb-4" style={{ color: '#E8ECF1', letterSpacing: '-0.02em' }}>Daily Trading Checklist</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <Link href="/nlp" className="flex items-center gap-2.5 rounded-xl px-4 py-3 transition-all duration-200 hover:border-[#00D4AA]/30" style={{ background: '#1A1F2E', border: '1px solid rgba(255,255,255,0.06)', color: '#7A8BA7' }}>
            <svg className="w-5 h-5 text-[#00D4AA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Complete NLP exercise
          </Link>
          <Link href="/habits" className="flex items-center gap-2.5 rounded-xl px-4 py-3 transition-all duration-200 hover:border-[#00D4AA]/30" style={{ background: '#1A1F2E', border: '1px solid rgba(255,255,255,0.06)', color: '#7A8BA7' }}>
            <svg className="w-5 h-5 text-[#00D4AA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Complete daily habits
          </Link>
          <Link href="/coach" className="flex items-center gap-2.5 rounded-xl px-4 py-3 transition-all duration-200 hover:border-[#8B5CF6]/30" style={{ background: '#1A1F2E', border: '1px solid rgba(255,255,255,0.06)', color: '#7A8BA7' }}>
            <svg className="w-5 h-5 text-[#8B5CF6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Pre-trade coaching session
          </Link>
        </div>
      </div>

      {/* Legal Disclaimer */}
      <div className="text-center text-xs py-4 font-body" style={{ color: '#4A5568', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <p>This application is for educational purposes only and does not constitute financial advice.</p>
        <p>Trading involves significant risk. Past performance is not indicative of future results.</p>
      </div>
    </div>
  );
}
