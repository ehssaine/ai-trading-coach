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

  if (loading)
    return (
      <div className="font-body text-center py-12" style={{ color: '#7A8BA7' }}>
        Loading...
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="font-display text-2xl font-semibold"
            style={{ color: '#E8ECF1', letterSpacing: '-0.02em' }}
          >
            Daily Plans
          </h1>
          <p className="font-body text-sm mt-1" style={{ color: '#7A8BA7' }}>
            Plan every day before the market opens
          </p>
        </div>
        <Link
          href="/daily-plans/new"
          className="font-body rounded-xl px-5 py-2 text-[13px] font-medium transition-all duration-200 text-white"
          style={{ background: 'linear-gradient(135deg, #00D4AA 0%, #3B82F6 100%)' }}
        >
          + New Daily Plan
        </Link>
      </div>

      {plans.length === 0 && (
        <div
          className="text-center py-16 rounded-xl"
          style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="font-body text-lg" style={{ color: '#7A8BA7' }}>
            No daily plans yet
          </p>
          <p className="font-body text-sm mt-1" style={{ color: '#4A5568' }}>
            Plan your day before taking any trades
          </p>
        </div>
      )}

      <div className="grid gap-3">
        {plans.map((plan) => (
          <Link
            key={plan.id}
            href={`/daily-plans/${plan.id}`}
            className="rounded-xl p-5 hover:border-[#00D4AA]/30 transition-all duration-200 block"
            style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-body font-medium" style={{ color: '#E8ECF1' }}>
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
                  <span
                    className="text-xs font-medium px-2.5 py-0.5 rounded-full"
                    style={{ color: '#EF4444', background: 'rgba(239,68,68,0.1)' }}
                  >
                    Counter-HTF
                  </span>
                )}
                {plan.followedPlan === true && (
                  <span className="text-xs font-body" style={{ color: '#00D4AA' }}>Plan followed</span>
                )}
                {plan.followedPlan === false && (
                  <span className="text-xs font-body" style={{ color: '#EF4444' }}>Deviated from plan</span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs" style={{ color: '#4A5568' }}>
                {plan.emotionalState && (
                  <span className="font-body">{plan.emotionalState}</span>
                )}
                <span className="font-mono">{plan._count.trades} trades</span>
              </div>
            </div>
            <p className="font-body text-sm mt-2 line-clamp-1" style={{ color: '#4A5568' }}>
              {plan.tradePlan}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
