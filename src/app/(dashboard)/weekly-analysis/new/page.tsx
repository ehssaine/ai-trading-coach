"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-2">
        New Weekly Analysis
      </h1>
      <p className="text-gray-400 text-sm mb-8">
        Analyze the weekly chart to define your HTF bias. This will guide all
        your trades this week.
      </p>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg p-3 mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Week Start */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Week Starting
          </label>
          <input
            type="date"
            value={form.weekStart}
            onChange={(e) => updateForm("weekStart", e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Market Structure & HTF Bias */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Weekly Market Structure
            </label>
            <select
              value={form.marketStructure}
              onChange={(e) => updateForm("marketStructure", e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {MARKET_STRUCTURE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              HTF Bias (Trade Direction)
            </label>
            <select
              value={form.htfBias}
              onChange={(e) => updateForm("htfBias", e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Trend Description
          </label>
          <textarea
            value={form.trendDescription}
            onChange={(e) => updateForm("trendDescription", e.target.value)}
            rows={3}
            required
            placeholder="Describe the current weekly trend. Is price making HH/HL? LL/LH? Where is price in relation to key structure?"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Bias Reasoning */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Bias Reasoning
          </label>
          <textarea
            value={form.biasReasoning}
            onChange={(e) => updateForm("biasReasoning", e.target.value)}
            rows={3}
            required
            placeholder="Why are you bullish/bearish/neutral this week? What confluence supports this direction?"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Key Levels */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Key Levels
          </label>
          <textarea
            value={form.keyLevel}
            onChange={(e) => updateForm("keyLevel", e.target.value)}
            rows={2}
            required
            placeholder="List the major support/resistance levels, order blocks, FVGs on the weekly chart"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Support / Resistance / POI */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Weekly Support
            </label>
            <input
              type="text"
              value={form.weeklySupport}
              onChange={(e) => updateForm("weeklySupport", e.target.value)}
              required
              placeholder="e.g. 1.0850, 1.0780"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Weekly Resistance
            </label>
            <input
              type="text"
              value={form.weeklyResistance}
              onChange={(e) => updateForm("weeklyResistance", e.target.value)}
              required
              placeholder="e.g. 1.1020, 1.1100"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Points of Interest
            </label>
            <input
              type="text"
              value={form.weeklyPOI}
              onChange={(e) => updateForm("weeklyPOI", e.target.value)}
              required
              placeholder="e.g. OB at 1.0900, FVG 1.0950"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Additional Notes
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => updateForm("notes", e.target.value)}
            rows={2}
            placeholder="Any news events, correlations, or other factors to consider this week"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Reminder Box */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <p className="text-blue-400 text-sm font-medium">
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
            className="px-4 py-2.5 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
          >
            {loading ? "Saving..." : "Save Weekly Analysis"}
          </button>
        </div>
      </form>
    </div>
  );
}
