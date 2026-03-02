"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Insight {
  id: string;
  category: "critical" | "warning" | "improvement" | "positive";
  title: string;
  description: string;
  metric?: string;
  recommendation?: string;
  relatedNlp?: string;
}

interface RuleCompliance {
  htfAlignment: { score: number; total: number; aligned: number };
  planAdherence: { score: number; followed: number; total: number };
  riskManagement: { score: number; violations: number };
  maxTradesRespected: { score: number; violations: number };
}

interface Patterns {
  bestSession: string | null;
  worstEmotionalState: string | null;
  bestSetupType: string | null;
  worstSetupType: string | null;
  winRateTrend: "improving" | "declining" | "stable";
  revengeTrading: number;
  overtrading: number;
}

interface WeeklyTrend {
  week: string;
  winRate: number;
  pnl: number;
  trades: number;
  discipline: number;
}

interface AnalysisReport {
  healthScore: number;
  insights: Insight[];
  ruleCompliance: RuleCompliance;
  patterns: Patterns;
  weeklyTrend: WeeklyTrend[];
  lastAnalyzed: string;
}

interface WhatsAppSettings {
  whatsappEnabled: boolean;
  whatsappNumber: string | null;
  reportTime: string;
  timezone: string;
  includeTradeStats: boolean;
  includeDailyPlan: boolean;
  includeHabitReminder: boolean;
  includeAiInsights: boolean;
}

const NLP_ROUTES: Record<string, string> = {
  ANCHORING: "/nlp/anchoring",
  REFRAMING: "/nlp/reframing",
  SWISH: "/nlp/swish",
  VISUALIZATION: "/nlp/visualization",
  MODELING: "/nlp/modeling",
  MIRRORING: "/nlp/mirroring",
  INCANTATIONS: "/nlp/incantations",
  DIALOGUE: "/nlp/dialogue",
};

