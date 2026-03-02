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
    return (
      <div className="font-body text-center py-12" style={{ color: '#4A5568' }}>
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="font-display text-2xl font-semibold"
            style={{ color: '#E8ECF1', letterSpacing: '-0.02em' }}
          >
            Weekly Analysis
          </h1>
          <p className="font-body text-sm mt-1" style={{ color: '#7A8BA7' }}>
            Define your HTF bias every week before trading
          </p>
        </div>
        <Link
          href="/weekly-analysis/new"
          className="font-body rounded-lg px-5 py-2 text-[13px] font-medium transition-all duration-200"
          style={{
            background: 'linear-gradient(135deg, #00D4AA 0%, #3B82F6 100%)',
            color: '#FFFFFF',
          }}
        >
          + New Analysis
        </Link>
      </div>

      {analyses.length === 0 && (
        <div
          className="text-center py-16 rounded-xl"
          style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="font-body text-lg" style={{ color: '#7A8BA7' }}>
            No weekly analyses yet
          </p>
          <p className="font-body text-sm mt-1" style={{ color: '#4A5568' }}>
            Start your week right by analyzing the higher timeframe
          </p>
        </div>
      )}

      <div className="grid gap-4">
        {analyses.map((a) => (
          <Link
            key={a.id}
            href={`/weekly-analysis/${a.id}`}
            className="rounded-xl p-6 hover:border-[#00D4AA]/30 transition-all duration-200 block"
            style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span
                    className="font-display font-medium"
                    style={{ color: '#E8ECF1', letterSpacing: '-0.02em' }}
                  >
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
                <p className="font-body text-sm" style={{ color: '#7A8BA7' }}>
                  {a.biasReasoning}
                </p>
                <div
                  className="flex items-center gap-4 text-xs font-mono"
                  style={{ color: '#4A5568' }}
                >
                  <span>Support: {a.weeklySupport}</span>
                  <span>Resistance: {a.weeklyResistance}</span>
                  <span className="font-body">{a._count.dailyPlans} daily plans</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
