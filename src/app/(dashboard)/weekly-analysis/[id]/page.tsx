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

  if (loading) return <div className="text-zinc-400 text-center py-12">Loading...</div>;
  if (!analysis) return <div className="text-[#ff453a] text-center py-12">Not found</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            Week of {formatDate(analysis.weekStart)}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border ${getBiasBg(analysis.htfBias)}`}>
              HTF Bias: {analysis.htfBias}
            </span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm border ${getBiasBg(analysis.marketStructure)}`}>
              {analysis.marketStructure}
            </span>
          </div>
        </div>
        <button
          onClick={handleDelete}
          className="text-[#ff453a] hover:text-[#ff453a]/80 text-[13px]"
        >
          Delete
        </button>
      </div>

      <div className="grid gap-4">
        <div className="bg-[#1c1c1e] rounded-2xl p-6">
          <h3 className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-2">
            Trend Description
          </h3>
          <p className="text-zinc-300">{analysis.trendDescription}</p>
        </div>

        <div className="bg-[#1c1c1e] rounded-2xl p-6">
          <h3 className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-2">
            Bias Reasoning
          </h3>
          <p className="text-zinc-300">{analysis.biasReasoning}</p>
        </div>

        <div className="bg-[#1c1c1e] rounded-2xl p-6">
          <h3 className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-2">
            Key Levels
          </h3>
          <p className="text-zinc-300">{analysis.keyLevel}</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#1c1c1e] rounded-2xl p-4">
            <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Support</p>
            <p className="text-white font-medium mt-1">{analysis.weeklySupport}</p>
          </div>
          <div className="bg-[#1c1c1e] rounded-2xl p-4">
            <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Resistance</p>
            <p className="text-white font-medium mt-1">{analysis.weeklyResistance}</p>
          </div>
          <div className="bg-[#1c1c1e] rounded-2xl p-4">
            <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">POI</p>
            <p className="text-white font-medium mt-1">{analysis.weeklyPOI}</p>
          </div>
        </div>

        {analysis.notes && (
          <div className="bg-[#1c1c1e] rounded-2xl p-6">
            <h3 className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-2">
              Notes
            </h3>
            <p className="text-zinc-300">{analysis.notes}</p>
          </div>
        )}
      </div>

      {/* Daily Plans linked to this week */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Daily Plans</h2>
        {analysis.dailyPlans.length === 0 ? (
          <p className="text-zinc-500 text-[13px]">No daily plans linked to this week yet.</p>
        ) : (
          <div className="space-y-2">
            {analysis.dailyPlans.map((plan) => (
              <Link
                key={plan.id}
                href={`/daily-plans/${plan.id}`}
                className="flex items-center justify-between bg-[#1c1c1e] rounded-2xl p-4 hover:bg-white/[0.08] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-white text-sm">{formatDate(plan.date)}</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${getBiasBg(plan.dailyBias)}`}>
                    {plan.dailyBias}
                  </span>
                  {!plan.alignedWithHTF && (
                    <span className="text-[#ff453a] text-[11px]">Counter-HTF</span>
                  )}
                </div>
                <span className="text-zinc-500 text-[11px]">{plan._count.trades} trades</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
