"use client";

import { useState } from "react";
import Link from "next/link";

const REFRAME_SUGGESTIONS = [
  "A small loss is a tuition fee for market education",
  "Missing this trade means preserving capital for the perfect setup",
  "This loss proved my stop-loss discipline works perfectly",
  "Every losing trade is data that makes my strategy stronger",
  "The market just taught me a lesson I could not buy with money",
  "This drawdown is temporary; my discipline is permanent",
  "I did not lose money -- I invested in experience",
  "This trade did not work, but my process was sound",
];

const COMMON_REFRAMES = [
  {
    negative: "I lost money on that trade, I am a terrible trader",
    positive: "Every professional trader has losing trades. What matters is my overall edge and risk management.",
    error: "Loss Aversion",
  },
  {
    negative: "I missed that huge move, I always miss the best trades",
    positive: "I preserved my capital by waiting for my setup. Discipline beats FOMO every time.",
    error: "FOMO",
  },
  {
    negative: "The market took my stop then reversed -- it is rigged",
    positive: "My stop-loss protected me from a potentially larger loss. I will refine my placement for next time.",
    error: "Denial",
  },
  {
    negative: "I should have held longer, I left so much on the table",
    positive: "I followed my trading plan and took profits at my target. Consistency builds wealth.",
    error: "Greed",
  },
  {
    negative: "This position is down but it will come back, I will average down",
    positive: "Accepting a small loss now prevents a catastrophic one later. I honor my stop-loss.",
    error: "Averaging Down",
  },
  {
    negative: "I need to make back what I lost today",
    positive: "Each trade is independent. I will wait for my next A+ setup regardless of previous results.",
    error: "Revenge Trading",
  },
];

export default function ReframingPage() {
  const [negativeExperience, setNegativeExperience] = useState("");
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);
  const [userReframe, setUserReframe] = useState("");
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const getNewSuggestion = () => {
    setCurrentSuggestionIndex((prev) => (prev + 1) % REFRAME_SUGGESTIONS.length);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/nlp-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          technique: "reframing",
          duration: 0,
          notes: JSON.stringify({
            negativeExperience,
            suggestedReframe: REFRAME_SUGGESTIONS[currentSuggestionIndex],
            userReframe,
          }),
          rating: 0,
          triggerError: "Loss Aversion, Greed, Denial/Averaging Down",
        }),
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error("Failed to save session:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Toast */}
      {showToast && (
        <div className="fixed top-6 right-6 z-50 bg-[#30d158]/10 text-[#30d158] px-6 py-3 rounded-2xl">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Session saved successfully!
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/nlp"
          className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to NLP
        </Link>
      </div>

      {/* Title */}
      <div className="bg-[#1c1c1e] rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-white/5 rounded-xl">
            <svg className="w-8 h-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h16v16H4V4zm3 3h10v10H7V7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-white tracking-tight">Reframing</h1>
            <p className="text-zinc-500 text-sm font-medium">NLP Technique</p>
          </div>
        </div>
      </div>

      {/* What is Reframing */}
      <div className="bg-[#1c1c1e] rounded-2xl p-6">
        <h2 className="text-lg font-medium text-white mb-3">What is Reframing?</h2>
        <p className="text-zinc-400 leading-relaxed">
          Reframing is an NLP technique that changes the way you perceive an experience by
          shifting its context or meaning. Instead of seeing a trading loss as a failure,
          reframing helps you view it as valuable feedback, tuition, or confirmation that
          your risk management is working. By consistently reframing negative experiences,
          you break the emotional charge they hold and prevent them from causing destructive
          behaviors like revenge trading or excessive risk-taking.
        </p>
      </div>

      {/* Interactive Reframing Exercise */}
      <div className="bg-[#1c1c1e] rounded-2xl p-6 space-y-6">
        <h2 className="text-lg font-medium text-white">Reframing Exercise</h2>

        {/* Negative Experience Input */}
        <div className="space-y-2">
          <label className="text-white font-medium block">
            Describe a negative trading experience
          </label>
          <p className="text-zinc-500 text-sm">
            Write about a recent loss, missed trade, or frustrating moment.
          </p>
          <textarea
            value={negativeExperience}
            onChange={(e) => setNegativeExperience(e.target.value)}
            rows={4}
            placeholder="e.g., I took a loss on GBP/USD today because I entered too early without waiting for confirmation..."
            className="w-full bg-white/5 border-0 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-white/20 placeholder-zinc-600 resize-none"
          />
        </div>

        {/* AI-Generated Reframe Suggestion */}
        <div className="space-y-3">
          <label className="text-white font-medium block">Reframe Suggestion</label>
          <div className="bg-white/[0.04] rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-white/5 rounded-xl mt-0.5 shrink-0">
                <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <p className="text-zinc-300 text-lg italic leading-relaxed">
                &quot;{REFRAME_SUGGESTIONS[currentSuggestionIndex]}&quot;
              </p>
            </div>
          </div>
          <button
            onClick={getNewSuggestion}
            className="bg-white/10 text-white rounded-full text-[13px] font-medium px-5 py-2 hover:bg-white/15 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Get New Suggestion
          </button>
        </div>

        {/* User Writes Own Reframe */}
        <div className="space-y-2">
          <label className="text-white font-medium block">
            Write Your Own Reframe
          </label>
          <p className="text-zinc-500 text-sm">
            Now write your own positive reframe of the experience above.
          </p>
          <textarea
            value={userReframe}
            onChange={(e) => setUserReframe(e.target.value)}
            rows={4}
            placeholder="Write your positive reinterpretation of this experience..."
            className="w-full bg-white/5 border-0 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-white/20 placeholder-zinc-600 resize-none"
          />
        </div>
      </div>

      {/* Common Trading Reframes Table */}
      <div className="bg-[#1c1c1e] rounded-2xl p-6">
        <h2 className="text-lg font-medium text-white mb-4">Common Trading Reframes</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left text-zinc-500 text-sm font-medium py-3 pr-4">Error Type</th>
                <th className="text-left text-zinc-500 text-sm font-medium py-3 pr-4">Negative Thought</th>
                <th className="text-left text-zinc-500 text-sm font-medium py-3">Positive Reframe</th>
              </tr>
            </thead>
            <tbody>
              {COMMON_REFRAMES.map((item, i) => (
                <tr key={i} className="border-b border-white/[0.06]">
                  <td className="py-4 pr-4">
                    <span className="px-3 py-1 bg-white/10 rounded-full text-zinc-400 text-xs font-medium">
                      {item.error}
                    </span>
                  </td>
                  <td className="py-4 pr-4">
                    <p className="text-[#ff453a]/80 text-sm">{item.negative}</p>
                  </td>
                  <td className="py-4">
                    <p className="text-[#30d158]/80 text-sm">{item.positive}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Targeted Errors */}
      <div className="bg-[#1c1c1e] rounded-2xl p-6">
        <h2 className="text-lg font-medium text-white mb-4">Targeted Trading Errors</h2>
        <div className="flex flex-wrap gap-3">
          {["Loss Aversion", "Greed", "Denial/Averaging Down"].map((error) => (
            <span
              key={error}
              className="px-5 py-2 bg-white/10 rounded-full text-zinc-400 text-[13px] font-medium"
            >
              {error}
            </span>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-white text-black rounded-full text-[13px] font-medium px-5 py-2 hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {saving ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Save Session
            </>
          )}
        </button>
      </div>
    </div>
  );
}
