"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

  if (loading) return <div className="text-gray-400 text-center py-12">Loading...</div>;
  if (!trade) return <div className="text-red-400 text-center py-12">Not found</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{trade.pair}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border ${getBiasBg(trade.direction === "LONG" ? "BULLISH" : "BEARISH")}`}>
              {trade.direction}
            </span>
            <span className={`text-sm px-3 py-1 rounded-full ${
              trade.status === "CLOSED_WIN" ? "bg-emerald-500/20 text-emerald-400" :
              trade.status === "CLOSED_LOSS" ? "bg-red-500/20 text-red-400" :
              trade.status === "OPEN" ? "bg-blue-500/20 text-blue-400" :
              "bg-gray-500/20 text-gray-400"
            }`}>
              {trade.status === "OPEN" ? "OPEN" : trade.status.replace("CLOSED_", "")}
            </span>
            {!trade.alignedWithHTF && (
              <span className="text-red-400 text-sm font-medium bg-red-500/10 px-2 py-1 rounded">
                Counter-HTF Trade
              </span>
            )}
            <span className="text-gray-500 text-sm">{trade.setupType.replace(/_/g, " ")}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setEditing(!editing)}
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            {editing ? "Cancel" : "Edit"}
          </button>
          <button onClick={handleDelete} className="text-red-400 hover:text-red-300 text-sm">
            Delete
          </button>
        </div>
      </div>

      {/* Trade Numbers */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500">Entry</p>
          <p className="text-white font-bold text-lg">{trade.entryPrice}</p>
          <p className="text-gray-500 text-xs">{formatDateTime(trade.entryTime)}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500">Stop Loss</p>
          <p className="text-red-400 font-bold text-lg">{trade.stopLoss}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500">Take Profit</p>
          <p className="text-emerald-400 font-bold text-lg">{trade.takeProfit}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500">Risk:Reward</p>
          <p className="text-white font-bold text-lg">1:{trade.riskRewardRatio}</p>
        </div>
      </div>

      {trade.exitPrice && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500">Exit Price</p>
            <p className="text-white font-bold text-lg">{trade.exitPrice}</p>
            {trade.exitTime && <p className="text-gray-500 text-xs">{formatDateTime(trade.exitTime)}</p>}
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500">P&L</p>
            <p className={`font-bold text-lg ${(trade.pnl || 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {(trade.pnl || 0) >= 0 ? "+" : ""}{trade.pnl || 0}
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500">P&L %</p>
            <p className={`font-bold text-lg ${(trade.pnlPercentage || 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {(trade.pnlPercentage || 0) >= 0 ? "+" : ""}{trade.pnlPercentage || 0}%
            </p>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500">Position Size</p>
            <p className="text-white font-bold text-lg">{trade.positionSize}</p>
          </div>
        </div>
      )}

      {/* Alignment Info */}
      {trade.dailyPlan && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Alignment Check</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Daily Bias</p>
              <p className={`font-medium ${getBiasBg(trade.dailyPlan.dailyBias).split(" ")[1]}`}>
                {trade.dailyPlan.dailyBias}
              </p>
            </div>
            {trade.dailyPlan.weeklyAnalysis && (
              <div>
                <p className="text-xs text-gray-500">Weekly HTF Bias</p>
                <p className={`font-medium ${getBiasBg(trade.dailyPlan.weeklyAnalysis.htfBias).split(" ")[1]}`}>
                  {trade.dailyPlan.weeklyAnalysis.htfBias}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Journal Entries */}
      <div className="space-y-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Entry Reason</h3>
          <p className="text-gray-300 whitespace-pre-wrap">{trade.entryReason}</p>
        </div>

        {trade.exitReason && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Exit Reason</h3>
            <p className="text-gray-300 whitespace-pre-wrap">{trade.exitReason}</p>
          </div>
        )}

        {trade.mistakes && (
          <div className="bg-gray-900 border border-red-500/20 rounded-xl p-6">
            <h3 className="text-sm font-medium text-red-400 uppercase tracking-wider mb-2">Mistakes</h3>
            <p className="text-gray-300 whitespace-pre-wrap">{trade.mistakes}</p>
          </div>
        )}

        {trade.lessonsLearned && (
          <div className="bg-gray-900 border border-blue-500/20 rounded-xl p-6">
            <h3 className="text-sm font-medium text-blue-400 uppercase tracking-wider mb-2">Lessons Learned</h3>
            <p className="text-gray-300 whitespace-pre-wrap">{trade.lessonsLearned}</p>
          </div>
        )}

        {(trade.emotionalState || trade.rating) && (
          <div className="flex gap-4">
            {trade.emotionalState && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex-1">
                <p className="text-xs text-gray-500">Emotional State</p>
                <p className="text-white font-medium mt-1">{trade.emotionalState}</p>
              </div>
            )}
            {trade.rating && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex-1">
                <p className="text-xs text-gray-500">Quality Rating</p>
                <p className="text-white font-medium mt-1">{trade.rating}/5</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Form */}
      {editing && (
        <div className="bg-gray-900 border border-blue-500/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Update Trade</h3>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {TRADE_STATUS.map((s) => (
                    <option key={s} value={s}>{s.replace("CLOSED_", "").replace("_", " ")}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Exit Price</label>
                <input
                  type="number"
                  step="any"
                  value={editForm.exitPrice}
                  onChange={(e) => setEditForm({ ...editForm, exitPrice: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Exit Time</label>
                <input
                  type="datetime-local"
                  value={editForm.exitTime}
                  onChange={(e) => setEditForm({ ...editForm, exitTime: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">P&L ($)</label>
                <input
                  type="number"
                  step="any"
                  value={editForm.pnl}
                  onChange={(e) => setEditForm({ ...editForm, pnl: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Emotional State</label>
                <select
                  value={editForm.emotionalState}
                  onChange={(e) => setEditForm({ ...editForm, emotionalState: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {EMOTIONAL_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Exit Reason</label>
              <textarea
                value={editForm.exitReason}
                onChange={(e) => setEditForm({ ...editForm, exitReason: e.target.value })}
                rows={2}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Mistakes</label>
              <textarea
                value={editForm.mistakes}
                onChange={(e) => setEditForm({ ...editForm, mistakes: e.target.value })}
                rows={2}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Lessons Learned</label>
              <textarea
                value={editForm.lessonsLearned}
                onChange={(e) => setEditForm({ ...editForm, lessonsLearned: e.target.value })}
                rows={2}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Rating (1-5)</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setEditForm({ ...editForm, rating: String(r) })}
                    className={`w-10 h-10 rounded-lg font-bold transition-colors ${
                      editForm.rating === String(r)
                        ? "bg-blue-600 text-white"
                        : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
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
