"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { formatDate, formatDateTime, getBiasBg, EMOTIONAL_STATES } from "@/lib/utils";

interface Trade {
  id: string;
  pair: string;
  direction: string;
  status: string;
  pnl: number | null;
  entryTime: string;
  alignedWithHTF: boolean;
}

interface DailyPlan {
  id: string;
  date: string;
  dailyBias: string;
  dailyMarketStructure: string;
  alignedWithHTF: boolean;
  asianSessionNotes: string | null;
  londonSessionNotes: string | null;
  nySessionNotes: string | null;
  dailySupport: string;
  dailyResistance: string;
  dailyPOI: string;
  maxTrades: number;
  riskPerTrade: number;
  tradePlan: string;
  reviewNotes: string | null;
  followedPlan: boolean | null;
  emotionalState: string | null;
  lessonLearned: string | null;
  weeklyAnalysis: { htfBias: string; marketStructure: string } | null;
  trades: Trade[];
}

export default function DailyPlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [plan, setPlan] = useState<DailyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [review, setReview] = useState({
    reviewNotes: "",
    followedPlan: true,
    emotionalState: "CALM",
    lessonLearned: "",
  });

  useEffect(() => {
    fetch(`/api/daily-plans/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setPlan(data.plan);
        if (data.plan) {
          setReview({
            reviewNotes: data.plan.reviewNotes || "",
            followedPlan: data.plan.followedPlan ?? true,
            emotionalState: data.plan.emotionalState || "CALM",
            lessonLearned: data.plan.lessonLearned || "",
          });
        }
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  async function handleSaveReview(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch(`/api/daily-plans/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...plan, ...review }),
    });
    setSaving(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Delete this daily plan?")) return;
    await fetch(`/api/daily-plans/${params.id}`, { method: "DELETE" });
    router.push("/daily-plans");
  }

  if (loading) return <div className="text-gray-400 text-center py-12">Loading...</div>;
  if (!plan) return <div className="text-red-400 text-center py-12">Not found</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Daily Plan - {formatDate(plan.date)}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border ${getBiasBg(plan.dailyBias)}`}>
              Daily: {plan.dailyBias}
            </span>
            {plan.weeklyAnalysis && (
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm border ${getBiasBg(plan.weeklyAnalysis.htfBias)}`}>
                HTF: {plan.weeklyAnalysis.htfBias}
              </span>
            )}
            {!plan.alignedWithHTF && (
              <span className="text-red-400 text-xs font-medium bg-red-500/10 px-2 py-1 rounded">
                Counter-HTF
              </span>
            )}
          </div>
        </div>
        <button onClick={handleDelete} className="text-red-400 hover:text-red-300 text-sm">
          Delete
        </button>
      </div>

      {/* Plan Details */}
      <div className="grid gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Trade Plan</h3>
          <p className="text-gray-300 whitespace-pre-wrap">{plan.tradePlan}</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500">Support</p>
            <p className="text-white font-medium mt-1">{plan.dailySupport}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500">Resistance</p>
            <p className="text-white font-medium mt-1">{plan.dailyResistance}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500">POI</p>
            <p className="text-white font-medium mt-1">{plan.dailyPOI}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500">Max Trades</p>
            <p className="text-white font-medium mt-1">{plan.maxTrades}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500">Risk Per Trade</p>
            <p className="text-white font-medium mt-1">{plan.riskPerTrade}%</p>
          </div>
        </div>

        {/* Session Notes */}
        {(plan.asianSessionNotes || plan.londonSessionNotes || plan.nySessionNotes) && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-3">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Session Notes</h3>
            {plan.asianSessionNotes && (
              <div>
                <p className="text-xs text-gray-500">Asian</p>
                <p className="text-gray-300 text-sm">{plan.asianSessionNotes}</p>
              </div>
            )}
            {plan.londonSessionNotes && (
              <div>
                <p className="text-xs text-gray-500">London</p>
                <p className="text-gray-300 text-sm">{plan.londonSessionNotes}</p>
              </div>
            )}
            {plan.nySessionNotes && (
              <div>
                <p className="text-xs text-gray-500">New York</p>
                <p className="text-gray-300 text-sm">{plan.nySessionNotes}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Trades */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white">Trades ({plan.trades.length}/{plan.maxTrades})</h2>
          {plan.trades.length < plan.maxTrades && (
            <Link
              href={`/journal/new?dailyPlanId=${plan.id}`}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              + Log Trade
            </Link>
          )}
          {plan.trades.length >= plan.maxTrades && (
            <span className="text-yellow-400 text-xs">Max trades reached for today</span>
          )}
        </div>

        {plan.trades.length === 0 ? (
          <p className="text-gray-500 text-sm">No trades logged yet.</p>
        ) : (
          <div className="space-y-2">
            {plan.trades.map((trade) => (
              <Link
                key={trade.id}
                href={`/journal/${trade.id}`}
                className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-white font-medium">{trade.pair}</span>
                  <span className={`text-xs font-bold ${trade.direction === "LONG" ? "text-emerald-400" : "text-red-400"}`}>
                    {trade.direction}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    trade.status === "CLOSED_WIN" ? "bg-emerald-500/20 text-emerald-400" :
                    trade.status === "CLOSED_LOSS" ? "bg-red-500/20 text-red-400" :
                    trade.status === "OPEN" ? "bg-blue-500/20 text-blue-400" :
                    "bg-gray-500/20 text-gray-400"
                  }`}>
                    {trade.status.replace("CLOSED_", "")}
                  </span>
                  {!trade.alignedWithHTF && (
                    <span className="text-red-400 text-xs">Counter-HTF</span>
                  )}
                </div>
                <div className="text-right">
                  {trade.pnl !== null && (
                    <span className={`font-medium ${trade.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {trade.pnl >= 0 ? "+" : ""}{trade.pnl}
                    </span>
                  )}
                  <p className="text-gray-500 text-xs">{formatDateTime(trade.entryTime)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* End of Day Review */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">End of Day Review</h2>
        <form onSubmit={handleSaveReview} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Followed Plan?
              </label>
              <select
                value={review.followedPlan ? "true" : "false"}
                onChange={(e) => setReview({ ...review, followedPlan: e.target.value === "true" })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Emotional State
              </label>
              <select
                value={review.emotionalState}
                onChange={(e) => setReview({ ...review, emotionalState: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {EMOTIONAL_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Review Notes
            </label>
            <textarea
              value={review.reviewNotes}
              onChange={(e) => setReview({ ...review, reviewNotes: e.target.value })}
              rows={3}
              placeholder="How did the day go? What went well, what went wrong?"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Lesson Learned
            </label>
            <textarea
              value={review.lessonLearned}
              onChange={(e) => setReview({ ...review, lessonLearned: e.target.value })}
              rows={2}
              placeholder="What is the #1 takeaway from today?"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
            >
              {saving ? "Saving..." : "Save Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
