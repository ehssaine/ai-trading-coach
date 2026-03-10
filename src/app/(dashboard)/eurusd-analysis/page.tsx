"use client";

import { useState } from "react";

// ── Types ────────────────────────────────────────────────────────────

interface CentralBank {
  current_rate: string;
  stance: string;
  next_move: string;
  cuts_expected_2025: string;
  key_signal: string;
  score: number;
}

interface Analysis {
  fed: CentralBank;
  ecb: CentralBank;
  divergence_spread: number;
  divergence_direction: string;
  signal: string;
  signal_strength: string;
  deep_analysis: string;
  trading_implication: string;
  catalyst_to_watch: string;
}

// ── Helpers ──────────────────────────────────────────────────────────

function stanceColor(stance: string) {
  switch (stance?.toUpperCase()) {
    case "HAWKISH":
      return { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA", text: "#991B1B" };
    case "DOVISH":
      return { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0", text: "#065F46" };
    default:
      return { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A", text: "#92400E" };
  }
}

function signalColor(signal: string) {
  switch (signal?.toUpperCase()) {
    case "BULLISH":
      return { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0", text: "#065F46", label: "EUR/USD Bullish" };
    case "BEARISH":
      return { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA", text: "#991B1B", label: "EUR/USD Bearish" };
    default:
      return { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A", text: "#92400E", label: "Neutral" };
  }
}

function strengthDots(strength: string) {
  switch (strength?.toUpperCase()) {
    case "STRONG":
      return 3;
    case "MODERATE":
      return 2;
    default:
      return 1;
  }
}

function directionLabel(dir: string) {
  switch (dir) {
    case "USD_ADVANTAGE":
      return { label: "USD Advantage", color: "#1D4ED8", bg: "#EFF6FF" };
    case "EUR_ADVANTAGE":
      return { label: "EUR Advantage", color: "#059669", bg: "#ECFDF5" };
    default:
      return { label: "Converging", color: "#D97706", bg: "#FFFBEB" };
  }
}

// ── Score Gauge Component ────────────────────────────────────────────

function ScoreGauge({ score, label }: { score: number; label: string }) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const hue = 120 - (clampedScore * 1.2); // green (dovish) to red (hawkish)
  const barColor = `hsl(${hue}, 70%, 45%)`;

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "#94A3B8" }}>
          {label}
        </span>
        <span className="font-mono text-xs font-bold" style={{ color: barColor }}>
          {clampedScore}/100
        </span>
      </div>
      <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "#F1F5F9" }}>
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${clampedScore}%`, background: barColor }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[9px]" style={{ color: "#94A3B8" }}>Dovish</span>
        <span className="text-[9px]" style={{ color: "#94A3B8" }}>Hawkish</span>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────

export default function EURUSDAnalysisPage() {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    setLoading(true);
    setError("");
    setAnalysis(null);

    try {
      const res = await fetch("/api/eurusd-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to generate analysis");
        return;
      }

      setAnalysis(data.analysis);
      setGeneratedAt(data.generatedAt);
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
          background: "linear-gradient(135deg, #EFF6FF 0%, #F0F9FF 50%, #ECFDF5 100%)",
          border: "1px solid #BFDBFE",
        }}
      >
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-display text-2xl font-bold" style={{ color: "#0F172A" }}>
                EUR/USD Fundamental Analysis
              </h1>
              <span
                className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
                style={{ background: "linear-gradient(135deg, #1D4ED8, #0EA5E9)", color: "#FFF" }}
              >
                AI
              </span>
            </div>
            <p className="font-body text-sm" style={{ color: "#64748B" }}>
              Fed vs ECB monetary policy divergence — the single most powerful driver of EUR/USD.
            </p>
          </div>
          <button
            onClick={generate}
            disabled={loading}
            className="font-body rounded-xl px-6 py-2.5 text-sm font-semibold transition-all duration-200 disabled:opacity-50 hover:shadow-lg hover:shadow-blue-200"
            style={{ background: "linear-gradient(135deg, #1D4ED8 0%, #0EA5E9 100%)", color: "#FFFFFF" }}
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
              "Run Analysis"
            )}
          </button>
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
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: "#EFF6FF" }}>
            <svg className="animate-spin w-8 h-8" style={{ color: "#1D4ED8" }} fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <p className="font-body text-base font-medium" style={{ color: "#1E293B" }}>Analyzing policy divergence...</p>
          <p className="font-body text-sm mt-1" style={{ color: "#94A3B8" }}>Evaluating Fed and ECB rates, guidance, and forward paths</p>
        </div>
      )}

      {/* ── Empty State ─────────────────────────────────────────────── */}
      {!analysis && !loading && !error && (
        <div className="rounded-2xl p-16 text-center" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0" }}>
          <div className="w-20 h-20 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #EFF6FF, #F0F9FF)" }}>
            <span className="text-4xl font-display font-bold" style={{ color: "#1D4ED8" }}>€$</span>
          </div>
          <p className="font-display text-xl font-semibold" style={{ color: "#1E293B" }}>
            Ready to analyze EUR/USD
          </p>
          <p className="font-body text-sm mt-2 max-w-md mx-auto" style={{ color: "#94A3B8" }}>
            Click &ldquo;Run Analysis&rdquo; for an AI-powered breakdown of Fed vs ECB monetary policy divergence and what it means for the pair.
          </p>
        </div>
      )}

      {/* ── Results ─────────────────────────────────────────────────── */}
      {analysis && (
        <div className="space-y-5">

          {/* ── Signal Summary ──────────────────────────────────────── */}
          <div className="rounded-2xl p-5 flex items-center justify-between flex-wrap gap-4" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0" }}>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2.5">
                <span className="font-display text-lg font-bold" style={{ color: "#0F172A" }}>EUR/USD</span>
                <span
                  className="text-xs font-bold px-4 py-1.5 rounded-full"
                  style={{
                    background: signalColor(analysis.signal).bg,
                    color: signalColor(analysis.signal).text,
                    border: `1px solid ${signalColor(analysis.signal).border}`,
                  }}
                >
                  {signalColor(analysis.signal).label}
                </span>
              </div>
              {/* Strength dots */}
              <div className="flex items-center gap-1.5">
                {[1, 2, 3].map((dot) => (
                  <div
                    key={dot}
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      background: dot <= strengthDots(analysis.signal_strength)
                        ? signalColor(analysis.signal).color
                        : "#E2E8F0",
                    }}
                  />
                ))}
                <span className="text-[10px] font-medium ml-1" style={{ color: "#94A3B8" }}>
                  {analysis.signal_strength}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className="text-xs font-semibold px-3 py-1.5 rounded-full"
                style={{
                  background: directionLabel(analysis.divergence_direction).bg,
                  color: directionLabel(analysis.divergence_direction).color,
                }}
              >
                {directionLabel(analysis.divergence_direction).label}
              </span>
              <span className="font-mono text-xs" style={{ color: "#94A3B8" }}>
                Spread: {analysis.divergence_spread > 0 ? "+" : ""}{analysis.divergence_spread}
              </span>
              {generatedAt && (
                <span className="text-[10px]" style={{ color: "#CBD5E1" }}>
                  {new Date(generatedAt).toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>

          {/* ── Fed vs ECB Cards ────────────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Fed Card */}
            <div className="rounded-2xl overflow-hidden" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0" }}>
              <div className="px-6 py-4 flex items-center justify-between" style={{ background: "linear-gradient(135deg, #EFF6FF, #DBEAFE)", borderBottom: "1px solid #BFDBFE" }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "#1D4ED8" }}>
                    <span className="text-white text-xs font-bold">FED</span>
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm" style={{ color: "#1E3A8A" }}>Federal Reserve</h3>
                    <p className="text-[10px]" style={{ color: "#3B82F6" }}>United States</p>
                  </div>
                </div>
                <span
                  className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{
                    background: stanceColor(analysis.fed.stance).bg,
                    color: stanceColor(analysis.fed.stance).text,
                    border: `1px solid ${stanceColor(analysis.fed.stance).border}`,
                  }}
                >
                  {analysis.fed.stance}
                </span>
              </div>
              <div className="p-6 space-y-4">
                {/* Rate */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium" style={{ color: "#64748B" }}>Fed Funds Rate</span>
                  <span className="font-mono text-lg font-bold" style={{ color: "#0F172A" }}>{analysis.fed.current_rate}</span>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl p-3" style={{ background: "#F8FAFC" }}>
                    <p className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: "#94A3B8" }}>Next Move</p>
                    <p className="font-body text-sm font-semibold" style={{ color: "#1E293B" }}>{analysis.fed.next_move}</p>
                  </div>
                  <div className="rounded-xl p-3" style={{ background: "#F8FAFC" }}>
                    <p className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: "#94A3B8" }}>Expected Cuts</p>
                    <p className="font-body text-sm font-semibold" style={{ color: "#1E293B" }}>{analysis.fed.cuts_expected_2025}</p>
                  </div>
                </div>

                {/* Key Signal */}
                <div className="rounded-xl p-3.5" style={{ background: "#EFF6FF", border: "1px solid #BFDBFE" }}>
                  <p className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: "#1D4ED8" }}>Key Signal</p>
                  <p className="font-body text-sm" style={{ color: "#1E3A8A" }}>{analysis.fed.key_signal}</p>
                </div>

                {/* Hawkishness Gauge */}
                <ScoreGauge score={analysis.fed.score} label="Hawkishness Score" />
              </div>
            </div>

            {/* ECB Card */}
            <div className="rounded-2xl overflow-hidden" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0" }}>
              <div className="px-6 py-4 flex items-center justify-between" style={{ background: "linear-gradient(135deg, #FFFBEB, #FEF3C7)", borderBottom: "1px solid #FDE68A" }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "#B45309" }}>
                    <span className="text-white text-xs font-bold">ECB</span>
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm" style={{ color: "#78350F" }}>European Central Bank</h3>
                    <p className="text-[10px]" style={{ color: "#D97706" }}>Eurozone</p>
                  </div>
                </div>
                <span
                  className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{
                    background: stanceColor(analysis.ecb.stance).bg,
                    color: stanceColor(analysis.ecb.stance).text,
                    border: `1px solid ${stanceColor(analysis.ecb.stance).border}`,
                  }}
                >
                  {analysis.ecb.stance}
                </span>
              </div>
              <div className="p-6 space-y-4">
                {/* Rate */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium" style={{ color: "#64748B" }}>Deposit Rate</span>
                  <span className="font-mono text-lg font-bold" style={{ color: "#0F172A" }}>{analysis.ecb.current_rate}</span>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl p-3" style={{ background: "#F8FAFC" }}>
                    <p className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: "#94A3B8" }}>Next Move</p>
                    <p className="font-body text-sm font-semibold" style={{ color: "#1E293B" }}>{analysis.ecb.next_move}</p>
                  </div>
                  <div className="rounded-xl p-3" style={{ background: "#F8FAFC" }}>
                    <p className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: "#94A3B8" }}>Expected Cuts</p>
                    <p className="font-body text-sm font-semibold" style={{ color: "#1E293B" }}>{analysis.ecb.cuts_expected_2025}</p>
                  </div>
                </div>

                {/* Key Signal */}
                <div className="rounded-xl p-3.5" style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
                  <p className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: "#B45309" }}>Key Signal</p>
                  <p className="font-body text-sm" style={{ color: "#78350F" }}>{analysis.ecb.key_signal}</p>
                </div>

                {/* Hawkishness Gauge */}
                <ScoreGauge score={analysis.ecb.score} label="Hawkishness Score" />
              </div>
            </div>
          </div>

          {/* ── Divergence Visual ───────────────────────────────────── */}
          <div className="rounded-2xl p-6" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0" }}>
            <h3 className="font-display font-bold text-base mb-4" style={{ color: "#0F172A" }}>
              Policy Divergence
            </h3>

            {/* Visual bar */}
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-xs font-bold" style={{ color: "#1D4ED8" }}>FED: {analysis.fed.score}</span>
                <span className="text-xs font-bold" style={{ color: "#B45309" }}>ECB: {analysis.ecb.score}</span>
              </div>
              <div className="relative h-4 rounded-full overflow-hidden" style={{ background: "#F1F5F9" }}>
                {/* Fed bar (from left) */}
                <div
                  className="absolute left-0 top-0 h-full rounded-l-full transition-all duration-700"
                  style={{
                    width: `${analysis.fed.score / 2}%`,
                    background: "linear-gradient(90deg, #1D4ED8, #3B82F6)",
                  }}
                />
                {/* ECB bar (from right) */}
                <div
                  className="absolute right-0 top-0 h-full rounded-r-full transition-all duration-700"
                  style={{
                    width: `${analysis.ecb.score / 2}%`,
                    background: "linear-gradient(90deg, #F59E0B, #B45309)",
                  }}
                />
                {/* Center line */}
                <div className="absolute left-1/2 top-0 w-0.5 h-full" style={{ background: "#CBD5E1" }} />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[9px]" style={{ color: "#94A3B8" }}>USD</span>
                <span className="text-[9px] font-medium" style={{ color: "#64748B" }}>
                  Gap: {Math.abs(analysis.divergence_spread)} pts
                </span>
                <span className="text-[9px]" style={{ color: "#94A3B8" }}>EUR</span>
              </div>
            </div>

            {/* Deep Analysis */}
            <div className="rounded-xl p-4 mb-4" style={{ background: "#F8FAFC", border: "1px solid #F1F5F9" }}>
              <p className="text-[10px] uppercase tracking-wider font-bold mb-2" style={{ color: "#6366F1" }}>
                Deep Analysis
              </p>
              <p className="font-body text-sm leading-relaxed" style={{ color: "#334155" }}>
                {analysis.deep_analysis}
              </p>
            </div>

            {/* Trading Implication */}
            <div className="rounded-xl p-4" style={{ background: "#ECFDF5", border: "1px solid #A7F3D0" }}>
              <p className="text-[10px] uppercase tracking-wider font-bold mb-2" style={{ color: "#059669" }}>
                Trading Implication
              </p>
              <p className="font-body text-sm leading-relaxed" style={{ color: "#065F46" }}>
                {analysis.trading_implication}
              </p>
            </div>
          </div>

          {/* ── Catalyst to Watch ───────────────────────────────────── */}
          <div
            className="rounded-2xl p-5 flex items-center gap-4"
            style={{ background: "linear-gradient(135deg, #FEF3C7, #FFFBEB)", border: "1px solid #FDE68A" }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#FDE68A" }}>
              <svg className="w-5 h-5" style={{ color: "#B45309" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold mb-0.5" style={{ color: "#92400E" }}>
                Key Catalyst to Watch
              </p>
              <p className="font-body text-sm font-medium" style={{ color: "#78350F" }}>
                {analysis.catalyst_to_watch}
              </p>
            </div>
          </div>

          {/* ── Disclaimer ──────────────────────────────────────────── */}
          <div className="rounded-xl p-4 text-center" style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}>
            <p className="font-body text-xs" style={{ color: "#92400E" }}>
              This AI-generated analysis is for educational purposes only. It is NOT financial advice.
              Always do your own analysis and manage risk appropriately.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
