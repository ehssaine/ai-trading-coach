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

  if (loading) return <div className="text-gray-400 text-center py-12">Loading...</div>;
  if (!analysis) return <div className="text-red-400 text-center py-12">Not found</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
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
          className="text-red-400 hover:text-red-300 text-sm"
        >
          Delete
        </button>
      </div>

      <div className="grid gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
            Trend Description
          </h3>
          <p className="text-gray-300">{analysis.trendDescription}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
            Bias Reasoning
          </h3>
          <p className="text-gray-300">{analysis.biasReasoning}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
            Key Levels
          </h3>
          <p className="text-gray-300">{analysis.keyLevel}</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500">Support</p>
            <p className="text-white font-medium mt-1">{analysis.weeklySupport}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500">Resistance</p>
            <p className="text-white font-medium mt-1">{analysis.weeklyResistance}</p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500">POI</p>
            <p className="text-white font-medium mt-1">{analysis.weeklyPOI}</p>
          </div>
        </div>

        {analysis.notes && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
              Notes
            </h3>
            <p className="text-gray-300">{analysis.notes}</p>
          </div>
        )}
      </div>

      {/* Daily Plans linked to this week */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">Daily Plans</h2>
        {analysis.dailyPlans.length === 0 ? (
          <p className="text-gray-500 text-sm">No daily plans linked to this week yet.</p>
        ) : (
          <div className="space-y-2">
            {analysis.dailyPlans.map((plan) => (
              <Link
                key={plan.id}
                href={`/daily-plans/${plan.id}`}
                className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-white text-sm">{formatDate(plan.date)}</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getBiasBg(plan.dailyBias)}`}>
                    {plan.dailyBias}
                  </span>
                  {!plan.alignedWithHTF && (
                    <span className="text-red-400 text-xs">Counter-HTF</span>
                  )}
                </div>
                <span className="text-gray-500 text-xs">{plan._count.trades} trades</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
