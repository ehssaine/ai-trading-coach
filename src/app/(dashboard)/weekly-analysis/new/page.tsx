"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BIAS_OPTIONS,
  MARKET_STRUCTURE_OPTIONS,
  getWeekStart,
} from "@/lib/utils";

export default function NewWeeklyAnalysisPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    weekStart: getWeekStart().toISOString().split("T")[0],
    marketStructure: "BULLISH",
    keyLevel: "",
    trendDescription: "",
    htfBias: "LONG",
    biasReasoning: "",
    weeklySupport: "",
    weeklyResistance: "",
    weeklyPOI: "",
    notes: "",
  });

  function updateForm(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/weekly-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create analysis");
        return;
      }

      router.push("/weekly-analysis");
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

  const placeholderClass = "placeholder-[#4A5568]";

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href="/weekly-analysis"
        className="font-body inline-flex items-center gap-1 text-sm mb-6 text-[#3B82F6] hover:underline"
      >
        &larr; Back to Weekly Analysis
      </Link>

      <h1
        className="font-display text-2xl font-semibold mb-2"
        style={{ color: '#E8ECF1', letterSpacing: '-0.02em' }}
      >
        New Weekly Analysis
      </h1>
      <p className="font-body text-[13px] mb-8" style={{ color: '#7A8BA7' }}>
        Analyze the weekly chart to define your HTF bias. This will guide all
        your trades this week.
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
        {/* Week Start */}
        <div>
          <label
            className="font-body block text-xs font-medium uppercase tracking-wider mb-1.5"
            style={{ color: '#7A8BA7' }}
          >
            Week Starting
          </label>
          <input
            type="date"
            value={form.weekStart}
            onChange={(e) => updateForm("weekStart", e.target.value)}
            className={`w-full rounded-xl px-4 py-3 font-mono focus:outline-none focus:ring-1 focus:ring-[#00D4AA]/40 ${placeholderClass}`}
            style={inputStyle}
          />
        </div>

        {/* Market Structure & HTF Bias */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              className="font-body block text-xs font-medium uppercase tracking-wider mb-1.5"
              style={{ color: '#7A8BA7' }}
            >
              Weekly Market Structure
            </label>
            <select
              value={form.marketStructure}
              onChange={(e) => updateForm("marketStructure", e.target.value)}
              className="w-full rounded-xl px-4 py-3 font-body focus:outline-none focus:ring-1 focus:ring-[#00D4AA]/40"
              style={inputStyle}
            >
              {MARKET_STRUCTURE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              className="font-body block text-xs font-medium uppercase tracking-wider mb-1.5"
              style={{ color: '#7A8BA7' }}
            >
              HTF Bias (Trade Direction)
            </label>
            <select
              value={form.htfBias}
              onChange={(e) => updateForm("htfBias", e.target.value)}
              className="w-full rounded-xl px-4 py-3 font-body focus:outline-none focus:ring-1 focus:ring-[#00D4AA]/40"
              style={inputStyle}
            >
              {BIAS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Trend Description */}
        <div>
          <label
            className="font-body block text-xs font-medium uppercase tracking-wider mb-1.5"
            style={{ color: '#7A8BA7' }}
          >
            Trend Description
          </label>
          <textarea
            value={form.trendDescription}
            onChange={(e) => updateForm("trendDescription", e.target.value)}
            rows={3}
            required
            placeholder="Describe the current weekly trend. Is price making HH/HL? LL/LH? Where is price in relation to key structure?"
            className={`w-full rounded-xl px-4 py-3 font-body focus:outline-none focus:ring-1 focus:ring-[#00D4AA]/40 resize-none ${placeholderClass}`}
            style={inputStyle}
          />
        </div>

        {/* Bias Reasoning */}
        <div>
          <label
            className="font-body block text-xs font-medium uppercase tracking-wider mb-1.5"
            style={{ color: '#7A8BA7' }}
          >
            Bias Reasoning
          </label>
          <textarea
            value={form.biasReasoning}
            onChange={(e) => updateForm("biasReasoning", e.target.value)}
            rows={3}
            required
            placeholder="Why are you bullish/bearish/neutral this week? What confluence supports this direction?"
            className={`w-full rounded-xl px-4 py-3 font-body focus:outline-none focus:ring-1 focus:ring-[#00D4AA]/40 resize-none ${placeholderClass}`}
            style={inputStyle}
          />
        </div>

        {/* Key Levels */}
        <div>
          <label
            className="font-body block text-xs font-medium uppercase tracking-wider mb-1.5"
            style={{ color: '#7A8BA7' }}
          >
            Key Levels
          </label>
          <textarea
            value={form.keyLevel}
            onChange={(e) => updateForm("keyLevel", e.target.value)}
            rows={2}
            required
            placeholder="List the major support/resistance levels, order blocks, FVGs on the weekly chart"
            className={`w-full rounded-xl px-4 py-3 font-body focus:outline-none focus:ring-1 focus:ring-[#00D4AA]/40 resize-none ${placeholderClass}`}
            style={inputStyle}
          />
        </div>

        {/* Support / Resistance / POI */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label
              className="font-body block text-xs font-medium uppercase tracking-wider mb-1.5"
              style={{ color: '#7A8BA7' }}
            >
              Weekly Support
            </label>
            <input
              type="text"
              value={form.weeklySupport}
              onChange={(e) => updateForm("weeklySupport", e.target.value)}
              required
              placeholder="e.g. 1.0850, 1.0780"
              className={`w-full rounded-xl px-4 py-3 font-mono focus:outline-none focus:ring-1 focus:ring-[#00D4AA]/40 ${placeholderClass}`}
              style={inputStyle}
            />
          </div>
          <div>
            <label
              className="font-body block text-xs font-medium uppercase tracking-wider mb-1.5"
              style={{ color: '#7A8BA7' }}
            >
              Weekly Resistance
            </label>
            <input
              type="text"
              value={form.weeklyResistance}
              onChange={(e) => updateForm("weeklyResistance", e.target.value)}
              required
              placeholder="e.g. 1.1020, 1.1100"
              className={`w-full rounded-xl px-4 py-3 font-mono focus:outline-none focus:ring-1 focus:ring-[#00D4AA]/40 ${placeholderClass}`}
              style={inputStyle}
            />
          </div>
          <div>
            <label
              className="font-body block text-xs font-medium uppercase tracking-wider mb-1.5"
              style={{ color: '#7A8BA7' }}
            >
              Points of Interest
            </label>
            <input
              type="text"
              value={form.weeklyPOI}
              onChange={(e) => updateForm("weeklyPOI", e.target.value)}
              required
              placeholder="e.g. OB at 1.0900, FVG 1.0950"
              className={`w-full rounded-xl px-4 py-3 font-mono focus:outline-none focus:ring-1 focus:ring-[#00D4AA]/40 ${placeholderClass}`}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label
            className="font-body block text-xs font-medium uppercase tracking-wider mb-1.5"
            style={{ color: '#7A8BA7' }}
          >
            Additional Notes
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => updateForm("notes", e.target.value)}
            rows={2}
            placeholder="Any news events, correlations, or other factors to consider this week"
            className={`w-full rounded-xl px-4 py-3 font-body focus:outline-none focus:ring-1 focus:ring-[#00D4AA]/40 resize-none ${placeholderClass}`}
            style={inputStyle}
          />
        </div>

        {/* Reminder Box */}
        <div
          className="rounded-xl p-4"
          style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}
        >
          <p className="font-body text-[13px] font-medium" style={{ color: '#3B82F6' }}>
            Remember: Once you set your weekly bias, ONLY take trades in this
            direction unless there is a clear structural break on the daily
            timeframe.
          </p>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="font-body rounded-lg text-[13px] font-medium px-5 py-2.5 transition-all duration-200"
            style={{ border: '1px solid rgba(0,212,170,0.3)', color: '#00D4AA' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="font-body rounded-lg text-[13px] font-medium px-5 py-2.5 disabled:opacity-50 transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #00D4AA 0%, #3B82F6 100%)',
              color: '#FFFFFF',
            }}
          >
            {loading ? "Saving..." : "Save Weekly Analysis"}
          </button>
        </div>
      </form>
    </div>
  );
}
