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

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [latestWeekly, setLatestWeekly] = useState<WeeklyAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, weeklyRes] = await Promise.all([
          fetch("/api/trades/stats"),
          fetch("/api/weekly-analysis"),
        ]);
        const statsData = await statsRes.json();
        const weeklyData = await weeklyRes.json();
        setStats(statsData.stats);
        if (weeklyData.analyses?.length > 0) {
          setLatestWeekly(weeklyData.analyses[0]);
        }
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
        <div className="text-gray-400">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">
            Stay disciplined. Trade with the higher timeframe.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/weekly-analysis/new"
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + Weekly Analysis
          </Link>
          <Link
            href="/daily-plans/new"
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + Daily Plan
          </Link>
          <Link
            href="/journal/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + Log Trade
          </Link>
        </div>
      </div>

      {/* Current HTF Bias Banner */}
      {latestWeekly && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">
                Current Weekly Bias
              </p>
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border ${getBiasBg(
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
              <p className="text-gray-400 text-sm mt-2 max-w-xl">
                {latestWeekly.biasReasoning}
              </p>
            </div>
            <Link
              href={`/weekly-analysis`}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              View Details
            </Link>
          </div>
        </div>
      )}

      {!latestWeekly && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 text-center">
          <p className="text-yellow-400 font-medium">No weekly analysis yet</p>
          <p className="text-yellow-400/70 text-sm mt-1">
            Start by creating your weekly analysis to define your HTF bias
          </p>
          <Link
            href="/weekly-analysis/new"
            className="inline-block mt-3 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Create Weekly Analysis
          </Link>
        </div>
      )}

      {/* Discipline Score */}
      {stats && stats.totalTrades > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">
              Discipline Score
            </p>
            <div className="flex items-end gap-2">
              <span
                className={`text-4xl font-bold ${
                  stats.disciplineScore >= 80
                    ? "text-emerald-400"
                    : stats.disciplineScore >= 60
                    ? "text-yellow-400"
                    : "text-red-400"
                }`}
              >
                {stats.disciplineScore}%
              </span>
              <span className="text-gray-500 text-sm mb-1">
                trades aligned with HTF
              </span>
            </div>
            <div className="mt-3 w-full bg-gray-800 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  stats.disciplineScore >= 80
                    ? "bg-emerald-500"
                    : stats.disciplineScore >= 60
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${stats.disciplineScore}%` }}
              />
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">
              Win Rate
            </p>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-white">
                {stats.winRate}%
              </span>
              <span className="text-gray-500 text-sm mb-1">
                {stats.wins}W / {stats.losses}L / {stats.breakeven}BE
              </span>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">
              Total P&L
            </p>
            <span
              className={`text-4xl font-bold ${
                stats.totalPnl >= 0 ? "text-emerald-400" : "text-red-400"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900 border border-emerald-500/20 rounded-xl p-6">
            <h3 className="text-sm font-medium text-emerald-400 uppercase tracking-wider mb-4">
              Aligned with HTF (The Good)
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-gray-500 text-xs">Trades</p>
                <p className="text-white text-xl font-bold">{stats.alignedTrades}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Win Rate</p>
                <p className="text-emerald-400 text-xl font-bold">{stats.alignedWinRate}%</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">P&L</p>
                <p className={`text-xl font-bold ${stats.alignedPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {stats.alignedPnl >= 0 ? "+" : ""}{stats.alignedPnl}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-red-500/20 rounded-xl p-6">
            <h3 className="text-sm font-medium text-red-400 uppercase tracking-wider mb-4">
              Counter HTF (The Bad)
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-gray-500 text-xs">Trades</p>
                <p className="text-white text-xl font-bold">{stats.counterTrades}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Win Rate</p>
                <p className="text-red-400 text-xl font-bold">{stats.counterWinRate}%</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">P&L</p>
                <p className={`text-xl font-bold ${stats.counterPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
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
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500">Total Trades</p>
            <p className="text-2xl font-bold text-white">{stats.totalTrades}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500">Open Trades</p>
            <p className="text-2xl font-bold text-blue-400">{stats.openTrades}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500">Avg Risk:Reward</p>
            <p className="text-2xl font-bold text-white">1:{stats.avgRiskReward}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500">Aligned Trades</p>
            <p className="text-2xl font-bold text-emerald-400">
              {stats.alignedTrades}/{stats.totalTrades}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
