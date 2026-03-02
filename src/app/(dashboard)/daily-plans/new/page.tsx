"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BIAS_OPTIONS,
  MARKET_STRUCTURE_OPTIONS,
} from "@/lib/utils";
import BiasWarning from "@/components/BiasWarning";

interface WeeklyAnalysis {
  id: string;
  weekStart: string;
  htfBias: string;
  marketStructure: string;
}

export default function NewDailyPlanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [weeklyAnalyses, setWeeklyAnalyses] = useState<WeeklyAnalysis[]>([]);
  const [currentHTFBias, setCurrentHTFBias] = useState("NEUTRAL");

  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    weeklyAnalysisId: "",
    dailyBias: "LONG",
    dailyMarketStructure: "BULLISH",
    alignedWithHTF: true,
    asianSessionNotes: "",
    londonSessionNotes: "",
    nySessionNotes: "",
    dailySupport: "",
    dailyResistance: "",
    dailyPOI: "",
    maxTrades: 3,
    riskPerTrade: 1.0,
    tradePlan: "",
  });

  useEffect(() => {
    fetch("/api/weekly-analysis")
      .then((r) => r.json())
      .then((data) => {
        const analyses = data.analyses || [];
        setWeeklyAnalyses(analyses);
        if (analyses.length > 0) {
          setForm((prev) => ({
            ...prev,
            weeklyAnalysisId: analyses[0].id,
            dailyBias: analyses[0].htfBias,
          }));
          setCurrentHTFBias(analyses[0].htfBias);
        }
      });
  }, []);

  function updateForm(field: string, value: string | number | boolean) {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "weeklyAnalysisId") {
        const wa = weeklyAnalyses.find((w) => w.id === value);
        if (wa) {
          setCurrentHTFBias(wa.htfBias);
          updated.alignedWithHTF = updated.dailyBias === wa.htfBias || wa.htfBias === "NEUTRAL";
        }
      }
      if (field === "dailyBias") {
        updated.alignedWithHTF = value === currentHTFBias || currentHTFBias === "NEUTRAL";
      }
      return updated;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/daily-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create plan");
        return;
      }

      router.push("/daily-plans");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    background: '#1A1F2E',
    border: '1px solid rgba(255,255,255,0.06)',
    color: '#E8ECF1',
  };

  const inputClassName = "w-full rounded-xl px-4 py-3 font-body focus:outline-none focus:ring-1 focus:ring-[#00D4AA]/40 placeholder:text-[#4A5568]";

  return (
    <div className="max-w-3xl mx-auto">
      <h1
        className="font-display text-2xl font-semibold mb-2"
        style={{ color: '#E8ECF1', letterSpacing: '-0.02em' }}
      >
        New Daily Plan
      </h1>
      <p className="font-body text-[13px] mb-8" style={{ color: '#7A8BA7' }}>
        Plan your trading day. Always check alignment with your weekly bias.
      </p>

      {error && (
        <div
          className="rounded-xl p-3 text-[13px] font-body mb-6"
          style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date & Weekly Link */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              className="font-body block text-xs font-medium uppercase tracking-wider mb-1.5"
              style={{ color: '#7A8BA7' }}
            >
              Date
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => updateForm("date", e.target.value)}
              className={inputClassName}
              style={inputStyle}
            />
          </div>
          <div>
            <label
              className="font-body block text-xs font-medium uppercase tracking-wider mb-1.5"
              style={{ color: '#7A8BA7' }}
            >
              Weekly Analysis
            </label>
            <select
              value={form.weeklyAnalysisId}
              onChange={(e) => updateForm("weeklyAnalysisId", e.target.value)}
              className={inputClassName}
              style={inputStyle}
            >
              <option value="">-- None --</option>
              {weeklyAnalyses.map((wa) => (
                <option key={wa.id} value={wa.id}>
                  Week of {new Date(wa.weekStart).toLocaleDateString()} - {wa.htfBias}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Daily Bias & Structure */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              className="font-body block text-xs font-medium uppercase tracking-wider mb-1.5"
              style={{ color: '#7A8BA7' }}
            >
              Daily Bias
            </label>
            <select
              value={form.dailyBias}
              onChange={(e) => updateForm("dailyBias", e.target.value)}
              className={inputClassName}
              style={inputStyle}
            >
              {BIAS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div>
            <label
              className="font-body block text-xs font-medium uppercase tracking-wider mb-1.5"
              style={{ color: '#7A8BA7' }}
            >
              Daily Market Structure
            </label>
            <select
              value={form.dailyMarketStructure}
              onChange={(e) => updateForm("dailyMarketStructure", e.target.value)}
              className={inputClassName}
              style={inputStyle}
            >
              {MARKET_STRUCTURE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Bias Warning */}
        {!form.alignedWithHTF && (
          <BiasWarning htfBias={currentHTFBias} currentDirection={form.dailyBias} />
        )}

        {/* Session Notes */}
        <div className="space-y-4">
          <h3
            className="font-display text-xs font-medium uppercase tracking-wider"
            style={{ color: '#4A5568', letterSpacing: '-0.02em' }}
          >
            Session Planning
          </h3>
          <div>
            <label
              className="font-body block text-xs font-medium uppercase tracking-wider mb-1.5"
              style={{ color: '#7A8BA7' }}
            >
              Asian Session Notes
            </label>
            <textarea
              value={form.asianSessionNotes}
              onChange={(e) => updateForm("asianSessionNotes", e.target.value)}
              rows={2}
              placeholder="What to watch during Asian session (range formation, liquidity levels)"
              className={`${inputClassName} resize-none`}
              style={inputStyle}
            />
          </div>
          <div>
            <label
              className="font-body block text-xs font-medium uppercase tracking-wider mb-1.5"
              style={{ color: '#7A8BA7' }}
            >
              London Session Notes
            </label>
            <textarea
              value={form.londonSessionNotes}
              onChange={(e) => updateForm("londonSessionNotes", e.target.value)}
              rows={2}
              placeholder="London open expectations, key levels to watch"
              className={`${inputClassName} resize-none`}
              style={inputStyle}
            />
          </div>
          <div>
            <label
              className="font-body block text-xs font-medium uppercase tracking-wider mb-1.5"
              style={{ color: '#7A8BA7' }}
            >
              New York Session Notes
            </label>
            <textarea
              value={form.nySessionNotes}
              onChange={(e) => updateForm("nySessionNotes", e.target.value)}
              rows={2}
              placeholder="NY session plan, news events, overlap considerations"
              className={`${inputClassName} resize-none`}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Key Levels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label
              className="font-body block text-xs font-medium uppercase tracking-wider mb-1.5"
              style={{ color: '#7A8BA7' }}
            >
              Daily Support
            </label>
            <input
              type="text"
              value={form.dailySupport}
              onChange={(e) => updateForm("dailySupport", e.target.value)}
              required
              placeholder="e.g. 1.0870"
              className={`${inputClassName} font-mono`}
              style={inputStyle}
            />
          </div>
          <div>
            <label
              className="font-body block text-xs font-medium uppercase tracking-wider mb-1.5"
              style={{ color: '#7A8BA7' }}
            >
              Daily Resistance
            </label>
            <input
              type="text"
              value={form.dailyResistance}
              onChange={(e) => updateForm("dailyResistance", e.target.value)}
              required
              placeholder="e.g. 1.0950"
              className={`${inputClassName} font-mono`}
              style={inputStyle}
            />
          </div>
          <div>
            <label
              className="font-body block text-xs font-medium uppercase tracking-wider mb-1.5"
              style={{ color: '#7A8BA7' }}
            >
              Daily POI
            </label>
            <input
              type="text"
              value={form.dailyPOI}
              onChange={(e) => updateForm("dailyPOI", e.target.value)}
              required
              placeholder="e.g. FVG at 1.0900"
              className={`${inputClassName} font-mono`}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Risk Management */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              className="font-body block text-xs font-medium uppercase tracking-wider mb-1.5"
              style={{ color: '#7A8BA7' }}
            >
              Max Trades Today
            </label>
            <input
              type="number"
              value={form.maxTrades}
              onChange={(e) => updateForm("maxTrades", parseInt(e.target.value))}
              min={1}
              max={10}
              className={`${inputClassName} font-mono`}
              style={inputStyle}
            />
          </div>
          <div>
            <label
              className="font-body block text-xs font-medium uppercase tracking-wider mb-1.5"
              style={{ color: '#7A8BA7' }}
            >
              Risk Per Trade (%)
            </label>
            <input
              type="number"
              value={form.riskPerTrade}
              onChange={(e) => updateForm("riskPerTrade", parseFloat(e.target.value))}
              min={0.1}
              max={5}
              step={0.1}
              className={`${inputClassName} font-mono`}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Trade Plan */}
        <div>
          <label
            className="font-body block text-xs font-medium uppercase tracking-wider mb-1.5"
            style={{ color: '#7A8BA7' }}
          >
            Trade Plan
          </label>
          <textarea
            value={form.tradePlan}
            onChange={(e) => updateForm("tradePlan", e.target.value)}
            rows={4}
            required
            placeholder="Describe your plan for today in detail: What setups are you looking for? At which levels? What confirmations do you need before entering?"
            className={`${inputClassName} resize-none`}
            style={inputStyle}
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="font-body rounded-xl text-[13px] font-medium px-5 py-2.5 transition-all duration-200 hover:border-[#00D4AA]/30"
            style={{ border: '1px solid rgba(0,212,170,0.3)', color: '#00D4AA' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="font-body rounded-xl text-[13px] font-medium px-5 py-2.5 text-white disabled:opacity-50 transition-all duration-200"
            style={{ background: 'linear-gradient(135deg, #00D4AA 0%, #3B82F6 100%)' }}
          >
            {loading ? "Saving..." : "Save Daily Plan"}
          </button>
        </div>
      </form>
    </div>
  );
}
