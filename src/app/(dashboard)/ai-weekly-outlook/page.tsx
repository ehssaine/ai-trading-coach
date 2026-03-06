"use client";

import { useState } from "react";

// ── Types ────────────────────────────────────────────────────────────

interface FundamentalDriver {
  factor: string;
  impact: "BULLISH" | "BEARISH" | "NEUTRAL";
  detail: string;
}

interface KeyEvent {
  event: string;
  date: string;
  expectedImpact: string;
}

interface Outlook {
  weekLabel: string;
  goldOutlook: {
    bias: string;
    currentContext: string;
    fundamentalDrivers: FundamentalDriver[];
    keyEventsThisWeek: KeyEvent[];
    technicalLevels: {
      weeklySupport: string[];
      weeklyResistance: string[];
      keyZones: string;
    };
    scenarioBullish: string;
    scenarioBearish: string;
  };
  silverOutlook: {
    bias: string;
    currentContext: string;
    keyDrivers: string;
    technicalLevels: {
      weeklySupport: string[];
      weeklyResistance: string[];
    };
  };
  macroEnvironment: {
    dollarOutlook: string;
    yieldsOutlook: string;
    riskSentiment: string;
    inflationContext: string;
  };
  tradingPlan: {
    preferredDirection: string;
    entryConditions: string;
    riskWarnings: string[];
    weeklyAdvice: string;
  };
}

// ── Helpers ──────────────────────────────────────────────────────────

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 1 : day === 6 ? 2 : day === 1 ? 0 : 1 - day + 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() + (diff <= 0 ? diff + 7 : diff > 2 ? diff : diff === 0 ? 0 : -day + 1));
  // Simple: get next Monday or current Monday
  const d = new Date();
  const dayOfWeek = d.getDay();
  const daysUntilMonday = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 0 : 8 - dayOfWeek;
  d.setDate(d.getDate() + daysUntilMonday);
  return d.toISOString().split("T")[0];
}

function biasColor(bias: string) {
  switch (bias?.toUpperCase()) {
    case "BULLISH":
    case "LONG":
      return { bg: "rgba(0,212,170,0.1)", color: "#00D4AA", border: "rgba(0,212,170,0.3)" };
    case "BEARISH":
    case "SHORT":
      return { bg: "rgba(239,68,68,0.1)", color: "#EF4444", border: "rgba(239,68,68,0.3)" };
    default:
      return { bg: "rgba(234,179,8,0.1)", color: "#EAB308", border: "rgba(234,179,8,0.3)" };
  }
}

function impactIcon(impact: string) {
  switch (impact?.toUpperCase()) {
    case "BULLISH":
      return "▲";
    case "BEARISH":
      return "▼";
    default:
      return "◆";
  }
}

// ── Page ─────────────────────────────────────────────────────────────