const CATEGORY_CONFIG = {
  critical: {
    color: "#EF4444",
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.2)",
    label: "Critical",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
  },
  warning: {
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.2)",
    label: "Attention",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
    ),
  },
  improvement: {
    color: "#3B82F6",
    bg: "rgba(59,130,246,0.08)",
    border: "rgba(59,130,246,0.2)",
    label: "Improve",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
  positive: {
    color: "#00D4AA",
    bg: "rgba(0,212,170,0.08)",
    border: "rgba(0,212,170,0.2)",
    label: "Strong",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
};

const TIMEZONES = [
  "UTC", "GMT", "EST", "CST", "MST", "PST",
  "CET", "EET", "IST", "JST", "AEST",
  "GMT+1", "GMT+2", "GMT+3", "GMT+4",
  "GMT-1", "GMT-2", "GMT-3", "GMT-4", "GMT-5",
];

export default function AIAnalyzerPage() {
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"insights" | "compliance" | "whatsapp">("insights");
  const [whatsappSettings, setWhatsappSettings] = useState<WhatsAppSettings>({
    whatsappEnabled: false,
    whatsappNumber: null,
    reportTime: "07:00",
    timezone: "UTC",
    includeTradeStats: true,
    includeDailyPlan: true,
    includeHabitReminder: true,
    includeAiInsights: true,
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [reportPreview, setReportPreview] = useState<string | null>(null);
  const [sendingReport, setSendingReport] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [analyzerRes, settingsRes] = await Promise.all([
        fetch("/api/ai-analyzer"),
        fetch("/api/whatsapp/settings"),
      ]);
      const analyzerData = await analyzerRes.json();
      const settingsData = await settingsRes.json();
      if (analyzerData.report) setReport(analyzerData.report);
      if (settingsData.settings) setWhatsappSettings(settingsData.settings);
    } catch (error) {
      console.error("Failed to load AI analyzer:", error);
    } finally {
      setLoading(false);
    }
  }

  async function refreshAnalysis() {
    setRefreshing(true);
    try {
      const res = await fetch("/api/ai-analyzer");
      const data = await res.json();
      if (data.report) setReport(data.report);
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setRefreshing(false);
    }
  }

  async function saveWhatsAppSettings() {
    setSavingSettings(true);
    setSettingsMessage(null);
    try {
      const res = await fetch("/api/whatsapp/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(whatsappSettings),
      });
      const data = await res.json();
      if (!res.ok) {
        setSettingsMessage({ type: "error", text: data.error || "Failed to save" });
      } else {
        setSettingsMessage({ type: "success", text: "Settings saved successfully!" });
        if (data.settings) setWhatsappSettings(data.settings);
      }
    } catch {
      setSettingsMessage({ type: "error", text: "Failed to save settings" });
    } finally {
      setSavingSettings(false);
    }
  }

  async function previewReport() {
    setSendingReport(true);
    setReportPreview(null);
    try {
      const res = await fetch("/api/whatsapp/send-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test: true }),
      });
      const data = await res.json();
      if (data.report) setReportPreview(data.report);
      else setSettingsMessage({ type: "error", text: data.error || "Failed to generate preview" });
    } catch {
      setSettingsMessage({ type: "error", text: "Failed to generate preview" });
    } finally {
      setSendingReport(false);
    }
  }

  async function sendReportNow() {
    setSendingReport(true);
    setSettingsMessage(null);
    try {
      const res = await fetch("/api/whatsapp/send-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test: false }),
      });
      const data = await res.json();
      if (data.success) {
        setSettingsMessage({ type: "success", text: "Report sent to WhatsApp!" });
      } else {
        setSettingsMessage({ type: "error", text: data.error || "Failed to send" });
      }
    } catch {
      setSettingsMessage({ type: "error", text: "Failed to send report" });
    } finally {
      setSendingReport(false);
    }
  }

  function getHealthColor(score: number) {
    if (score >= 80) return "#00D4AA";
    if (score >= 60) return "#F59E0B";
    return "#EF4444";
  }

  function getHealthLabel(score: number) {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Strong";
    if (score >= 70) return "Good";
    if (score >= 60) return "Needs Work";
    if (score >= 40) return "At Risk";
    return "Critical";
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full animate-spin" style={{ border: '2px solid #1A1F2E', borderTopColor: '#8B5CF6' }} />
          <span className="font-body text-sm" style={{ color: '#4A5568' }}>AI is analyzing your trading data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="font-display text-2xl font-bold" style={{ color: '#E8ECF1', letterSpacing: '-0.02em' }}>
              AI Analyzer
            </h1>
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
              style={{ background: 'rgba(139,92,246,0.15)', color: '#8B5CF6', border: '1px solid rgba(139,92,246,0.3)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] animate-pulse" />
              AI-Powered
            </span>
          </div>
          <p className="font-body text-sm" style={{ color: '#7A8BA7' }}>
            Your personal trading accountability agent — analyzing rules, patterns, and progress.
          </p>
        </div>
        <button
          onClick={refreshAnalysis}
          disabled={refreshing}
          className="font-body rounded-lg px-5 py-2.5 text-sm font-semibold transition-all duration-200 hover:border-[#8B5CF6]/50 flex items-center gap-2"
          style={{ border: '1px solid rgba(139,92,246,0.3)', color: '#8B5CF6' }}
        >
          <svg className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          {refreshing ? "Analyzing..." : "Re-Analyze"}
        </button>
      </div>

      {/* Health Score */}
      {report && (
        <div className="rounded-xl p-6" style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Score Circle */}
            <div className="relative w-36 h-36 flex-shrink-0">
              <svg className="w-36 h-36 -rotate-90" viewBox="0 0 144 144">
                <circle cx="72" cy="72" r="62" fill="none" stroke="#1A1F2E" strokeWidth="10" />
                <circle
                  cx="72" cy="72" r="62" fill="none"
                  stroke={getHealthColor(report.healthScore)}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${(report.healthScore / 100) * 389.56} 389.56`}
                  style={{ transition: 'stroke-dasharray 1s ease-out' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono text-4xl font-bold" style={{ color: getHealthColor(report.healthScore) }}>
                  {report.healthScore}
                </span>
                <span className="font-body text-xs mt-1" style={{ color: '#7A8BA7' }}>
                  {getHealthLabel(report.healthScore)}
                </span>
              </div>
            </div>

            {/* Compliance Bars */}
            <div className="flex-1 w-full space-y-4">
              <p className="font-display text-sm font-semibold mb-3" style={{ color: '#E8ECF1', letterSpacing: '-0.02em' }}>
                Rule Compliance
              </p>
              {[
                { label: "HTF Alignment", score: report.ruleCompliance.htfAlignment.score, detail: `${report.ruleCompliance.htfAlignment.aligned}/${report.ruleCompliance.htfAlignment.total} trades` },
                { label: "Plan Adherence", score: report.ruleCompliance.planAdherence.score, detail: `${report.ruleCompliance.planAdherence.followed}/${report.ruleCompliance.planAdherence.total} plans` },
                { label: "Risk Management", score: report.ruleCompliance.riskManagement.score, detail: `${report.ruleCompliance.riskManagement.violations} violations` },
                { label: "Max Trades", score: report.ruleCompliance.maxTradesRespected.score, detail: `${report.ruleCompliance.maxTradesRespected.violations} overtrading days` },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-body text-xs" style={{ color: '#7A8BA7' }}>{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs" style={{ color: '#4A5568' }}>{item.detail}</span>
                      <span className="font-mono text-sm font-semibold" style={{ color: getHealthColor(item.score) }}>
                        {item.score}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full rounded-full h-1.5" style={{ background: '#1A1F2E' }}>
                    <div
                      className="h-1.5 rounded-full transition-all duration-700"
                      style={{ width: `${item.score}%`, background: getHealthColor(item.score) }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-lg" style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}>
        {[
          { key: "insights" as const, label: "AI Insights", count: report?.insights.length || 0 },
          { key: "compliance" as const, label: "Patterns & Trends" },
          { key: "whatsapp" as const, label: "WhatsApp Reports" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-200"
            style={{
              background: activeTab === tab.key ? '#1A1F2E' : 'transparent',
              color: activeTab === tab.key ? '#E8ECF1' : '#7A8BA7',
              border: activeTab === tab.key ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
            }}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className="font-mono text-[11px] px-1.5 py-0.5 rounded-full"
                style={{ background: 'rgba(139,92,246,0.2)', color: '#8B5CF6' }}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* AI Insights Tab */}
      {activeTab === "insights" && report && (
        <div className="space-y-4">
          {report.insights.length === 0 ? (
            <div className="rounded-xl p-8 text-center" style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(0,212,170,0.1)' }}>
                <svg className="w-8 h-8 text-[#00D4AA]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="font-display font-semibold" style={{ color: '#E8ECF1' }}>All Clear!</p>
              <p className="font-body text-sm mt-1" style={{ color: '#7A8BA7' }}>
                No issues detected. Keep logging trades to get more detailed analysis.
              </p>
            </div>
          ) : (
            report.insights.map((insight) => {
              const config = CATEGORY_CONFIG[insight.category];
              return (
                <div
                  key={insight.id}
                  className="rounded-xl p-5 transition-all duration-200"
                  style={{
                    background: config.bg,
                    border: `1px solid ${config.border}`,
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: `${config.color}15`, color: config.color }}
                    >
                      {config.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1.5">
                        <h3 className="font-display text-sm font-semibold" style={{ color: '#E8ECF1', letterSpacing: '-0.02em' }}>
                          {insight.title}
                        </h3>
                        <span
                          className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                          style={{ background: `${config.color}20`, color: config.color }}
                        >
                          {config.label}
                        </span>
                        {insight.metric && (
                          <span className="font-mono text-xs font-semibold" style={{ color: config.color }}>
                            {insight.metric}
                          </span>
                        )}
                      </div>
                      <p className="font-body text-sm leading-relaxed" style={{ color: '#7A8BA7' }}>
                        {insight.description}
                      </p>
                      {insight.recommendation && (
                        <div className="mt-3 rounded-lg p-3 flex items-start gap-2.5" style={{ background: '#0B0E14', border: '1px solid rgba(255,255,255,0.04)' }}>
                          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="#8B5CF6" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                          </svg>
                          <div>
                            <p className="font-body text-xs font-medium" style={{ color: '#8B5CF6' }}>Recommendation</p>
                            <p className="font-body text-xs mt-0.5" style={{ color: '#7A8BA7' }}>
                              {insight.recommendation}
                            </p>
                          </div>
                        </div>
                      )}
                      {insight.relatedNlp && (
                        <Link
                          href={NLP_ROUTES[insight.relatedNlp] || "/nlp"}
                          className="inline-flex items-center gap-1.5 mt-3 text-xs font-medium transition-colors hover:text-[#A78BFA]"
                          style={{ color: '#8B5CF6' }}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                          </svg>
                          Practice {insight.relatedNlp.charAt(0) + insight.relatedNlp.slice(1).toLowerCase()} Technique →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Patterns & Trends Tab */}
      {activeTab === "compliance" && report && (
        <div className="space-y-6">
          {/* Pattern Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl p-5" style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="font-body text-xs uppercase tracking-wider mb-2" style={{ color: '#4A5568' }}>Win Rate Trend</p>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xl font-bold" style={{
                  color: report.patterns.winRateTrend === "improving" ? "#00D4AA" :
                    report.patterns.winRateTrend === "declining" ? "#EF4444" : "#7A8BA7"
                }}>
                  {report.patterns.winRateTrend === "improving" ? "↑" : report.patterns.winRateTrend === "declining" ? "↓" : "→"}
                </span>
                <span className="font-body text-sm capitalize" style={{ color: '#E8ECF1' }}>
                  {report.patterns.winRateTrend}
                </span>
              </div>
            </div>
            <div className="rounded-xl p-5" style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="font-body text-xs uppercase tracking-wider mb-2" style={{ color: '#4A5568' }}>Best Session</p>
              <p className="font-mono text-lg font-semibold" style={{ color: '#00D4AA' }}>
                {report.patterns.bestSession || "N/A"}
              </p>
            </div>
            <div className="rounded-xl p-5" style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="font-body text-xs uppercase tracking-wider mb-2" style={{ color: '#4A5568' }}>Best Setup</p>
              <p className="font-mono text-sm font-semibold" style={{ color: '#00D4AA' }}>
                {report.patterns.bestSetupType?.replace(/_/g, " ") || "N/A"}
              </p>
            </div>
            <div className="rounded-xl p-5" style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="font-body text-xs uppercase tracking-wider mb-2" style={{ color: '#4A5568' }}>Danger Zone</p>
              <p className="font-mono text-sm font-semibold" style={{ color: '#EF4444' }}>
                {report.patterns.worstEmotionalState
                  ? `${report.patterns.worstEmotionalState} state`
                  : report.patterns.worstSetupType
                  ? report.patterns.worstSetupType.replace(/_/g, " ")
                  : "None"}
              </p>
            </div>
          </div>

          {/* Behavioral Alerts */}
          <div className="rounded-xl p-6" style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 className="font-display text-sm font-semibold mb-4" style={{ color: '#E8ECF1', letterSpacing: '-0.02em' }}>
              Behavioral Alerts
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg p-4 flex items-center gap-4" style={{ background: '#1A1F2E', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{
                  background: report.patterns.revengeTrading > 0 ? 'rgba(239,68,68,0.15)' : 'rgba(0,212,170,0.15)',
                }}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={report.patterns.revengeTrading > 0 ? "#EF4444" : "#00D4AA"}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                  </svg>
                </div>
                <div>
                  <p className="font-body text-xs" style={{ color: '#7A8BA7' }}>Revenge Trading</p>
                  <p className="font-mono text-lg font-semibold" style={{
                    color: report.patterns.revengeTrading > 0 ? '#EF4444' : '#00D4AA'
                  }}>
                    {report.patterns.revengeTrading > 0 ? `${report.patterns.revengeTrading} detected` : "Clean"}
                  </p>
                </div>
              </div>
              <div className="rounded-lg p-4 flex items-center gap-4" style={{ background: '#1A1F2E', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{
                  background: report.patterns.overtrading > 0 ? 'rgba(245,158,11,0.15)' : 'rgba(0,212,170,0.15)',
                }}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={report.patterns.overtrading > 0 ? "#F59E0B" : "#00D4AA"}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                </div>
                <div>
                  <p className="font-body text-xs" style={{ color: '#7A8BA7' }}>Overtrading Days</p>
                  <p className="font-mono text-lg font-semibold" style={{
                    color: report.patterns.overtrading > 0 ? '#F59E0B' : '#00D4AA'
                  }}>
                    {report.patterns.overtrading > 0 ? `${report.patterns.overtrading} days` : "None"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Trend Chart */}
          {report.weeklyTrend.length > 0 && (
            <div className="rounded-xl p-6" style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 className="font-display text-sm font-semibold mb-4" style={{ color: '#E8ECF1', letterSpacing: '-0.02em' }}>
                Weekly Performance Trend
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <th className="font-body text-xs text-left py-2 px-3" style={{ color: '#4A5568' }}>Week</th>
                      <th className="font-body text-xs text-right py-2 px-3" style={{ color: '#4A5568' }}>Trades</th>
                      <th className="font-body text-xs text-right py-2 px-3" style={{ color: '#4A5568' }}>Win Rate</th>
                      <th className="font-body text-xs text-right py-2 px-3" style={{ color: '#4A5568' }}>P&L</th>
                      <th className="font-body text-xs text-right py-2 px-3" style={{ color: '#4A5568' }}>Discipline</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.weeklyTrend.map((week) => (
                      <tr key={week.week} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <td className="font-mono text-xs py-2.5 px-3" style={{ color: '#7A8BA7' }}>{week.week}</td>
                        <td className="font-mono text-xs text-right py-2.5 px-3" style={{ color: '#E8ECF1' }}>{week.trades}</td>
                        <td className="font-mono text-xs text-right py-2.5 px-3" style={{ color: week.winRate >= 50 ? '#00D4AA' : '#EF4444' }}>
                          {week.winRate}%
                        </td>
                        <td className="font-mono text-xs text-right py-2.5 px-3" style={{ color: week.pnl >= 0 ? '#00D4AA' : '#EF4444' }}>
                          {week.pnl >= 0 ? "+" : ""}{week.pnl}
                        </td>
                        <td className="font-mono text-xs text-right py-2.5 px-3">
                          <span
                            className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold"
                            style={{
                              background: week.discipline >= 80 ? 'rgba(0,212,170,0.15)' : week.discipline >= 60 ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                              color: week.discipline >= 80 ? '#00D4AA' : week.discipline >= 60 ? '#F59E0B' : '#EF4444',
                            }}
                          >
                            {week.discipline}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* WhatsApp Reports Tab */}
      {activeTab === "whatsapp" && (
        <div className="space-y-6">
          {/* WhatsApp Settings Card */}
          <div className="rounded-xl p-6" style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(37,211,102,0.15)' }}>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#25D366">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <div>
                <h3 className="font-display text-sm font-semibold" style={{ color: '#E8ECF1', letterSpacing: '-0.02em' }}>
                  WhatsApp Daily Report
                </h3>
                <p className="font-body text-xs" style={{ color: '#7A8BA7' }}>
                  Get your AI trading report delivered to WhatsApp every morning.
                </p>
              </div>
            </div>

            {/* Enable Toggle */}
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <label className="font-body text-sm" style={{ color: '#E8ECF1' }}>Enable WhatsApp Reports</label>
                <button
                  onClick={() => setWhatsappSettings((s) => ({ ...s, whatsappEnabled: !s.whatsappEnabled }))}
                  className="relative w-11 h-6 rounded-full transition-colors duration-200"
                  style={{ background: whatsappSettings.whatsappEnabled ? '#00D4AA' : '#1A1F2E' }}
                >
                  <span
                    className="absolute top-0.5 w-5 h-5 rounded-full transition-transform duration-200"
                    style={{
                      background: '#E8ECF1',
                      left: whatsappSettings.whatsappEnabled ? '22px' : '2px',
                    }}
                  />
                </button>
              </div>

              {/* Phone Number */}
              <div>
                <label className="font-body text-xs block mb-1.5" style={{ color: '#7A8BA7' }}>
                  WhatsApp Phone Number (international format)
                </label>
                <input
                  type="tel"
                  placeholder="+1234567890"
                  value={whatsappSettings.whatsappNumber || ""}
                  onChange={(e) => setWhatsappSettings((s) => ({ ...s, whatsappNumber: e.target.value || null }))}
                  className="w-full rounded-lg px-4 py-2.5 text-sm font-mono outline-none transition-all duration-200 focus:border-[#00D4AA]/30"
                  style={{ background: '#1A1F2E', border: '1px solid rgba(255,255,255,0.06)', color: '#E8ECF1' }}
                />
              </div>

              {/* Time and Timezone */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-body text-xs block mb-1.5" style={{ color: '#7A8BA7' }}>Report Time</label>
                  <input
                    type="time"
                    value={whatsappSettings.reportTime}
                    onChange={(e) => setWhatsappSettings((s) => ({ ...s, reportTime: e.target.value }))}
                    className="w-full rounded-lg px-4 py-2.5 text-sm font-mono outline-none transition-all duration-200 focus:border-[#00D4AA]/30"
                    style={{ background: '#1A1F2E', border: '1px solid rgba(255,255,255,0.06)', color: '#E8ECF1' }}
                  />
                </div>
                <div>
                  <label className="font-body text-xs block mb-1.5" style={{ color: '#7A8BA7' }}>Timezone</label>
                  <select
                    value={whatsappSettings.timezone}
                    onChange={(e) => setWhatsappSettings((s) => ({ ...s, timezone: e.target.value }))}
                    className="w-full rounded-lg px-4 py-2.5 text-sm font-mono outline-none transition-all duration-200 focus:border-[#00D4AA]/30"
                    style={{ background: '#1A1F2E', border: '1px solid rgba(255,255,255,0.06)', color: '#E8ECF1' }}
                  >
                    {TIMEZONES.map((tz) => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Report Content Preferences */}
              <div>
                <p className="font-body text-xs mb-3" style={{ color: '#7A8BA7' }}>Include in Report</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { key: "includeTradeStats" as const, label: "Trade Statistics" },
                    { key: "includeDailyPlan" as const, label: "Daily Plan Reminder" },
                    { key: "includeHabitReminder" as const, label: "Habit Checklist" },
                    { key: "includeAiInsights" as const, label: "AI Insights" },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className="flex items-center gap-3 rounded-lg px-4 py-3 cursor-pointer transition-all duration-200 hover:border-[#00D4AA]/20"
                      style={{ background: '#1A1F2E', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      <input
                        type="checkbox"
                        checked={whatsappSettings[item.key]}
                        onChange={(e) => setWhatsappSettings((s) => ({ ...s, [item.key]: e.target.checked }))}
                        className="sr-only"
                      />
                      <div
                        className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-colors"
                        style={{
                          background: whatsappSettings[item.key] ? '#00D4AA' : '#0B0E14',
                          border: whatsappSettings[item.key] ? 'none' : '1px solid rgba(255,255,255,0.15)',
                        }}
                      >
                        {whatsappSettings[item.key] && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="font-body text-sm" style={{ color: '#E8ECF1' }}>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Status Messages */}
              {settingsMessage && (
                <div
                  className="rounded-lg px-4 py-3 text-sm font-body"
                  style={{
                    background: settingsMessage.type === "success" ? 'rgba(0,212,170,0.1)' : 'rgba(239,68,68,0.1)',
                    border: `1px solid ${settingsMessage.type === "success" ? 'rgba(0,212,170,0.3)' : 'rgba(239,68,68,0.3)'}`,
                    color: settingsMessage.type === "success" ? '#00D4AA' : '#EF4444',
                  }}
                >
                  {settingsMessage.text}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={saveWhatsAppSettings}
                  disabled={savingSettings}
                  className="font-body text-white font-semibold rounded-lg px-5 py-2.5 text-sm transition-all duration-200"
                  style={{ background: 'linear-gradient(135deg, #00D4AA 0%, #3B82F6 100%)' }}
                >
                  {savingSettings ? "Saving..." : "Save Settings"}
                </button>
                <button
                  onClick={previewReport}
                  disabled={sendingReport}
                  className="font-body rounded-lg px-5 py-2.5 text-sm font-semibold transition-all duration-200 hover:border-[#00D4AA]/30"
                  style={{ border: '1px solid rgba(0,212,170,0.3)', color: '#00D4AA' }}
                >
                  {sendingReport ? "Generating..." : "Preview Report"}
                </button>
                {whatsappSettings.whatsappEnabled && whatsappSettings.whatsappNumber && (
                  <button
                    onClick={sendReportNow}
                    disabled={sendingReport}
                    className="font-body rounded-lg px-5 py-2.5 text-sm font-semibold transition-all duration-200 hover:border-[#25D366]/50 flex items-center gap-2"
                    style={{ border: '1px solid rgba(37,211,102,0.3)', color: '#25D366' }}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                    </svg>
                    Send Now
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Report Preview */}
          {reportPreview && (
            <div className="rounded-xl p-6" style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-4 h-4 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <h3 className="font-display text-sm font-semibold" style={{ color: '#E8ECF1', letterSpacing: '-0.02em' }}>
                  Report Preview
                </h3>
              </div>
              <pre
                className="font-body text-sm whitespace-pre-wrap rounded-lg p-4 leading-relaxed"
                style={{ background: '#0B0E14', border: '1px solid rgba(255,255,255,0.04)', color: '#7A8BA7' }}
              >
                {reportPreview}
              </pre>
            </div>
          )}

          {/* Setup Instructions */}
          <div className="rounded-xl p-6" style={{ background: '#111621', border: '1px solid rgba(139,92,246,0.15)', borderLeft: '3px solid #8B5CF6' }}>
            <h3 className="font-display text-sm font-semibold mb-3" style={{ color: '#E8ECF1', letterSpacing: '-0.02em' }}>
              Setup Instructions
            </h3>
            <div className="space-y-3 font-body text-xs" style={{ color: '#7A8BA7' }}>
              <p>To enable automated WhatsApp reports, you need:</p>
              <ol className="list-decimal list-inside space-y-2 ml-2">
                <li>A <span style={{ color: '#E8ECF1' }}>Twilio account</span> with WhatsApp sandbox or approved number</li>
                <li>Set these environment variables on your server:
                  <div className="mt-1.5 rounded-lg p-3 font-mono text-[11px]" style={{ background: '#0B0E14', border: '1px solid rgba(255,255,255,0.04)', color: '#00D4AA' }}>
                    TWILIO_ACCOUNT_SID=your_sid<br />
                    TWILIO_AUTH_TOKEN=your_token<br />
                    TWILIO_WHATSAPP_FROM=whatsapp:+14155238886<br />
                    CRON_SECRET=your_secret
                  </div>
                </li>
                <li>Set up a <span style={{ color: '#E8ECF1' }}>cron job</span> that calls <code className="font-mono text-[11px] px-1.5 py-0.5 rounded" style={{ background: '#1A1F2E', color: '#00D4AA' }}>GET /api/cron/daily-report</code> every hour with the Authorization header</li>
                <li>For Twilio sandbox: send <span style={{ color: '#E8ECF1' }}>&quot;join [your-sandbox-word]&quot;</span> from your WhatsApp to the Twilio sandbox number</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Last Analyzed */}
      {report && (
        <div className="text-center font-body text-xs py-2" style={{ color: '#4A5568' }}>
          Last analyzed: {new Date(report.lastAnalyzed).toLocaleString()}
        </div>
      )}
    </div>
  );
}
