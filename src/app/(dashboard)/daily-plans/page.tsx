"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDate, getBiasBg } from "@/lib/utils";

interface DailyPlan {
  id: string;
  date: string;
  dailyBias: string;
  dailyMarketStructure: string;
  alignedWithHTF: boolean;
  followedPlan: boolean | null;
  emotionalState: string | null;
  tradePlan: string;
  weeklyAnalysis: { htfBias: string; marketStructure: string } | null;
  _count: { trades: number };
}

export default function DailyPlansListPage() {
  const [plans, setPlans] = useState<DailyPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/daily-plans")
      .then((r) => r.json())
      .then((data) => setPlans(data.plans || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-zinc-400 text-center py-12">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Daily Plans</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Plan every day before the market opens
          </p>
        </div>
        <Link
          href="/daily-plans/new"
          className="bg-white hover:bg-white/90 text-black px-5 py-2 rounded-full text-[13px] font-medium transition-colors"
        >
          + New Daily Plan
        </Link>
      </div>

      {plans.length === 0 && (
        <div className="text-center py-16 bg-[#1c1c1e] rounded-2xl">
          <p className="text-zinc-400 text-lg">No daily plans yet</p>
          <p className="text-zinc-500 text-sm mt-1">
            Plan your day before taking any trades
          </p>
        </div>
      )}

      <div className="grid gap-3">
        {plans.map((plan) => (
          <Link
            key={plan.id}
            href={`/daily-plans/${plan.id}`}
            className="bg-[#1c1c1e] rounded-2xl p-5 hover:bg-white/[0.06] transition-colors block"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-white font-medium">
                  {formatDate(plan.date)}
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getBiasBg(
                    plan.dailyBias
                  )}`}
                >
                  {plan.dailyBias}
                </span>
                {!plan.alignedWithHTF && (
                  <span className="text-[#ff453a] text-xs font-medium bg-white/10 px-2.5 py-0.5 rounded-full">
                    Counter-HTF
                  </span>
                )}
                {plan.followedPlan === true && (
                  <span className="text-[#30d158] text-xs">Plan followed</span>
                )}
                {plan.followedPlan === false && (
                  <span className="text-[#ff453a] text-xs">Deviated from plan</span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-500">
                {plan.emotionalState && (
                  <span>{plan.emotionalState}</span>
                )}
                <span>{plan._count.trades} trades</span>
              </div>
            </div>
            <p className="text-zinc-500 text-sm mt-2 line-clamp-1">
              {plan.tradePlan}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
