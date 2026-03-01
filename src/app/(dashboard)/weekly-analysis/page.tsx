"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDate, getBiasBg } from "@/lib/utils";

interface WeeklyAnalysis {
  id: string;
  weekStart: string;
  marketStructure: string;
  htfBias: string;
  biasReasoning: string;
  keyLevel: string;
  trendDescription: string;
  weeklySupport: string;
  weeklyResistance: string;
  weeklyPOI: string;
  notes: string | null;
  _count: { dailyPlans: number };
}

export default function WeeklyAnalysisListPage() {
  const [analyses, setAnalyses] = useState<WeeklyAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/weekly-analysis")
      .then((r) => r.json())
      .then((data) => setAnalyses(data.analyses || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-zinc-400 text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Weekly Analysis</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Define your HTF bias every week before trading
          </p>
        </div>
        <Link
          href="/weekly-analysis/new"
          className="bg-white hover:bg-white/90 text-black px-5 py-2 rounded-full text-[13px] font-medium transition-colors"
        >
          + New Analysis
        </Link>
      </div>

      {analyses.length === 0 && (
        <div className="text-center py-16 bg-[#1c1c1e] rounded-2xl">
          <p className="text-zinc-400 text-lg">No weekly analyses yet</p>
          <p className="text-zinc-500 text-sm mt-1">
            Start your week right by analyzing the higher timeframe
          </p>
        </div>
      )}

      <div className="grid gap-4">
        {analyses.map((a) => (
          <Link
            key={a.id}
            href={`/weekly-analysis/${a.id}`}
            className="bg-[#1c1c1e] rounded-2xl p-6 hover:bg-white/[0.06] transition-colors block"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-white font-medium">
                    Week of {formatDate(a.weekStart)}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getBiasBg(
                      a.htfBias
                    )}`}
                  >
                    {a.htfBias}
                  </span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs border ${getBiasBg(
                      a.marketStructure
                    )}`}
                  >
                    {a.marketStructure}
                  </span>
                </div>
                <p className="text-zinc-400 text-sm">{a.biasReasoning}</p>
                <div className="flex items-center gap-4 text-xs text-zinc-500">
                  <span>Support: {a.weeklySupport}</span>
                  <span>Resistance: {a.weeklyResistance}</span>
                  <span>{a._count.dailyPlans} daily plans</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
