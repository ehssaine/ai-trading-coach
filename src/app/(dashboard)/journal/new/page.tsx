"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  BIAS_OPTIONS,
  SETUP_TYPES,
  EMOTIONAL_STATES,
  TRADE_STATUS,
} from "@/lib/utils";
import BiasWarning from "@/components/BiasWarning";

interface WeeklyAnalysis {
  id: string;
  htfBias: string;
}

interface DailyPlan {
  id: string;
  date: string;
  dailyBias: string;
  weeklyAnalysis: { htfBias: string } | null;
}

export default function NewTradePageWrapper() {
  return (
    <Suspense fallback={<div className="font-body text-center py-12" style={{ color: '#4A5568' }}>Loading...</div>}>
      <NewTradePage />
    </Suspense>
  );
}

function NewTradePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dailyPlans, setDailyPlans] = useState<DailyPlan[]>([]);
  const [currentHTFBias, setCurrentHTFBias] = useState("NEUTRAL");

  const [form, setForm] = useState({
    dailyPlanId: searchParams.get("dailyPlanId") || "",
    pair: "",
    direction: "LONG",
    entryPrice: "",
    stopLoss: "",
    takeProfit: "",
    positionSize: "",
    riskRewardRatio: "",
    entryTime: new Date().toISOString().slice(0, 16),
    exitTime: "",
    exitPrice: "",
    status: "OPEN",
    alignedWithHTF: true,
    alignedWithDaily: true,
    setupType: "BOS_RETEST",
    pnl: "",
    pnlPercentage: "",
    entryReason: "",
    exitReason: "",
    mistakes: "",
    lessonsLearned: "",
    emotionalState: "CALM",
    rating: "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/daily-plans").then((r) => r.json()),
      fetch("/api/weekly-analysis").then((r) => r.json()),
    ]).then(([plansData, weeklyData]) => {
      setDailyPlans(plansData.plans || []);
      if (weeklyData.analyses?.length > 0) {
        setCurrentHTFBias(weeklyData.analyses[0].htfBias);
      }
      // Auto-select the daily plan from URL param
      const planId = searchParams.get("dailyPlanId");
      if (planId) {
        const plan = (plansData.plans || []).find((p: DailyPlan) => p.id === planId);
        if (plan?.weeklyAnalysis) {
          setCurrentHTFBias(plan.weeklyAnalysis.htfBias);
        }
      }
    });
  }, [searchParams]);

  function updateForm(field: string, value: string | number | boolean) {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "direction") {
        updated.alignedWithHTF = value === currentHTFBias || currentHTFBias === "NEUTRAL";
      }
      if (field === "dailyPlanId") {
        const plan = dailyPlans.find((p) => p.id === value);
        if (plan) {
          updated.alignedWithDaily = updated.direction === plan.dailyBias;
          if (plan.weeklyAnalysis) {
            setCurrentHTFBias(plan.weeklyAnalysis.htfBias);
            updated.alignedWithHTF = updated.direction === plan.weeklyAnalysis.htfBias || plan.weeklyAnalysis.htfBias === "NEUTRAL";
          }
        }
      }
      // Auto-calculate RR when entry, SL, and TP are set
      if (["entryPrice", "stopLoss", "takeProfit"].includes(field)) {
        const entry = parseFloat(field === "entryPrice" ? String(value) : updated.entryPrice);
        const sl = parseFloat(field === "stopLoss" ? String(value) : updated.stopLoss);
        const tp = parseFloat(field === "takeProfit" ? String(value) : updated.takeProfit);
        if (!isNaN(entry) && !isNaN(sl) && !isNaN(tp) && entry !== sl) {
          const risk = Math.abs(entry - sl);
          const reward = Math.abs(tp - entry);
          updated.riskRewardRatio = (reward / risk).toFixed(2);
        }
      }
      return updated;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          entryPrice: parseFloat(form.entryPrice),
          stopLoss: parseFloat(form.stopLoss),
          takeProfit: parseFloat(form.takeProfit),
          positionSize: parseFloat(form.positionSize),
          riskRewardRatio: parseFloat(form.riskRewardRatio),
          exitPrice: form.exitPrice ? parseFloat(form.exitPrice) : null,
          pnl: form.pnl ? parseFloat(form.pnl) : null,
          pnlPercentage: form.pnlPercentage ? parseFloat(form.pnlPercentage) : null,
          rating: form.rating ? parseInt(form.rating) : null,
          dailyPlanId: form.dailyPlanId || null,
          exitTime: form.exitTime || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to log trade");
        return;
      }

      router.push("/journal");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const labelClass = "font-body block text-xs font-medium uppercase tracking-wider mb-1.5";
  const labelStyle = { color: '#7A8BA7' };
  const inputClass = "w-full rounded-xl px-4 py-3 font-body focus:outline-none focus:ring-1 focus:ring-[#00D4AA]/30 transition-all duration-200";
  const inputStyle = { background: '#1A1F2E', border: '1px solid rgba(255,255,255,0.06)', color: '#E8ECF1' };
  const placeholderClass = "placeholder:text-[#4A5568]";

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/journal" className="text-[#3B82F6] text-sm font-body hover:opacity-80 transition-all duration-200">
        &larr; Back to Journal
      </Link>
      <h1 className="text-2xl font-semibold font-display mt-4 mb-2" style={{ color: '#E8ECF1', letterSpacing: '-0.02em' }}>
        Log New Trade
      </h1>
      <p className="text-[13px] font-body mb-8" style={{ color: '#7A8BA7' }}>
        Record every trade. Be honest with yourself.
      </p>

      {error && (
        <div className="rounded-xl p-3 text-[13px] font-body mb-6" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Link to Daily Plan */}
        <div>
          <label className={labelClass} style={labelStyle}>Daily Plan</label>
          <select
            value={form.dailyPlanId}
            onChange={(e) => updateForm("dailyPlanId", e.target.value)}
            className={inputClass}
            style={inputStyle}
          >
            <option value="">-- None --</option>
            {dailyPlans.map((p) => (
              <option key={p.id} value={p.id}>
                {new Date(p.date).toLocaleDateString()} - {p.dailyBias}
              </option>
            ))}
          </select>
        </div>

        {/* Pair & Direction */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass} style={labelStyle}>Pair / Symbol</label>
            <input
              type="text"
              value={form.pair}
              onChange={(e) => updateForm("pair", e.target.value.toUpperCase())}
              required
              placeholder="e.g. EUR/USD, BTC/USD"
              className={`${inputClass} ${placeholderClass}`}
              style={inputStyle}
            />
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>Direction</label>
            <select
              value={form.direction}
              onChange={(e) => updateForm("direction", e.target.value)}
              className={inputClass}
              style={inputStyle}
            >
              {BIAS_OPTIONS.filter((o) => o !== "NEUTRAL").map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Bias Warning */}
        {!form.alignedWithHTF && (
          <BiasWarning htfBias={currentHTFBias} currentDirection={form.direction} />
        )}

        {/* Entry / SL / TP */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass} style={labelStyle}>Entry Price</label>
            <input
              type="number"
              step="any"
              value={form.entryPrice}
              onChange={(e) => updateForm("entryPrice", e.target.value)}
              required
              className={`${inputClass} font-mono`}
              style={inputStyle}
            />
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>Stop Loss</label>
            <input
              type="number"
              step="any"
              value={form.stopLoss}
              onChange={(e) => updateForm("stopLoss", e.target.value)}
              required
              className={`${inputClass} font-mono`}
              style={inputStyle}
            />
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>Take Profit</label>
            <input
              type="number"
              step="any"
              value={form.takeProfit}
              onChange={(e) => updateForm("takeProfit", e.target.value)}
              required
              className={`${inputClass} font-mono`}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Position Size & RR */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass} style={labelStyle}>Position Size</label>
            <input
              type="number"
              step="any"
              value={form.positionSize}
              onChange={(e) => updateForm("positionSize", e.target.value)}
              required
              placeholder="e.g. 0.1 lots"
              className={`${inputClass} font-mono ${placeholderClass}`}
              style={inputStyle}
            />
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>Risk:Reward Ratio</label>
            <input
              type="number"
              step="any"
              value={form.riskRewardRatio}
              onChange={(e) => updateForm("riskRewardRatio", e.target.value)}
              required
              placeholder="Auto-calculated"
              className={`${inputClass} font-mono ${placeholderClass}`}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Setup & Entry Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass} style={labelStyle}>Setup Type</label>
            <select
              value={form.setupType}
              onChange={(e) => updateForm("setupType", e.target.value)}
              className={inputClass}
              style={inputStyle}
            >
              {SETUP_TYPES.map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>Entry Time</label>
            <input
              type="datetime-local"
              value={form.entryTime}
              onChange={(e) => updateForm("entryTime", e.target.value)}
              required
              className={inputClass}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Status */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass} style={labelStyle}>Status</label>
            <select
              value={form.status}
              onChange={(e) => updateForm("status", e.target.value)}
              className={inputClass}
              style={inputStyle}
            >
              {TRADE_STATUS.map((s) => (
                <option key={s} value={s}>{s.replace("CLOSED_", "").replace("_", " ")}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>Emotional State</label>
            <select
              value={form.emotionalState}
              onChange={(e) => updateForm("emotionalState", e.target.value)}
              className={inputClass}
              style={inputStyle}
            >
              {EMOTIONAL_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Exit details (if closed) */}
        {form.status !== "OPEN" && form.status !== "CANCELLED" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className={labelClass} style={labelStyle}>Exit Price</label>
              <input
                type="number"
                step="any"
                value={form.exitPrice}
                onChange={(e) => updateForm("exitPrice", e.target.value)}
                className={`${inputClass} font-mono`}
                style={inputStyle}
              />
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>Exit Time</label>
              <input
                type="datetime-local"
                value={form.exitTime}
                onChange={(e) => updateForm("exitTime", e.target.value)}
                className={inputClass}
                style={inputStyle}
              />
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>P&L ($)</label>
              <input
                type="number"
                step="any"
                value={form.pnl}
                onChange={(e) => updateForm("pnl", e.target.value)}
                className={`${inputClass} font-mono`}
                style={inputStyle}
              />
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>P&L (%)</label>
              <input
                type="number"
                step="any"
                value={form.pnlPercentage}
                onChange={(e) => updateForm("pnlPercentage", e.target.value)}
                className={`${inputClass} font-mono`}
                style={inputStyle}
              />
            </div>
          </div>
        )}

        {/* Entry Reason */}
        <div>
          <label className={labelClass} style={labelStyle}>Entry Reason</label>
          <textarea
            value={form.entryReason}
            onChange={(e) => updateForm("entryReason", e.target.value)}
            rows={3}
            required
            placeholder="Why did you enter this trade? What was the setup, confirmation, and trigger?"
            className={`${inputClass} ${placeholderClass} resize-none`}
            style={inputStyle}
          />
        </div>

        {/* Exit Reason */}
        {form.status !== "OPEN" && (
          <div>
            <label className={labelClass} style={labelStyle}>Exit Reason</label>
            <textarea
              value={form.exitReason}
              onChange={(e) => updateForm("exitReason", e.target.value)}
              rows={2}
              placeholder="Why did you exit? Hit TP/SL, or manual close?"
              className={`${inputClass} ${placeholderClass} resize-none`}
              style={inputStyle}
            />
          </div>
        )}

        {/* Self-review */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass} style={labelStyle}>Mistakes</label>
            <textarea
              value={form.mistakes}
              onChange={(e) => updateForm("mistakes", e.target.value)}
              rows={2}
              placeholder="Any mistakes? Entered too early, moved SL, revenge trade?"
              className={`${inputClass} ${placeholderClass} resize-none`}
              style={inputStyle}
            />
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>Lessons Learned</label>
            <textarea
              value={form.lessonsLearned}
              onChange={(e) => updateForm("lessonsLearned", e.target.value)}
              rows={2}
              placeholder="What can you learn from this trade?"
              className={`${inputClass} ${placeholderClass} resize-none`}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Rating */}
        <div>
          <label className={labelClass} style={labelStyle}>
            Trade Quality Rating (1-5)
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => updateForm("rating", String(r))}
                className="w-10 h-10 rounded-xl font-medium font-mono transition-all duration-200"
                style={
                  form.rating === String(r)
                    ? { background: 'linear-gradient(135deg, #00D4AA 0%, #3B82F6 100%)', color: '#FFFFFF' }
                    : { background: '#1A1F2E', color: '#7A8BA7', border: '1px solid rgba(255,255,255,0.06)' }
                }
              >
                {r}
              </button>
            ))}
          </div>
          <p className="text-[11px] font-body mt-1" style={{ color: '#4A5568' }}>
            1 = Terrible (FOMO/revenge) ... 5 = Perfect execution of plan
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg text-[13px] font-medium font-body px-5 py-2.5 transition-all duration-200 hover:opacity-80"
            style={{ border: '1px solid rgba(0,212,170,0.3)', color: '#00D4AA' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="text-white rounded-lg text-[13px] font-semibold font-body px-5 py-2.5 disabled:opacity-50 transition-all duration-200 hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #00D4AA 0%, #3B82F6 100%)' }}
          >
            {loading ? "Saving..." : "Log Trade"}
          </button>
        </div>
      </form>
    </div>
  );
}
