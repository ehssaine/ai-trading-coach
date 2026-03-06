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
      return { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0", text: "#065F46" };
    case "BEARISH":
    case "SHORT":
      return { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA", text: "#991B1B" };
    default:
      return { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A", text: "#92400E" };
  }
}

function impactIcon(impact: string) {
  switch (impact?.toUpperCase()) {
    case "BULLISH":
      return "↑";
    case "BEARISH":
      return "↓";
    default:
      return "→";
  }
}

// ── Section Tab Component ────────────────────────────────────────────

function SectionTab({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
      style={{
        background: active ? "#FFFFFF" : "transparent",
        color: active ? "#1E293B" : "#94A3B8",
        boxShadow: active ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
      }}
    >
      {label}
    </button>
  );
}

// ── Page ─────────────────────────────────────────────────────────────

export default function AIWeeklyOutlookPage() {
  const [weekStart, setWeekStart] = useState(getWeekStart());
  const [outlook, setOutlook] = useState<Outlook | null>(null);
  const [spotPrices, setSpotPrices] = useState<{ gold: number | null; silver: number | null; fetchedAt: string | null }>({ gold: null, silver: null, fetchedAt: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"metals" | "macro" | "plan">("metals");

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

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div
        className="rounded-2xl p-6 md:p-8"
        style={{
          background: "linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 50%, #F5F3FF 100%)",
          border: "1px solid #E2E8F0",
        }}
      >
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-display text-2xl font-bold" style={{ color: "#0F172A" }}>
                Weekly Market Outlook
              </h1>
              <span
                className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
                style={{ background: "linear-gradient(135deg, #8B5CF6, #6366F1)", color: "#FFF" }}
              >
                AI
              </span>
            </div>
            <p className="font-body text-sm" style={{ color: "#64748B" }}>
              Fundamentals, macro analysis, and trade plan for gold &amp; silver — powered by AI with live prices.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div>
              <label className="block text-[10px] font-medium uppercase tracking-wider mb-1" style={{ color: "#94A3B8" }}>
                Week of
              </label>
              <input
                type="date"
                value={weekStart}
                onChange={(e) => setWeekStart(e.target.value)}
                className="rounded-xl px-4 py-2.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", color: "#1E293B" }}
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium uppercase tracking-wider mb-1 opacity-0">.</label>
              <button
                onClick={generateOutlook}
                disabled={loading}
                className="font-body rounded-xl px-6 py-2.5 text-sm font-semibold transition-all duration-200 disabled:opacity-50 hover:shadow-lg hover:shadow-indigo-200"
                style={{ background: "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)", color: "#FFFFFF" }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Analyzing...
                  </span>
                ) : (
                  "Generate Outlook"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Error ───────────────────────────────────────────────────── */}
      {error && (
        <div
          className="rounded-xl p-4 text-sm font-body flex items-center gap-3"
          style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {error}
        </div>
      )}

      {/* ── Loading ─────────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl p-16 text-center" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0" }}>
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: "#EEF2FF" }}>
            <svg className="animate-spin w-8 h-8" style={{ color: "#6366F1" }} fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <p className="font-body text-base font-medium" style={{ color: "#1E293B" }}>Generating your weekly outlook...</p>
          <p className="font-body text-sm mt-1" style={{ color: "#94A3B8" }}>Fetching live prices and analyzing fundamentals</p>
        </div>
      )}

      {/* ── Empty State ─────────────────────────────────────────────── */}
      {!outlook && !loading && !error && (
        <div className="rounded-2xl p-16 text-center" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0" }}>
          <div className="w-20 h-20 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #EEF2FF, #F5F3FF)" }}>
            <svg className="w-10 h-10" style={{ color: "#8B5CF6" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
            </svg>
          </div>
          <p className="font-display text-xl font-semibold" style={{ color: "#1E293B" }}>
            Ready to analyze the markets
          </p>
          <p className="font-body text-sm mt-2 max-w-md mx-auto" style={{ color: "#94A3B8" }}>
            Pick a week and hit &ldquo;Generate Outlook&rdquo; to get a full AI-powered breakdown with live gold &amp; silver prices.
          </p>
        </div>
      )}

      {/* ── Results ─────────────────────────────────────────────────── */}
      {outlook && (
        <div className="space-y-5">

          {/* ── Summary Strip ───────────────────────────────────────── */}
          <div
            className="rounded-2xl p-5 flex items-center justify-between flex-wrap gap-4"
            style={{ background: "#FFFFFF", border: "1px solid #E2E8F0" }}
          >
            <div>
              <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "#94A3B8" }}>
                Outlook
              </p>
              <h2 className="font-display text-lg font-bold mt-0.5" style={{ color: "#0F172A" }}>
                {outlook.weekLabel}
              </h2>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {/* Direction badge */}
              <span
                className="text-xs font-bold px-4 py-1.5 rounded-full"
                style={{
                  background: biasColor(outlook.tradingPlan.preferredDirection).bg,
                  color: biasColor(outlook.tradingPlan.preferredDirection).text,
                  border: `1px solid ${biasColor(outlook.tradingPlan.preferredDirection).border}`,
                }}
              >
                Direction: {outlook.tradingPlan.preferredDirection}
              </span>
              {/* Live prices */}
              {(spotPrices.gold || spotPrices.silver) && (
                <div className="flex items-center gap-4 px-4 py-1.5 rounded-full" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] uppercase tracking-wider font-medium" style={{ color: "#94A3B8" }}>Live</span>
                  </div>
                  {spotPrices.gold && (
                    <span className="font-mono text-xs font-bold" style={{ color: "#B45309" }}>
                      XAU ${spotPrices.gold.toFixed(2)}
                    </span>
                  )}
                  {spotPrices.silver && (
                    <span className="font-mono text-xs font-bold" style={{ color: "#64748B" }}>
                      XAG ${spotPrices.silver.toFixed(2)}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Tab Navigation ──────────────────────────────────────── */}
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: "#F1F5F9" }}>
            <SectionTab active={activeTab === "metals"} label="Gold & Silver" onClick={() => setActiveTab("metals")} />
            <SectionTab active={activeTab === "macro"} label="Macro & Events" onClick={() => setActiveTab("macro")} />
            <SectionTab active={activeTab === "plan"} label="Trading Plan" onClick={() => setActiveTab("plan")} />
          </div>

          {/* ── TAB: Metals ─────────────────────────────────────────── */}
          {activeTab === "metals" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Gold Card */}
                <div className="rounded-2xl overflow-hidden" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0" }}>
                  {/* Gold Header */}
                  <div className="px-6 py-4 flex items-center justify-between" style={{ background: "linear-gradient(135deg, #FFFBEB, #FEF3C7)", borderBottom: "1px solid #FDE68A" }}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#F59E0B" }}>
                        <span className="text-white text-sm font-bold">Au</span>
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-sm" style={{ color: "#92400E" }}>XAUUSD</h3>
                        <p className="text-[10px]" style={{ color: "#B45309" }}>Gold Spot</p>
                      </div>
                    </div>
                    <span
                      className="text-xs font-bold px-3 py-1 rounded-full"
                      style={{
                        background: biasColor(outlook.goldOutlook.bias).bg,
                        color: biasColor(outlook.goldOutlook.bias).text,
                        border: `1px solid ${biasColor(outlook.goldOutlook.bias).border}`,
                      }}
                    >
                      {outlook.goldOutlook.bias}
                    </span>
                  </div>

                  <div className="p-6 space-y-5">
                    <p className="font-body text-sm leading-relaxed" style={{ color: "#475569" }}>
                      {outlook.goldOutlook.currentContext}
                    </p>

                    {/* Levels */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl p-3.5" style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
                        <p className="text-[10px] uppercase tracking-wider font-bold mb-2" style={{ color: "#16A34A" }}>
                          Support
                        </p>
                        {outlook.goldOutlook.technicalLevels.weeklySupport.map((lvl, i) => (
                          <p key={i} className="font-mono text-sm font-semibold" style={{ color: "#15803D" }}>
                            {lvl}
                          </p>
                        ))}
                      </div>
                      <div className="rounded-xl p-3.5" style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}>
                        <p className="text-[10px] uppercase tracking-wider font-bold mb-2" style={{ color: "#DC2626" }}>
                          Resistance
                        </p>
                        {outlook.goldOutlook.technicalLevels.weeklyResistance.map((lvl, i) => (
                          <p key={i} className="font-mono text-sm font-semibold" style={{ color: "#B91C1C" }}>
                            {lvl}
                          </p>
                        ))}
                      </div>
                    </div>

                    {/* Key Zones */}
                    <div className="rounded-xl p-3.5" style={{ background: "#F5F3FF", border: "1px solid #DDD6FE" }}>
                      <p className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: "#7C3AED" }}>
                        Key Zones (ICT/SMC)
                      </p>
                      <p className="font-body text-sm" style={{ color: "#6D28D9" }}>
                        {outlook.goldOutlook.technicalLevels.keyZones}
                      </p>
                    </div>

                    {/* Scenarios */}
                    <div className="space-y-2.5">
                      <div className="rounded-xl p-3.5" style={{ background: "#F0FDF4", borderLeft: "3px solid #22C55E" }}>
                        <p className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: "#16A34A" }}>
                          If Bulls Win
                        </p>
                        <p className="font-body text-sm" style={{ color: "#475569" }}>
                          {outlook.goldOutlook.scenarioBullish}
                        </p>
                      </div>
                      <div className="rounded-xl p-3.5" style={{ background: "#FEF2F2", borderLeft: "3px solid #EF4444" }}>
                        <p className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: "#DC2626" }}>
                          If Bears Win
                        </p>
                        <p className="font-body text-sm" style={{ color: "#475569" }}>
                          {outlook.goldOutlook.scenarioBearish}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Silver Card */}
                <div className="rounded-2xl overflow-hidden" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0" }}>
                  {/* Silver Header */}
                  <div className="px-6 py-4 flex items-center justify-between" style={{ background: "linear-gradient(135deg, #F8FAFC, #F1F5F9)", borderBottom: "1px solid #E2E8F0" }}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#94A3B8" }}>
                        <span className="text-white text-sm font-bold">Ag</span>
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-sm" style={{ color: "#334155" }}>XAGUSD</h3>
                        <p className="text-[10px]" style={{ color: "#64748B" }}>Silver Spot</p>
                      </div>
                    </div>
                    <span
                      className="text-xs font-bold px-3 py-1 rounded-full"
                      style={{
                        background: biasColor(outlook.silverOutlook.bias).bg,
                        color: biasColor(outlook.silverOutlook.bias).text,
                        border: `1px solid ${biasColor(outlook.silverOutlook.bias).border}`,
                      }}
                    >
                      {outlook.silverOutlook.bias}
                    </span>
                  </div>

                  <div className="p-6 space-y-5">
                    <p className="font-body text-sm leading-relaxed" style={{ color: "#475569" }}>
                      {outlook.silverOutlook.currentContext}
                    </p>

                    {/* Levels */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl p-3.5" style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
                        <p className="text-[10px] uppercase tracking-wider font-bold mb-2" style={{ color: "#16A34A" }}>
                          Support
                        </p>
                        {outlook.silverOutlook.technicalLevels.weeklySupport.map((lvl, i) => (
                          <p key={i} className="font-mono text-sm font-semibold" style={{ color: "#15803D" }}>
                            {lvl}
                          </p>
                        ))}
                      </div>
                      <div className="rounded-xl p-3.5" style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}>
                        <p className="text-[10px] uppercase tracking-wider font-bold mb-2" style={{ color: "#DC2626" }}>
                          Resistance
                        </p>
                        {outlook.silverOutlook.technicalLevels.weeklyResistance.map((lvl, i) => (
                          <p key={i} className="font-mono text-sm font-semibold" style={{ color: "#B91C1C" }}>
                            {lvl}
                          </p>
                        ))}
                      </div>
                    </div>

                    {/* Key Drivers */}
                    <div className="rounded-xl p-3.5" style={{ background: "#F5F3FF", border: "1px solid #DDD6FE" }}>
                      <p className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: "#7C3AED" }}>
                        Silver-Specific Drivers
                      </p>
                      <p className="font-body text-sm" style={{ color: "#6D28D9" }}>
                        {outlook.silverOutlook.keyDrivers}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fundamental Drivers */}
              {outlook.goldOutlook.fundamentalDrivers && outlook.goldOutlook.fundamentalDrivers.length > 0 && (
                <div className="rounded-2xl p-6" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0" }}>
                  <h3 className="font-display font-bold text-base mb-4" style={{ color: "#0F172A" }}>
                    Fundamental Drivers
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {outlook.goldOutlook.fundamentalDrivers.map((driver, i) => {
                      const colors = biasColor(driver.impact);
                      return (
                        <div
                          key={i}
                          className="rounded-xl p-4 flex items-start gap-3"
                          style={{ background: "#F8FAFC", border: "1px solid #F1F5F9" }}
                        >
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold"
                            style={{ background: colors.bg, color: colors.color }}
                          >
                            {impactIcon(driver.impact)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-body text-sm font-semibold" style={{ color: "#1E293B" }}>
                              {driver.factor}
                            </p>
                            <p className="font-body text-xs mt-0.5 leading-relaxed" style={{ color: "#64748B" }}>
                              {driver.detail}
                            </p>
                          </div>
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                            style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
                          >
                            {driver.impact}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── TAB: Macro & Events ─────────────────────────────────── */}
          {activeTab === "macro" && (
            <div className="space-y-5">
              {/* Macro Environment */}
              <div className="rounded-2xl p-6" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0" }}>
                <h3 className="font-display font-bold text-base mb-4" style={{ color: "#0F172A" }}>
                  Macro Environment
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "US Dollar (DXY)", value: outlook.macroEnvironment.dollarOutlook, icon: "💵", bg: "#ECFDF5", iconBg: "#D1FAE5" },
                    { label: "Treasury Yields", value: outlook.macroEnvironment.yieldsOutlook, icon: "📈", bg: "#EFF6FF", iconBg: "#DBEAFE" },
                    { label: "Risk Sentiment", value: outlook.macroEnvironment.riskSentiment, icon: "⚖️", bg: "#FFFBEB", iconBg: "#FEF3C7" },
                    { label: "Inflation Context", value: outlook.macroEnvironment.inflationContext, icon: "🔥", bg: "#FEF2F2", iconBg: "#FEE2E2" },
                  ].map((item, i) => (
                    <div key={i} className="rounded-xl p-4 flex items-start gap-3.5" style={{ background: item.bg }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: item.iconBg }}>
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "#64748B" }}>
                          {item.label}
                        </p>
                        <p className="font-body text-sm leading-relaxed" style={{ color: "#334155" }}>
                          {item.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Events */}
              {outlook.goldOutlook.keyEventsThisWeek && outlook.goldOutlook.keyEventsThisWeek.length > 0 && (
                <div className="rounded-2xl p-6" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0" }}>
                  <h3 className="font-display font-bold text-base mb-4" style={{ color: "#0F172A" }}>
                    Key Events This Week
                  </h3>
                  <div className="space-y-2.5">
                    {outlook.goldOutlook.keyEventsThisWeek.map((event, i) => (
                      <div
                        key={i}
                        className="rounded-xl p-4 flex items-center gap-4"
                        style={{ background: "#F8FAFC", border: "1px solid #F1F5F9" }}
                      >
                        <div
                          className="rounded-lg px-3 py-2 text-center flex-shrink-0"
                          style={{ background: "#EEF2FF", border: "1px solid #DDD6FE", minWidth: "80px" }}
                        >
                          <p className="font-mono text-xs font-bold" style={{ color: "#6366F1" }}>
                            {event.date}
                          </p>
                        </div>
                        <div className="flex-1">
                          <p className="font-body text-sm font-semibold" style={{ color: "#1E293B" }}>
                            {event.event}
                          </p>
                          <p className="font-body text-xs mt-0.5" style={{ color: "#64748B" }}>
                            {event.expectedImpact}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── TAB: Trading Plan ───────────────────────────────────── */}
          {activeTab === "plan" && (
            <div className="space-y-5">
              <div className="rounded-2xl overflow-hidden" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0" }}>
                {/* Plan Header */}
                <div className="px-6 py-4" style={{ background: "linear-gradient(135deg, #ECFDF5, #F0FDF9)", borderBottom: "1px solid #A7F3D0" }}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-base" style={{ color: "#065F46" }}>
                      Trading Plan
                    </h3>
                    <span
                      className="text-sm font-bold px-4 py-1.5 rounded-full"
                      style={{
                        background: biasColor(outlook.tradingPlan.preferredDirection).bg,
                        color: biasColor(outlook.tradingPlan.preferredDirection).text,
                        border: `1px solid ${biasColor(outlook.tradingPlan.preferredDirection).border}`,
                      }}
                    >
                      {outlook.tradingPlan.preferredDirection}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  {/* Entry Conditions */}
                  <div className="rounded-xl p-4" style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
                    <p className="text-[10px] uppercase tracking-wider font-bold mb-1.5" style={{ color: "#16A34A" }}>
                      Entry Conditions (ICT/SMC)
                    </p>
                    <p className="font-body text-sm leading-relaxed" style={{ color: "#166534" }}>
                      {outlook.tradingPlan.entryConditions}
                    </p>
                  </div>

                  {/* Risk Warnings */}
                  {outlook.tradingPlan.riskWarnings && outlook.tradingPlan.riskWarnings.length > 0 && (
                    <div className="rounded-xl p-4" style={{ background: "#FEF2F2", border: "1px solid #FECACA" }}>
                      <p className="text-[10px] uppercase tracking-wider font-bold mb-2" style={{ color: "#DC2626" }}>
                        Risk Warnings
                      </p>
                      <div className="space-y-2">
                        {outlook.tradingPlan.riskWarnings.map((warning, i) => (
                          <div key={i} className="flex items-start gap-2.5">
                            <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs" style={{ background: "#FEE2E2", color: "#DC2626" }}>
                              !
                            </div>
                            <p className="font-body text-sm" style={{ color: "#991B1B" }}>
                              {warning}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Weekly Advice */}
                  <div className="rounded-xl p-4" style={{ background: "#F5F3FF", border: "1px solid #DDD6FE" }}>
                    <p className="text-[10px] uppercase tracking-wider font-bold mb-1.5" style={{ color: "#7C3AED" }}>
                      Weekly Psychology Advice
                    </p>
                    <p className="font-body text-sm leading-relaxed font-medium" style={{ color: "#4C1D95" }}>
                      {outlook.tradingPlan.weeklyAdvice}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Disclaimer ──────────────────────────────────────────── */}
          <div className="rounded-xl p-4 text-center" style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
            <p className="font-body text-xs" style={{ color: "#92400E" }}>
              This AI-generated outlook is for educational purposes only. It is NOT financial advice.
              Always do your own analysis and manage risk appropriately.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
