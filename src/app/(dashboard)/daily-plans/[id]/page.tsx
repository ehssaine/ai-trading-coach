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

  if (loading) return <div className="text-zinc-400 text-center py-12">Loading...</div>;
  if (!plan) return <div className="text-[#ff453a] text-center py-12">Not found</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">
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
              <span className="text-[#ff453a] text-[11px] font-medium bg-[#ff453a]/10 px-2 py-1 rounded-xl">
                Counter-HTF
              </span>
            )}
          </div>
        </div>
        <button onClick={handleDelete} className="text-[#ff453a] hover:text-[#ff453a]/80 text-[13px]">
          Delete
        </button>
      </div>

      {/* Plan Details */}
      <div className="grid gap-4">
        <div className="bg-[#1c1c1e] rounded-2xl p-6">
          <h3 className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-2">Trade Plan</h3>
          <p className="text-zinc-300 whitespace-pre-wrap">{plan.tradePlan}</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#1c1c1e] rounded-2xl p-4">
            <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Support</p>
            <p className="text-white font-medium mt-1">{plan.dailySupport}</p>
          </div>
          <div className="bg-[#1c1c1e] rounded-2xl p-4">
            <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Resistance</p>
            <p className="text-white font-medium mt-1">{plan.dailyResistance}</p>
          </div>
          <div className="bg-[#1c1c1e] rounded-2xl p-4">
            <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">POI</p>
            <p className="text-white font-medium mt-1">{plan.dailyPOI}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#1c1c1e] rounded-2xl p-4">
            <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Max Trades</p>
            <p className="text-white font-medium mt-1">{plan.maxTrades}</p>
          </div>
          <div className="bg-[#1c1c1e] rounded-2xl p-4">
            <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Risk Per Trade</p>
            <p className="text-white font-medium mt-1">{plan.riskPerTrade}%</p>
          </div>
        </div>

        {/* Session Notes */}
        {(plan.asianSessionNotes || plan.londonSessionNotes || plan.nySessionNotes) && (
          <div className="bg-[#1c1c1e] rounded-2xl p-6 space-y-3">
            <h3 className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Session Notes</h3>
            {plan.asianSessionNotes && (
              <div>
                <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Asian</p>
                <p className="text-zinc-300 text-sm">{plan.asianSessionNotes}</p>
              </div>
            )}
            {plan.londonSessionNotes && (
              <div>
                <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">London</p>
                <p className="text-zinc-300 text-sm">{plan.londonSessionNotes}</p>
              </div>
            )}
            {plan.nySessionNotes && (
              <div>
                <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">New York</p>
                <p className="text-zinc-300 text-sm">{plan.nySessionNotes}</p>
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
              className="text-[#0a84ff] hover:text-[#0a84ff]/80 text-[13px]"
            >
              + Log Trade
            </Link>
          )}
          {plan.trades.length >= plan.maxTrades && (
            <span className="text-[#ff9f0a] text-[11px]">Max trades reached for today</span>
          )}
        </div>

        {plan.trades.length === 0 ? (
          <p className="text-zinc-500 text-[13px]">No trades logged yet.</p>
        ) : (
          <div className="space-y-2">
            {plan.trades.map((trade) => (
              <Link
                key={trade.id}
                href={`/journal/${trade.id}`}
                className="flex items-center justify-between bg-[#1c1c1e] rounded-2xl p-4 hover:bg-white/[0.08] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-white font-medium">{trade.pair}</span>
                  <span className={`text-[11px] font-bold ${trade.direction === "LONG" ? "text-[#30d158]" : "text-[#ff453a]"}`}>
                    {trade.direction}
                  </span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full ${
                    trade.status === "CLOSED_WIN" ? "bg-[#30d158]/10 text-[#30d158]" :
                    trade.status === "CLOSED_LOSS" ? "bg-[#ff453a]/10 text-[#ff453a]" :
                    trade.status === "OPEN" ? "bg-[#0a84ff]/10 text-[#0a84ff]" :
                    "bg-white/5 text-zinc-400"
                  }`}>
                    {trade.status.replace("CLOSED_", "")}
                  </span>
                  {!trade.alignedWithHTF && (
                    <span className="text-[#ff453a] text-[11px]">Counter-HTF</span>
                  )}
                </div>
                <div className="text-right">
                  {trade.pnl !== null && (
                    <span className={`font-medium ${trade.pnl >= 0 ? "text-[#30d158]" : "text-[#ff453a]"}`}>
                      {trade.pnl >= 0 ? "+" : ""}{trade.pnl}
                    </span>
                  )}
                  <p className="text-zinc-500 text-[11px]">{formatDateTime(trade.entryTime)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* End of Day Review */}
      <div className="bg-[#1c1c1e] border border-white/[0.06] rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">End of Day Review</h2>
        <form onSubmit={handleSaveReview} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-zinc-400 mb-2">
                Followed Plan?
              </label>
              <select
                value={review.followedPlan ? "true" : "false"}
                onChange={(e) => setReview({ ...review, followedPlan: e.target.value === "true" })}
                className="w-full bg-white/5 border-0 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-white/20"
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-zinc-400 mb-2">
                Emotional State
              </label>
              <select
                value={review.emotionalState}
                onChange={(e) => setReview({ ...review, emotionalState: e.target.value })}
                className="w-full bg-white/5 border-0 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-white/20"
              >
                {EMOTIONAL_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-zinc-400 mb-2">
              Review Notes
            </label>
            <textarea
              value={review.reviewNotes}
              onChange={(e) => setReview({ ...review, reviewNotes: e.target.value })}
              rows={3}
              placeholder="How did the day go? What went well, what went wrong?"
              className="w-full bg-white/5 border-0 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-white/20 resize-none"
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-zinc-400 mb-2">
              Lesson Learned
            </label>
            <textarea
              value={review.lessonLearned}
              onChange={(e) => setReview({ ...review, lessonLearned: e.target.value })}
              rows={2}
              placeholder="What is the #1 takeaway from today?"
              className="w-full bg-white/5 border-0 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-white/20 resize-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-white text-black rounded-full text-[13px] font-medium px-5 py-2.5 hover:bg-white/90 disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving..." : "Save Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
