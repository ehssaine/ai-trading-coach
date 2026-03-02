"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { formatDate, getBiasBg } from "@/lib/utils";

interface DailyPlan {
  id: string;
  date: string;
  dailyBias: string;
  alignedWithHTF: boolean;
  _count: { trades: number };
}

interface WeeklyAnalysis {
  id: string;
  weekStart: string;
  marketStructure: string;
  keyLevel: string;
  trendDescription: string;
  htfBias: string;
  biasReasoning: string;
  weeklySupport: string;
  weeklyResistance: string;
  weeklyPOI: string;
  notes: string | null;
  dailyPlans: DailyPlan[];
}

export default function WeeklyAnalysisDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [analysis, setAnalysis] = useState<WeeklyAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/weekly-analysis/${params.id}`)
      .then((r) => r.json())
      .then((data) => setAnalysis(data.analysis))
      .finally(() => setLoading(false));
  }, [params.id]);

  async function handleDelete() {
    if (!confirm("Delete this weekly analysis?")) return;
    await fetch(`/api/weekly-analysis/${params.id}`, { method: "DELETE" });
    router.push("/weekly-analysis");
  }

  if (loading) {
    return (
      <div className="font-body text-center py-12" style={{ color: '#4A5568' }}>
        Loading...
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="font-body text-center py-12" style={{ color: '#EF4444' }}>
        Not found
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/weekly-analysis"
        className="font-body inline-flex items-center gap-1 text-sm text-[#3B82F6] hover:underline"
      >
        &larr; Back to Weekly Analysis
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1
            className="font-display text-2xl font-semibold"
            style={{ color: '#E8ECF1', letterSpacing: '-0.02em' }}
          >
            Week of {formatDate(analysis.weekStart)}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border ${getBiasBg(
                analysis.htfBias
              )}`}
            >
              HTF Bias: {analysis.htfBias}
            </span>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm border ${getBiasBg(
                analysis.marketStructure
              )}`}
            >
              {analysis.marketStructure}
            </span>
          </div>
        </div>
        <button
          onClick={handleDelete}
          className="font-body rounded-lg text-[13px] font-medium px-4 py-2 transition-all duration-200"
          style={{ background: '#EF4444', color: '#FFFFFF' }}
        >
          Delete
        </button>
      </div>

      <div className="grid gap-4">
        <div
          className="rounded-xl p-6"
          style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <h3
            className="font-body text-xs font-medium uppercase tracking-wider mb-2"
            style={{ color: '#7A8BA7' }}
          >
            Trend Description
          </h3>
          <p className="font-body" style={{ color: '#E8ECF1' }}>
            {analysis.trendDescription}
          </p>
        </div>

        <div
          className="rounded-xl p-6"
          style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <h3
            className="font-body text-xs font-medium uppercase tracking-wider mb-2"
            style={{ color: '#7A8BA7' }}
          >
            Bias Reasoning
          </h3>
          <p className="font-body" style={{ color: '#E8ECF1' }}>
            {analysis.biasReasoning}
          </p>
        </div>

        <div
          className="rounded-xl p-6"
          style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <h3
            className="font-body text-xs font-medium uppercase tracking-wider mb-2"
            style={{ color: '#7A8BA7' }}
          >
            Key Levels
          </h3>
          <p className="font-body" style={{ color: '#E8ECF1' }}>
            {analysis.keyLevel}
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
              {analysis.weeklySupport}
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
              {analysis.weeklyResistance}
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
              {analysis.weeklyPOI}
            </p>
          </div>
        </div>

        {analysis.notes && (
          <div
            className="rounded-xl p-6"
            style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <h3
              className="font-body text-xs font-medium uppercase tracking-wider mb-2"
              style={{ color: '#7A8BA7' }}
            >
              Notes
            </h3>
            <p className="font-body" style={{ color: '#E8ECF1' }}>
              {analysis.notes}
            </p>
          </div>
        )}
      </div>

      {/* Daily Plans linked to this week */}
      <div>
        <h2
          className="font-display text-lg font-semibold mb-3"
          style={{ color: '#E8ECF1', letterSpacing: '-0.02em' }}
        >
          Daily Plans
        </h2>
        {analysis.dailyPlans.length === 0 ? (
          <div
            className="rounded-xl p-6"
            style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p className="font-body text-[13px]" style={{ color: '#4A5568' }}>
              No daily plans linked to this week yet.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {analysis.dailyPlans.map((plan) => (
              <Link
                key={plan.id}
                href={`/daily-plans/${plan.id}`}
                className="flex items-center justify-between rounded-xl p-4 hover:border-[#00D4AA]/30 transition-all duration-200"
                style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-center gap-3">
                  <span className="font-body text-sm" style={{ color: '#E8ECF1' }}>
                    {formatDate(plan.date)}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${getBiasBg(
                      plan.dailyBias
                    )}`}
                  >
                    {plan.dailyBias}
                  </span>
                  {!plan.alignedWithHTF && (
                    <span className="font-body text-[11px]" style={{ color: '#EF4444' }}>
                      Counter-HTF
                    </span>
                  )}
                </div>
                <span className="font-mono text-[11px]" style={{ color: '#4A5568' }}>
                  {plan._count.trades} trades
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
