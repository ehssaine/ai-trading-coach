"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatDateTime, getBiasBg } from "@/lib/utils";

interface Trade {
  id: string;
  pair: string;
  direction: string;
  entryPrice: number;
  exitPrice: number | null;
  status: string;
  pnl: number | null;
  pnlPercentage: number | null;
  riskRewardRatio: number;
  entryTime: string;
  setupType: string;
  alignedWithHTF: boolean;
  alignedWithDaily: boolean;
  rating: number | null;
  emotionalState: string | null;
}

export default function JournalPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    const params = filter !== "ALL" ? `?status=${filter}` : "";
    fetch(`/api/trades${params}`)
      .then((r) => r.json())
      .then((data) => setTrades(data.trades || []))
      .finally(() => setLoading(false));
  }, [filter]);

  if (loading) return <div className="text-zinc-400 text-center py-12">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Trade Journal</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Every trade tells a story. Learn from each one.
          </p>
        </div>
        <Link
          href="/journal/new"
          className="bg-white hover:bg-white/90 text-black px-5 py-2 rounded-full text-[13px] font-medium transition-colors"
        >
          + Log Trade
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {["ALL", "OPEN", "CLOSED_WIN", "CLOSED_LOSS", "CLOSED_BE"].map((f) => (
          <button
            key={f}
            onClick={() => { setLoading(true); setFilter(f); }}
            className={`px-4 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
              filter === f
                ? "bg-white text-black"
                : "bg-white/10 text-zinc-400 hover:bg-white/15"
            }`}
          >
            {f === "ALL" ? "All" : f.replace("CLOSED_", "")}
          </button>
        ))}
      </div>

      {trades.length === 0 && (
        <div className="text-center py-16 bg-[#1c1c1e] rounded-2xl">
          <p className="text-zinc-400 text-lg">No trades found</p>
          <p className="text-zinc-500 text-sm mt-1">
            Start logging your trades to build your journal
          </p>
        </div>
      )}

      <div className="grid gap-3">
        {trades.map((trade) => (
          <Link
            key={trade.id}
            href={`/journal/${trade.id}`}
            className="bg-[#1c1c1e] rounded-2xl p-5 hover:bg-white/[0.06] transition-colors block"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-white font-bold">{trade.pair}</span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getBiasBg(
                    trade.direction === "LONG" ? "BULLISH" : "BEARISH"
                  )}`}
                >
                  {trade.direction}
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                    trade.status === "CLOSED_WIN"
                      ? "bg-white/10 text-[#30d158]"
                      : trade.status === "CLOSED_LOSS"
                      ? "bg-white/10 text-[#ff453a]"
                      : trade.status === "OPEN"
                      ? "bg-white/10 text-[#0a84ff]"
                      : "bg-white/10 text-zinc-400"
                  }`}
                >
                  {trade.status === "OPEN" ? "OPEN" : trade.status.replace("CLOSED_", "")}
                </span>
                <span className="text-zinc-500 text-xs">{trade.setupType.replace("_", " ")}</span>
                {!trade.alignedWithHTF && (
                  <span className="text-[#ff453a] text-xs font-medium bg-white/10 px-2.5 py-0.5 rounded-full">
                    Counter-HTF
                  </span>
                )}
              </div>
              <div className="text-right">
                {trade.pnl !== null && (
                  <span
                    className={`font-bold ${
                      trade.pnl >= 0 ? "text-[#30d158]" : "text-[#ff453a]"
                    }`}
                  >
                    {trade.pnl >= 0 ? "+" : ""}
                    {trade.pnl}
                  </span>
                )}
                <p className="text-zinc-500 text-xs mt-0.5">
                  {formatDateTime(trade.entryTime)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500">
              <span>Entry: {trade.entryPrice}</span>
              {trade.exitPrice && <span>Exit: {trade.exitPrice}</span>}
              <span>RR: 1:{trade.riskRewardRatio}</span>
              {trade.rating && <span>Rating: {trade.rating}/5</span>}
              {trade.emotionalState && <span>{trade.emotionalState}</span>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
