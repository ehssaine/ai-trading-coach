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

  if (loading) return <div style={{ color: '#4A5568' }} className="font-body text-center py-12">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold font-display" style={{ color: '#E8ECF1', letterSpacing: '-0.02em' }}>Trade Journal</h1>
          <p className="text-sm font-body mt-1" style={{ color: '#7A8BA7' }}>
            Every trade tells a story. Learn from each one.
          </p>
        </div>
        <Link
          href="/journal/new"
          className="text-white font-semibold font-body rounded-lg px-5 py-2 text-[13px] transition-all duration-200 hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #00D4AA 0%, #3B82F6 100%)' }}
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
            className={`px-4 py-1.5 rounded-lg text-[12px] font-medium font-body transition-all duration-200 ${
              filter === f
                ? "text-white font-semibold"
                : "hover:opacity-80"
            }`}
            style={
              filter === f
                ? { background: 'linear-gradient(135deg, #00D4AA 0%, #3B82F6 100%)' }
                : { background: '#1A1F2E', color: '#7A8BA7' }
            }
          >
            {f === "ALL" ? "All" : f.replace("CLOSED_", "")}
          </button>
        ))}
      </div>

      {trades.length === 0 && (
        <div className="text-center py-16 rounded-xl" style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-lg font-display" style={{ color: '#7A8BA7', letterSpacing: '-0.02em' }}>No trades found</p>
          <p className="text-sm font-body mt-1" style={{ color: '#4A5568' }}>
            Start logging your trades to build your journal
          </p>
        </div>
      )}

      <div className="grid gap-3">
        {trades.map((trade) => (
          <Link
            key={trade.id}
            href={`/journal/${trade.id}`}
            className="rounded-xl p-5 transition-all duration-200 block hover:border-[#00D4AA]/30"
            style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-bold font-display" style={{ color: '#E8ECF1' }}>{trade.pair}</span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getBiasBg(
                    trade.direction === "LONG" ? "BULLISH" : "BEARISH"
                  )}`}
                >
                  {trade.direction}
                </span>
                <span
                  className="text-xs font-body px-2.5 py-0.5 rounded-full font-medium"
                  style={{
                    background: '#1A1F2E',
                    color: trade.status === "CLOSED_WIN"
                      ? '#00D4AA'
                      : trade.status === "CLOSED_LOSS"
                      ? '#EF4444'
                      : trade.status === "OPEN"
                      ? '#3B82F6'
                      : '#7A8BA7'
                  }}
                >
                  {trade.status === "OPEN" ? "OPEN" : trade.status.replace("CLOSED_", "")}
                </span>
                <span className="text-xs font-body" style={{ color: '#4A5568' }}>{trade.setupType.replace("_", " ")}</span>
                {!trade.alignedWithHTF && (
                  <span className="text-xs font-medium font-body px-2.5 py-0.5 rounded-full" style={{ color: '#EF4444', background: '#1A1F2E' }}>
                    Counter-HTF
                  </span>
                )}
              </div>
              <div className="text-right">
                {trade.pnl !== null && (
                  <span
                    className="font-bold font-mono"
                    style={{ color: trade.pnl >= 0 ? '#00D4AA' : '#EF4444' }}
                  >
                    {trade.pnl >= 0 ? "+" : ""}
                    {trade.pnl}
                  </span>
                )}
                <p className="text-xs font-body mt-0.5" style={{ color: '#4A5568' }}>
                  {formatDateTime(trade.entryTime)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-2 text-xs font-mono" style={{ color: '#4A5568' }}>
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
