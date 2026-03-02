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

  const inputStyle = {
    background: '#1A1F2E',
    border: '1px solid rgba(255,255,255,0.06)',
    color: '#E8ECF1',
  };

  const inputClassName = "w-full rounded-xl px-4 py-3 font-body focus:outline-none focus:ring-1 focus:ring-[#00D4AA]/40 placeholder:text-[#4A5568]";

  if (loading)
    return (
      <div className="font-body text-center py-12" style={{ color: '#7A8BA7' }}>
        Loading...
      </div>
    );

  if (!plan)
    return (
      <div className="font-body text-center py-12" style={{ color: '#EF4444' }}>
        Not found
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="font-display text-2xl font-semibold"
            style={{ color: '#E8ECF1', letterSpacing: '-0.02em' }}
          >
            Daily Plan - {formatDate(plan.date)}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border ${getBiasBg(plan.dailyBias)}`}
            >
              Daily: {plan.dailyBias}
            </span>
            {plan.weeklyAnalysis && (
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm border ${getBiasBg(plan.weeklyAnalysis.htfBias)}`}
              >
                HTF: {plan.weeklyAnalysis.htfBias}
              </span>
            )}
            {!plan.alignedWithHTF && (
              <span
                className="text-[11px] font-medium px-2 py-1 rounded-xl"
                style={{ color: '#EF4444', background: 'rgba(239,68,68,0.1)' }}
              >
                Counter-HTF
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleDelete}
          className="font-body text-[13px] font-medium transition-all duration-200"
          style={{ color: '#EF4444' }}
        >
          Delete
        </button>
      </div>

      {/* Plan Details */}
      <div className="grid gap-4">
        <div
          className="rounded-xl p-6"
          style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <h3
            className="font-body text-xs font-medium uppercase tracking-wider mb-2"
            style={{ color: '#7A8BA7' }}
          >
            Trade Plan
          </h3>
          <p className="font-body whitespace-pre-wrap" style={{ color: '#E8ECF1' }}>
            {plan.tradePlan}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div
            className="rounded-xl p-4"
            style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p
              className="font-body text-xs font-medium uppercase tracking-wider"
              style={{ color: '#7A8BA7' }}
            >
              Support
            </p>
            <p className="font-mono font-medium mt-1" style={{ color: '#E8ECF1' }}>
              {plan.dailySupport}
            </p>
          </div>
          <div
            className="rounded-xl p-4"
            style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p
              className="font-body text-xs font-medium uppercase tracking-wider"
              style={{ color: '#7A8BA7' }}
            >
              Resistance
            </p>
            <p className="font-mono font-medium mt-1" style={{ color: '#E8ECF1' }}>
              {plan.dailyResistance}
            </p>
          </div>
          <div
            className="rounded-xl p-4"
            style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p
              className="font-body text-xs font-medium uppercase tracking-wider"
              style={{ color: '#7A8BA7' }}
            >
              POI
            </p>
            <p className="font-mono font-medium mt-1" style={{ color: '#E8ECF1' }}>
              {plan.dailyPOI}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div
            className="rounded-xl p-4"
            style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p
              className="font-body text-xs font-medium uppercase tracking-wider"
              style={{ color: '#7A8BA7' }}
            >
              Max Trades
            </p>
            <p className="font-mono font-medium mt-1" style={{ color: '#E8ECF1' }}>
              {plan.maxTrades}
            </p>
          </div>
          <div
            className="rounded-xl p-4"
            style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p
              className="font-body text-xs font-medium uppercase tracking-wider"
              style={{ color: '#7A8BA7' }}
            >
              Risk Per Trade
            </p>
            <p className="font-mono font-medium mt-1" style={{ color: '#E8ECF1' }}>
              {plan.riskPerTrade}%
            </p>
          </div>
        </div>

        {/* Session Notes */}
        {(plan.asianSessionNotes || plan.londonSessionNotes || plan.nySessionNotes) && (
          <div
            className="rounded-xl p-6 space-y-3"
            style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <h3
              className="font-body text-xs font-medium uppercase tracking-wider"
              style={{ color: '#7A8BA7' }}
            >
              Session Notes
            </h3>
            {plan.asianSessionNotes && (
              <div>
                <p
                  className="font-body text-xs font-medium uppercase tracking-wider"
                  style={{ color: '#4A5568' }}
                >
                  Asian
                </p>
                <p className="font-body text-sm" style={{ color: '#E8ECF1' }}>
                  {plan.asianSessionNotes}
                </p>
              </div>
            )}
            {plan.londonSessionNotes && (
              <div>
                <p
                  className="font-body text-xs font-medium uppercase tracking-wider"
                  style={{ color: '#4A5568' }}
                >
                  London
                </p>
                <p className="font-body text-sm" style={{ color: '#E8ECF1' }}>
                  {plan.londonSessionNotes}
                </p>
              </div>
            )}
            {plan.nySessionNotes && (
              <div>
                <p
                  className="font-body text-xs font-medium uppercase tracking-wider"
                  style={{ color: '#4A5568' }}
                >
                  New York
                </p>
                <p className="font-body text-sm" style={{ color: '#E8ECF1' }}>
                  {plan.nySessionNotes}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Trades */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2
            className="font-display text-lg font-semibold"
            style={{ color: '#E8ECF1', letterSpacing: '-0.02em' }}
          >
            Trades ({plan.trades.length}/{plan.maxTrades})
          </h2>
          {plan.trades.length < plan.maxTrades && (
            <Link
              href={`/journal/new?dailyPlanId=${plan.id}`}
              className="font-body text-[13px] font-medium transition-all duration-200"
              style={{ color: '#3B82F6' }}
            >
              + Log Trade
            </Link>
          )}
          {plan.trades.length >= plan.maxTrades && (
            <span className="font-body text-[11px]" style={{ color: '#F59E0B' }}>
              Max trades reached for today
            </span>
          )}
        </div>

        {plan.trades.length === 0 ? (
          <p className="font-body text-[13px]" style={{ color: '#4A5568' }}>
            No trades logged yet.
          </p>
        ) : (
          <div className="space-y-2">
            {plan.trades.map((trade) => (
              <Link
                key={trade.id}
                href={`/journal/${trade.id}`}
                className="flex items-center justify-between rounded-xl p-4 hover:border-[#00D4AA]/30 transition-all duration-200 block"
                style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-center gap-3">
                  <span className="font-body font-medium" style={{ color: '#E8ECF1' }}>
                    {trade.pair}
                  </span>
                  <span
                    className="text-[11px] font-bold font-body"
                    style={{ color: trade.direction === "LONG" ? '#00D4AA' : '#EF4444' }}
                  >
                    {trade.direction}
                  </span>
                  <span
                    className="text-[11px] px-2 py-0.5 rounded-full font-body"
                    style={
                      trade.status === "CLOSED_WIN"
                        ? { background: 'rgba(0,212,170,0.1)', color: '#00D4AA' }
                        : trade.status === "CLOSED_LOSS"
                        ? { background: 'rgba(239,68,68,0.1)', color: '#EF4444' }
                        : trade.status === "OPEN"
                        ? { background: 'rgba(59,130,246,0.1)', color: '#3B82F6' }
                        : { background: 'rgba(255,255,255,0.05)', color: '#7A8BA7' }
                    }
                  >
                    {trade.status.replace("CLOSED_", "")}
                  </span>
                  {!trade.alignedWithHTF && (
                    <span className="font-body text-[11px]" style={{ color: '#EF4444' }}>
                      Counter-HTF
                    </span>
                  )}
                </div>
                <div className="text-right">
                  {trade.pnl !== null && (
                    <span
                      className="font-mono font-medium"
                      style={{ color: trade.pnl >= 0 ? '#00D4AA' : '#EF4444' }}
                    >
                      {trade.pnl >= 0 ? "+" : ""}{trade.pnl}
                    </span>
                  )}
                  <p className="font-body text-[11px]" style={{ color: '#4A5568' }}>
                    {formatDateTime(trade.entryTime)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* End of Day Review */}
      <div
        className="rounded-xl p-6"
        style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <h2
          className="font-display text-lg font-semibold mb-4"
          style={{ color: '#E8ECF1', letterSpacing: '-0.02em' }}
        >
          End of Day Review
        </h2>
        <form onSubmit={handleSaveReview} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className="font-body block text-xs font-medium uppercase tracking-wider mb-1.5"
                style={{ color: '#7A8BA7' }}
              >
                Followed Plan?
              </label>
              <select
                value={review.followedPlan ? "true" : "false"}
                onChange={(e) => setReview({ ...review, followedPlan: e.target.value === "true" })}
                className={inputClassName}
                style={inputStyle}
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
            <div>
              <label
                className="font-body block text-xs font-medium uppercase tracking-wider mb-1.5"
                style={{ color: '#7A8BA7' }}
              >
                Emotional State
              </label>
              <select
                value={review.emotionalState}
                onChange={(e) => setReview({ ...review, emotionalState: e.target.value })}
                className={inputClassName}
                style={inputStyle}
              >
                {EMOTIONAL_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              className="font-body block text-xs font-medium uppercase tracking-wider mb-1.5"
              style={{ color: '#7A8BA7' }}
            >
              Review Notes
            </label>
            <textarea
              value={review.reviewNotes}
              onChange={(e) => setReview({ ...review, reviewNotes: e.target.value })}
              rows={3}
              placeholder="How did the day go? What went well, what went wrong?"
              className={`${inputClassName} resize-none`}
              style={inputStyle}
            />
          </div>

          <div>
            <label
              className="font-body block text-xs font-medium uppercase tracking-wider mb-1.5"
              style={{ color: '#7A8BA7' }}
            >
              Lesson Learned
            </label>
            <textarea
              value={review.lessonLearned}
              onChange={(e) => setReview({ ...review, lessonLearned: e.target.value })}
              rows={2}
              placeholder="What is the #1 takeaway from today?"
              className={`${inputClassName} resize-none`}
              style={inputStyle}
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="font-body rounded-xl text-[13px] font-medium px-5 py-2.5 text-white disabled:opacity-50 transition-all duration-200"
              style={{ background: 'linear-gradient(135deg, #00D4AA 0%, #3B82F6 100%)' }}
            >
              {saving ? "Saving..." : "Save Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
