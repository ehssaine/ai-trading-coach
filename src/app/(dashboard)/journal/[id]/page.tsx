"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { formatDateTime, getBiasBg, EMOTIONAL_STATES, TRADE_STATUS } from "@/lib/utils";

interface Trade {
  id: string;
  pair: string;
  direction: string;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  positionSize: number;
  riskRewardRatio: number;
  entryTime: string;
  exitTime: string | null;
  exitPrice: number | null;
  status: string;
  alignedWithHTF: boolean;
  alignedWithDaily: boolean;
  setupType: string;
  pnl: number | null;
  pnlPercentage: number | null;
  entryReason: string;
  exitReason: string | null;
  mistakes: string | null;
  lessonsLearned: string | null;
  emotionalState: string | null;
  rating: number | null;
  dailyPlan: {
    dailyBias: string;
    date: string;
    weeklyAnalysis: { htfBias: string; marketStructure: string } | null;
  } | null;
}

export default function TradeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [trade, setTrade] = useState<Trade | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    exitPrice: "",
    exitTime: "",
    status: "",
    pnl: "",
    pnlPercentage: "",
    exitReason: "",
    mistakes: "",
    lessonsLearned: "",
    emotionalState: "",
    rating: "",
  });

  useEffect(() => {
    fetch(`/api/trades/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setTrade(data.trade);
        if (data.trade) {
          setEditForm({
            exitPrice: data.trade.exitPrice?.toString() || "",
            exitTime: data.trade.exitTime?.slice(0, 16) || "",
            status: data.trade.status,
            pnl: data.trade.pnl?.toString() || "",
            pnlPercentage: data.trade.pnlPercentage?.toString() || "",
            exitReason: data.trade.exitReason || "",
            mistakes: data.trade.mistakes || "",
            lessonsLearned: data.trade.lessonsLearned || "",
            emotionalState: data.trade.emotionalState || "CALM",
            rating: data.trade.rating?.toString() || "",
          });
        }
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch(`/api/trades/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        exitPrice: editForm.exitPrice ? parseFloat(editForm.exitPrice) : null,
        exitTime: editForm.exitTime || null,
        status: editForm.status,
        pnl: editForm.pnl ? parseFloat(editForm.pnl) : null,
        pnlPercentage: editForm.pnlPercentage ? parseFloat(editForm.pnlPercentage) : null,
        exitReason: editForm.exitReason || null,
        mistakes: editForm.mistakes || null,
        lessonsLearned: editForm.lessonsLearned || null,
        emotionalState: editForm.emotionalState || null,
        rating: editForm.rating ? parseInt(editForm.rating) : null,
      }),
    });
    setSaving(false);
    setEditing(false);
    // Reload
    const res = await fetch(`/api/trades/${params.id}`);
    const data = await res.json();
    setTrade(data.trade);
  }

  async function handleDelete() {
    if (!confirm("Delete this trade?")) return;
    await fetch(`/api/trades/${params.id}`, { method: "DELETE" });
    router.push("/journal");
  }

  if (loading) return <div style={{ color: '#4A5568' }} className="font-body text-center py-12">Loading...</div>;
  if (!trade) return <div style={{ color: '#EF4444' }} className="font-body text-center py-12">Not found</div>;

  const inputClass = "w-full rounded-xl px-4 py-3 font-body focus:outline-none focus:ring-1 focus:ring-[#00D4AA]/30 transition-all duration-200";
  const inputStyle = { background: '#1A1F2E', border: '1px solid rgba(255,255,255,0.06)', color: '#E8ECF1' };
  const labelClass = "font-body block text-xs font-medium uppercase tracking-wider mb-1.5";
  const labelStyle = { color: '#7A8BA7' };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back Link */}
      <Link href="/journal" className="text-[#3B82F6] text-sm font-body hover:opacity-80 transition-all duration-200">
        &larr; Back to Journal
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold font-display" style={{ color: '#E8ECF1', letterSpacing: '-0.02em' }}>{trade.pair}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border ${getBiasBg(trade.direction === "LONG" ? "BULLISH" : "BEARISH")}`}>
              {trade.direction}
            </span>
            <span className="text-sm font-body px-3 py-1 rounded-full" style={{
              background: '#1A1F2E',
              color: trade.status === "CLOSED_WIN" ? '#00D4AA' :
              trade.status === "CLOSED_LOSS" ? '#EF4444' :
              trade.status === "OPEN" ? '#3B82F6' :
              '#7A8BA7'
            }}>
              {trade.status === "OPEN" ? "OPEN" : trade.status.replace("CLOSED_", "")}
            </span>
            {!trade.alignedWithHTF && (
              <span className="text-sm font-medium font-body px-2 py-1 rounded-lg" style={{ color: '#EF4444', background: 'rgba(239,68,68,0.1)' }}>
                Counter-HTF Trade
              </span>
            )}
            <span className="text-sm font-body" style={{ color: '#4A5568' }}>{trade.setupType.replace(/_/g, " ")}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setEditing(!editing)}
            className="text-[13px] font-body font-medium transition-all duration-200 hover:opacity-80"
            style={{ color: '#3B82F6' }}
          >
            {editing ? "Cancel" : "Edit"}
          </button>
          <button
            onClick={handleDelete}
            className="text-[13px] font-body font-medium transition-all duration-200 hover:opacity-80"
            style={{ color: '#EF4444' }}
          >
            Delete
          </button>
        </div>
      </div>

      {/* Trade Numbers */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl p-4" style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-[11px] font-body font-medium uppercase tracking-wider" style={{ color: '#4A5568' }}>Entry</p>
          <p className="font-semibold font-mono text-lg mt-1" style={{ color: '#E8ECF1' }}>{trade.entryPrice}</p>
          <p className="text-[11px] font-body" style={{ color: '#4A5568' }}>{formatDateTime(trade.entryTime)}</p>
        </div>
        <div className="rounded-xl p-4" style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-[11px] font-body font-medium uppercase tracking-wider" style={{ color: '#4A5568' }}>Stop Loss</p>
          <p className="font-semibold font-mono text-lg mt-1" style={{ color: '#EF4444' }}>{trade.stopLoss}</p>
        </div>
        <div className="rounded-xl p-4" style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-[11px] font-body font-medium uppercase tracking-wider" style={{ color: '#4A5568' }}>Take Profit</p>
          <p className="font-semibold font-mono text-lg mt-1" style={{ color: '#00D4AA' }}>{trade.takeProfit}</p>
        </div>
        <div className="rounded-xl p-4" style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-[11px] font-body font-medium uppercase tracking-wider" style={{ color: '#4A5568' }}>Risk:Reward</p>
          <p className="font-semibold font-mono text-lg mt-1" style={{ color: '#E8ECF1' }}>1:{trade.riskRewardRatio}</p>
        </div>
      </div>

      {trade.exitPrice && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-xl p-4" style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[11px] font-body font-medium uppercase tracking-wider" style={{ color: '#4A5568' }}>Exit Price</p>
            <p className="font-semibold font-mono text-lg mt-1" style={{ color: '#E8ECF1' }}>{trade.exitPrice}</p>
            {trade.exitTime && <p className="text-[11px] font-body" style={{ color: '#4A5568' }}>{formatDateTime(trade.exitTime)}</p>}
          </div>
          <div className="rounded-xl p-4" style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[11px] font-body font-medium uppercase tracking-wider" style={{ color: '#4A5568' }}>P&L</p>
            <p className="font-semibold font-mono text-lg mt-1" style={{ color: (trade.pnl || 0) >= 0 ? '#00D4AA' : '#EF4444' }}>
              {(trade.pnl || 0) >= 0 ? "+" : ""}{trade.pnl || 0}
            </p>
          </div>
          <div className="rounded-xl p-4" style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[11px] font-body font-medium uppercase tracking-wider" style={{ color: '#4A5568' }}>P&L %</p>
            <p className="font-semibold font-mono text-lg mt-1" style={{ color: (trade.pnlPercentage || 0) >= 0 ? '#00D4AA' : '#EF4444' }}>
              {(trade.pnlPercentage || 0) >= 0 ? "+" : ""}{trade.pnlPercentage || 0}%
            </p>
          </div>
          <div className="rounded-xl p-4" style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[11px] font-body font-medium uppercase tracking-wider" style={{ color: '#4A5568' }}>Position Size</p>
            <p className="font-semibold font-mono text-lg mt-1" style={{ color: '#E8ECF1' }}>{trade.positionSize}</p>
          </div>
        </div>
      )}

      {/* Alignment Info */}
      {trade.dailyPlan && (
        <div className="rounded-xl p-6" style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="text-[11px] font-body font-medium uppercase tracking-wider mb-3" style={{ color: '#4A5568' }}>Alignment Check</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[11px] font-body font-medium uppercase tracking-wider" style={{ color: '#4A5568' }}>Daily Bias</p>
              <p className={`font-medium font-body ${getBiasBg(trade.dailyPlan.dailyBias).split(" ")[1]}`}>
                {trade.dailyPlan.dailyBias}
              </p>
            </div>
            {trade.dailyPlan.weeklyAnalysis && (
              <div>
                <p className="text-[11px] font-body font-medium uppercase tracking-wider" style={{ color: '#4A5568' }}>Weekly HTF Bias</p>
                <p className={`font-medium font-body ${getBiasBg(trade.dailyPlan.weeklyAnalysis.htfBias).split(" ")[1]}`}>
                  {trade.dailyPlan.weeklyAnalysis.htfBias}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Journal Entries */}
      <div className="space-y-4">
        <div className="rounded-xl p-6" style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="text-[11px] font-body font-medium uppercase tracking-wider mb-2" style={{ color: '#4A5568' }}>Entry Reason</h3>
          <p className="font-body whitespace-pre-wrap" style={{ color: '#7A8BA7' }}>{trade.entryReason}</p>
        </div>

        {trade.exitReason && (
          <div className="rounded-xl p-6" style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 className="text-[11px] font-body font-medium uppercase tracking-wider mb-2" style={{ color: '#4A5568' }}>Exit Reason</h3>
            <p className="font-body whitespace-pre-wrap" style={{ color: '#7A8BA7' }}>{trade.exitReason}</p>
          </div>
        )}

        {trade.mistakes && (
          <div className="rounded-xl p-6" style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 className="text-[11px] font-body font-medium uppercase tracking-wider mb-2" style={{ color: '#EF4444' }}>Mistakes</h3>
            <p className="font-body whitespace-pre-wrap" style={{ color: '#7A8BA7' }}>{trade.mistakes}</p>
          </div>
        )}

        {trade.lessonsLearned && (
          <div className="rounded-xl p-6" style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 className="text-[11px] font-body font-medium uppercase tracking-wider mb-2" style={{ color: '#3B82F6' }}>Lessons Learned</h3>
            <p className="font-body whitespace-pre-wrap" style={{ color: '#7A8BA7' }}>{trade.lessonsLearned}</p>
          </div>
        )}

        {(trade.emotionalState || trade.rating) && (
          <div className="flex gap-4">
            {trade.emotionalState && (
              <div className="rounded-xl p-4 flex-1" style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-[11px] font-body font-medium uppercase tracking-wider" style={{ color: '#4A5568' }}>Emotional State</p>
                <p className="font-medium font-body mt-1" style={{ color: '#E8ECF1' }}>{trade.emotionalState}</p>
              </div>
            )}
            {trade.rating && (
              <div className="rounded-xl p-4 flex-1" style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-[11px] font-body font-medium uppercase tracking-wider" style={{ color: '#4A5568' }}>Quality Rating</p>
                <p className="font-medium font-mono mt-1" style={{ color: '#E8ECF1' }}>{trade.rating}/5</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Form */}
      {editing && (
        <div className="rounded-xl p-6" style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 className="text-lg font-semibold font-display mb-4" style={{ color: '#E8ECF1', letterSpacing: '-0.02em' }}>Update Trade</h3>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass} style={labelStyle}>Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className={inputClass}
                  style={inputStyle}
                >
                  {TRADE_STATUS.map((s) => (
                    <option key={s} value={s}>{s.replace("CLOSED_", "").replace("_", " ")}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass} style={labelStyle}>Exit Price</label>
                <input
                  type="number"
                  step="any"
                  value={editForm.exitPrice}
                  onChange={(e) => setEditForm({ ...editForm, exitPrice: e.target.value })}
                  className={`${inputClass} font-mono`}
                  style={inputStyle}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClass} style={labelStyle}>Exit Time</label>
                <input
                  type="datetime-local"
                  value={editForm.exitTime}
                  onChange={(e) => setEditForm({ ...editForm, exitTime: e.target.value })}
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className={labelClass} style={labelStyle}>P&L ($)</label>
                <input
                  type="number"
                  step="any"
                  value={editForm.pnl}
                  onChange={(e) => setEditForm({ ...editForm, pnl: e.target.value })}
                  className={`${inputClass} font-mono`}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className={labelClass} style={labelStyle}>Emotional State</label>
                <select
                  value={editForm.emotionalState}
                  onChange={(e) => setEditForm({ ...editForm, emotionalState: e.target.value })}
                  className={inputClass}
                  style={inputStyle}
                >
                  {EMOTIONAL_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>Exit Reason</label>
              <textarea
                value={editForm.exitReason}
                onChange={(e) => setEditForm({ ...editForm, exitReason: e.target.value })}
                rows={2}
                className={`${inputClass} resize-none`}
                style={inputStyle}
              />
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>Mistakes</label>
              <textarea
                value={editForm.mistakes}
                onChange={(e) => setEditForm({ ...editForm, mistakes: e.target.value })}
                rows={2}
                className={`${inputClass} resize-none`}
                style={inputStyle}
              />
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>Lessons Learned</label>
              <textarea
                value={editForm.lessonsLearned}
                onChange={(e) => setEditForm({ ...editForm, lessonsLearned: e.target.value })}
                rows={2}
                className={`${inputClass} resize-none`}
                style={inputStyle}
              />
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>Rating (1-5)</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setEditForm({ ...editForm, rating: String(r) })}
                    className="w-10 h-10 rounded-xl font-medium font-mono transition-all duration-200"
                    style={
                      editForm.rating === String(r)
                        ? { background: 'linear-gradient(135deg, #00D4AA 0%, #3B82F6 100%)', color: '#FFFFFF' }
                        : { background: '#1A1F2E', color: '#7A8BA7', border: '1px solid rgba(255,255,255,0.06)' }
                    }
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-lg text-[13px] font-medium font-body px-5 py-2.5 transition-all duration-200 hover:opacity-80"
                style={{ border: '1px solid rgba(0,212,170,0.3)', color: '#00D4AA' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="text-white font-semibold font-body rounded-lg text-[13px] px-5 py-2.5 hover:opacity-90 disabled:opacity-50 transition-all duration-200"
                style={{ background: 'linear-gradient(135deg, #00D4AA 0%, #3B82F6 100%)' }}
              >
                {saving ? "Saving..." : "Update Trade"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