export default function AIWeeklyOutlookPage() {
  const [weekStart, setWeekStart] = useState(getWeekStart());
  const [outlook, setOutlook] = useState<Outlook | null>(null);
  const [spotPrices, setSpotPrices] = useState<{ gold: number | null; silver: number | null; fetchedAt: string | null }>({ gold: null, silver: null, fetchedAt: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generateOutlook() {
    setLoading(true);
    setError("");
    setOutlook(null);
    setSpotPrices({ gold: null, silver: null, fetchedAt: null });

    try {
      const res = await fetch("/api/ai-weekly-outlook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weekStart }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to generate outlook");
        return;
      }

      setOutlook(data.outlook);
      if (data.spotPrices) {
        setSpotPrices(data.spotPrices);
      }
    } catch {
      setError("Failed to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const cardStyle = { background: "#111621", border: "1px solid rgba(255,255,255,0.06)" };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1
              className="font-display text-2xl font-semibold"
              style={{ color: "#E8ECF1", letterSpacing: "-0.02em" }}
            >
              AI Weekly Outlook
            </h1>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: "rgba(139,92,246,0.15)", color: "#8B5CF6", border: "1px solid rgba(139,92,246,0.3)" }}
            >
              AI-POWERED
            </span>
          </div>
          <p className="font-body text-sm mt-1" style={{ color: "#7A8BA7" }}>
            AI-generated fundamental analysis, news impact, and macro outlook for gold &amp; silver
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={weekStart}
            onChange={(e) => setWeekStart(e.target.value)}
            className="rounded-xl px-4 py-2.5 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]/40"
            style={{ background: "#1A1F2E", border: "1px solid rgba(255,255,255,0.06)", color: "#E8ECF1" }}
          />
          <button
            onClick={generateOutlook}
            disabled={loading}
            className="font-body rounded-xl px-5 py-2.5 text-[13px] font-medium transition-all duration-200 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)", color: "#FFFFFF" }}
          >
            {loading ? "Analyzing..." : "Generate Outlook"}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          className="rounded-xl p-4 text-[13px] font-body"
          style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444" }}
        >
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="rounded-xl p-12 text-center" style={cardStyle}>
          <div className="inline-flex items-center gap-3">
            <svg className="animate-spin w-5 h-5" style={{ color: "#8B5CF6" }} fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="font-body text-sm" style={{ color: "#7A8BA7" }}>
              AI is analyzing fundamentals, macro data, and market structure...
            </span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!outlook && !loading && !error && (
        <div className="rounded-xl p-16 text-center" style={cardStyle}>
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: "rgba(139,92,246,0.1)" }}>
            <svg className="w-8 h-8" style={{ color: "#8B5CF6" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
          </div>
          <p className="font-body text-lg" style={{ color: "#7A8BA7" }}>
            Generate your weekly market outlook
          </p>
          <p className="font-body text-sm mt-1" style={{ color: "#4A5568" }}>
            Select a week and click &ldquo;Generate Outlook&rdquo; to get AI-powered analysis
          </p>
        </div>
      )}

      {/* ── Outlook Results ───────────────────────────────────────────── */}
      {outlook && (
        <div className="space-y-6">
          {/* Week Header */}
          <div className="rounded-xl p-6" style={{ ...cardStyle, borderLeft: "3px solid #8B5CF6" }}>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="font-body text-xs uppercase tracking-wider" style={{ color: "#7A8BA7" }}>
                  Weekly Outlook
                </p>
                <h2 className="font-display text-xl font-semibold mt-1" style={{ color: "#E8ECF1" }}>
                  {outlook.weekLabel}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{
                    background: biasColor(outlook.tradingPlan.preferredDirection).bg,
                    color: biasColor(outlook.tradingPlan.preferredDirection).color,
                    border: `1px solid ${biasColor(outlook.tradingPlan.preferredDirection).border}`,
                  }}
                >
                  {outlook.tradingPlan.preferredDirection}
                </span>
              </div>
            </div>
          </div>

          {/* Live Spot Prices Banner */}
          {(spotPrices.gold || spotPrices.silver) && (
            <div className="rounded-xl p-4 flex items-center justify-between flex-wrap gap-3" style={{ background: "#1A1F2E", border: "1px solid rgba(139,92,246,0.2)" }}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="font-body text-xs uppercase tracking-wider" style={{ color: "#7A8BA7" }}>
                  Live Spot Prices Used
                </span>
              </div>
              <div className="flex items-center gap-6">
                {spotPrices.gold && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: "#7A8BA7" }}>Gold:</span>
                    <span className="font-mono text-sm font-bold" style={{ color: "#EAB308" }}>
                      ${spotPrices.gold.toFixed(2)}
                    </span>
                  </div>
                )}
                {spotPrices.silver && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: "#7A8BA7" }}>Silver:</span>
                    <span className="font-mono text-sm font-bold" style={{ color: "#C0C0C0" }}>
                      ${spotPrices.silver.toFixed(2)}
                    </span>
                  </div>
                )}
                {spotPrices.fetchedAt && (
                  <span className="font-body text-[10px]" style={{ color: "#4A5568" }}>
                    {new Date(spotPrices.fetchedAt).toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Gold & Silver Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gold Outlook */}
            <div className="rounded-xl p-6 space-y-5" style={cardStyle}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🥇</span>
                  <h3 className="font-display font-semibold" style={{ color: "#E8ECF1" }}>
                    XAUUSD (Gold)
                  </h3>
                </div>
                <span
                  className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{
                    background: biasColor(outlook.goldOutlook.bias).bg,
                    color: biasColor(outlook.goldOutlook.bias).color,
                    border: `1px solid ${biasColor(outlook.goldOutlook.bias).border}`,
                  }}
                >
                  {outlook.goldOutlook.bias}
                </span>
              </div>

              <p className="font-body text-sm leading-relaxed" style={{ color: "#7A8BA7" }}>
                {outlook.goldOutlook.currentContext}
              </p>

              {/* Technical Levels */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg p-3" style={{ background: "rgba(0,212,170,0.05)" }}>
                  <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "#00D4AA" }}>
                    Support
                  </p>
                  {outlook.goldOutlook.technicalLevels.weeklySupport.map((lvl, i) => (
                    <p key={i} className="font-mono text-sm mt-1" style={{ color: "#E8ECF1" }}>
                      {lvl}
                    </p>
                  ))}
                </div>
                <div className="rounded-lg p-3" style={{ background: "rgba(239,68,68,0.05)" }}>
                  <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "#EF4444" }}>
                    Resistance
                  </p>
                  {outlook.goldOutlook.technicalLevels.weeklyResistance.map((lvl, i) => (
                    <p key={i} className="font-mono text-sm mt-1" style={{ color: "#E8ECF1" }}>
                      {lvl}
                    </p>
                  ))}
                </div>
              </div>

              {/* Key Zones */}
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: "#8B5CF6" }}>
                  Key Zones (ICT/SMC)
                </p>
                <p className="font-body text-sm" style={{ color: "#7A8BA7" }}>
                  {outlook.goldOutlook.technicalLevels.keyZones}
                </p>
              </div>

              {/* Scenarios */}
              <div className="space-y-3">
                <div className="rounded-lg p-3" style={{ background: "rgba(0,212,170,0.05)", borderLeft: "2px solid #00D4AA" }}>
                  <p className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: "#00D4AA" }}>
                    Bull Scenario
                  </p>
                  <p className="font-body text-sm" style={{ color: "#7A8BA7" }}>
                    {outlook.goldOutlook.scenarioBullish}
                  </p>
                </div>
                <div className="rounded-lg p-3" style={{ background: "rgba(239,68,68,0.05)", borderLeft: "2px solid #EF4444" }}>
                  <p className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: "#EF4444" }}>
                    Bear Scenario
                  </p>
                  <p className="font-body text-sm" style={{ color: "#7A8BA7" }}>
                    {outlook.goldOutlook.scenarioBearish}
                  </p>
                </div>
              </div>
            </div>

            {/* Silver Outlook */}
            <div className="rounded-xl p-6 space-y-5" style={cardStyle}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🥈</span>
                  <h3 className="font-display font-semibold" style={{ color: "#E8ECF1" }}>
                    XAGUSD (Silver)
                  </h3>
                </div>
                <span
                  className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{
                    background: biasColor(outlook.silverOutlook.bias).bg,
                    color: biasColor(outlook.silverOutlook.bias).color,
                    border: `1px solid ${biasColor(outlook.silverOutlook.bias).border}`,
                  }}
                >
                  {outlook.silverOutlook.bias}
                </span>
              </div>

              <p className="font-body text-sm leading-relaxed" style={{ color: "#7A8BA7" }}>
                {outlook.silverOutlook.currentContext}
              </p>

              {/* Technical Levels */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg p-3" style={{ background: "rgba(0,212,170,0.05)" }}>
                  <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "#00D4AA" }}>
                    Support
                  </p>
                  {outlook.silverOutlook.technicalLevels.weeklySupport.map((lvl, i) => (
                    <p key={i} className="font-mono text-sm mt-1" style={{ color: "#E8ECF1" }}>
                      {lvl}
                    </p>
                  ))}
                </div>
                <div className="rounded-lg p-3" style={{ background: "rgba(239,68,68,0.05)" }}>
                  <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "#EF4444" }}>
                    Resistance
                  </p>
                  {outlook.silverOutlook.technicalLevels.weeklyResistance.map((lvl, i) => (
                    <p key={i} className="font-mono text-sm mt-1" style={{ color: "#E8ECF1" }}>
                      {lvl}
                    </p>
                  ))}
                </div>
              </div>

              {/* Key Drivers */}
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: "#8B5CF6" }}>
                  Silver-Specific Drivers
                </p>
                <p className="font-body text-sm" style={{ color: "#7A8BA7" }}>
                  {outlook.silverOutlook.keyDrivers}
                </p>
              </div>
            </div>
          </div>

          {/* Fundamental Drivers */}
          {outlook.goldOutlook.fundamentalDrivers && outlook.goldOutlook.fundamentalDrivers.length > 0 && (
            <div className="rounded-xl p-6" style={cardStyle}>
              <h3 className="font-display font-semibold mb-4" style={{ color: "#E8ECF1" }}>
                Fundamental Drivers
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {outlook.goldOutlook.fundamentalDrivers.map((driver, i) => {
                  const colors = biasColor(driver.impact);
                  return (
                    <div
                      key={i}
                      className="rounded-lg p-4 flex items-start gap-3"
                      style={{ background: "#1A1F2E" }}
                    >
                      <span
                        className="text-sm mt-0.5 flex-shrink-0"
                        style={{ color: colors.color }}
                      >
                        {impactIcon(driver.impact)}
                      </span>
                      <div>
                        <p className="font-body text-sm font-medium" style={{ color: "#E8ECF1" }}>
                          {driver.factor}
                        </p>
                        <p className="font-body text-xs mt-1" style={{ color: "#7A8BA7" }}>
                          {driver.detail}
                        </p>
                      </div>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto flex-shrink-0"
                        style={{ background: colors.bg, color: colors.color }}
                      >
                        {driver.impact}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Key Events This Week */}
          {outlook.goldOutlook.keyEventsThisWeek && outlook.goldOutlook.keyEventsThisWeek.length > 0 && (
            <div className="rounded-xl p-6" style={cardStyle}>
              <h3 className="font-display font-semibold mb-4" style={{ color: "#E8ECF1" }}>
                Key Events This Week
              </h3>
              <div className="space-y-3">
                {outlook.goldOutlook.keyEventsThisWeek.map((event, i) => (
                  <div
                    key={i}
                    className="rounded-lg p-4 flex items-start gap-4"
                    style={{ background: "#1A1F2E" }}
                  >
                    <div
                      className="rounded-lg px-3 py-1.5 text-center flex-shrink-0"
                      style={{ background: "rgba(139,92,246,0.1)", minWidth: "80px" }}
                    >
                      <p className="font-mono text-xs font-bold" style={{ color: "#8B5CF6" }}>
                        {event.date}
                      </p>
                    </div>
                    <div>
                      <p className="font-body text-sm font-medium" style={{ color: "#E8ECF1" }}>
                        {event.event}
                      </p>
                      <p className="font-body text-xs mt-1" style={{ color: "#7A8BA7" }}>
                        {event.expectedImpact}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Macro Environment */}
          <div className="rounded-xl p-6" style={cardStyle}>
            <h3 className="font-display font-semibold mb-4" style={{ color: "#E8ECF1" }}>
              Macro Environment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: "US Dollar (DXY)", value: outlook.macroEnvironment.dollarOutlook, icon: "$" },
                { label: "Treasury Yields", value: outlook.macroEnvironment.yieldsOutlook, icon: "%" },
                { label: "Risk Sentiment", value: outlook.macroEnvironment.riskSentiment, icon: "⚖" },
                { label: "Inflation Context", value: outlook.macroEnvironment.inflationContext, icon: "📊" },
              ].map((item, i) => (
                <div key={i} className="rounded-lg p-4" style={{ background: "#1A1F2E" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm">{item.icon}</span>
                    <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "#8B5CF6" }}>
                      {item.label}
                    </p>
                  </div>
                  <p className="font-body text-sm leading-relaxed" style={{ color: "#7A8BA7" }}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Trading Plan */}
          <div
            className="rounded-xl p-6"
            style={{ ...cardStyle, borderLeft: "3px solid #00D4AA" }}
          >
            <h3 className="font-display font-semibold mb-4" style={{ color: "#E8ECF1" }}>
              Trading Plan for the Week
            </h3>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "#7A8BA7" }}>
                  Preferred Direction:
                </span>
                <span
                  className="text-sm font-bold px-3 py-1 rounded-full"
                  style={{
                    background: biasColor(outlook.tradingPlan.preferredDirection).bg,
                    color: biasColor(outlook.tradingPlan.preferredDirection).color,
                    border: `1px solid ${biasColor(outlook.tradingPlan.preferredDirection).border}`,
                  }}
                >
                  {outlook.tradingPlan.preferredDirection}
                </span>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: "#00D4AA" }}>
                  Entry Conditions (ICT/SMC)
                </p>
                <p className="font-body text-sm" style={{ color: "#7A8BA7" }}>
                  {outlook.tradingPlan.entryConditions}
                </p>
              </div>

              {outlook.tradingPlan.riskWarnings && outlook.tradingPlan.riskWarnings.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold mb-2" style={{ color: "#EF4444" }}>
                    Risk Warnings
                  </p>
                  <div className="space-y-1.5">
                    {outlook.tradingPlan.riskWarnings.map((warning, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-xs mt-0.5" style={{ color: "#EF4444" }}>
                          ⚠
                        </span>
                        <p className="font-body text-sm" style={{ color: "#7A8BA7" }}>
                          {warning}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div
                className="rounded-lg p-4 mt-2"
                style={{ background: "rgba(139,92,246,0.05)", borderLeft: "2px solid #8B5CF6" }}
              >
                <p className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: "#8B5CF6" }}>
                  Weekly Psychology Advice
                </p>
                <p className="font-body text-sm leading-relaxed" style={{ color: "#E8ECF1" }}>
                  {outlook.tradingPlan.weeklyAdvice}
                </p>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div
            className="rounded-xl p-4 text-center"
            style={{ background: "rgba(234,179,8,0.05)", border: "1px solid rgba(234,179,8,0.15)" }}
          >
            <p className="font-body text-xs" style={{ color: "#EAB308" }}>
              This AI-generated outlook is for educational purposes only. It is NOT financial advice.
              Always do your own analysis and manage risk appropriately. Past patterns do not guarantee future results.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
