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

  if (loading) return <div className="text-gray-400 text-center py-12">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Trade Journal</h1>
          <p className="text-gray-400 text-sm mt-1">
            Every trade tells a story. Learn from each one.
          </p>
        </div>
        <Link
          href="/journal/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
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
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === f
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            {f === "ALL" ? "All" : f.replace("CLOSED_", "")}
          </button>
        ))}
      </div>

      {trades.length === 0 && (
        <div className="text-center py-16 bg-gray-900 border border-gray-800 rounded-xl">
          <p className="text-gray-500 text-lg">No trades found</p>
          <p className="text-gray-600 text-sm mt-1">
            Start logging your trades to build your journal
          </p>
        </div>
      )}

      <div className="grid gap-3">
        {trades.map((trade) => (
          <Link
            key={trade.id}
            href={`/journal/${trade.id}`}
            className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-5 transition-colors block"
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
                  className={`text-xs px-2 py-0.5 rounded ${
                    trade.status === "CLOSED_WIN"
                      ? "bg-emerald-500/20 text-emerald-400"
                      : trade.status === "CLOSED_LOSS"
                      ? "bg-red-500/20 text-red-400"
                      : trade.status === "OPEN"
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-gray-500/20 text-gray-400"
                  }`}
                >
                  {trade.status === "OPEN" ? "OPEN" : trade.status.replace("CLOSED_", "")}
                </span>
                <span className="text-gray-500 text-xs">{trade.setupType.replace("_", " ")}</span>
                {!trade.alignedWithHTF && (
                  <span className="text-red-400 text-xs font-medium bg-red-500/10 px-2 py-0.5 rounded">
                    Counter-HTF
                  </span>
                )}
              </div>
              <div className="text-right">
                {trade.pnl !== null && (
                  <span
                    className={`font-bold ${
                      trade.pnl >= 0 ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {trade.pnl >= 0 ? "+" : ""}
                    {trade.pnl}
                  </span>
                )}
                <p className="text-gray-500 text-xs mt-0.5">
                  {formatDateTime(trade.entryTime)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
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
