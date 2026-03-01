"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

const DAILY_AFFIRMATIONS = [
  "I am a consistently profitable trader because I follow my rules.",
  "Every trade I take is a reflection of my discipline and preparation.",
  "I release attachment to individual outcomes and focus on my process.",
  "My edge plays out over hundreds of trades -- one loss means nothing.",
  "I trade from a place of abundance, never from fear or scarcity.",
  "I am grateful for the markets and the opportunities they provide.",
  "I honor my stop-losses because they protect my future.",
  "I am calm in volatility and patient in consolidation.",
  "My trading plan is my compass, and I follow it without exception.",
  "I deserve success because I put in the work every single day.",
];

const NEGATIVE_PATTERNS = [
  "always", "never", "can't", "cannot", "should have", "could have",
  "would have", "stupid", "terrible", "worst", "idiot", "hopeless",
  "impossible", "hate", "awful", "failure", "loser", "dumb",
  "pathetic", "useless", "ruined", "disaster", "doomed",
];

const POSITIVE_PATTERNS = [
  "will", "can", "able", "improving", "learning", "growing",
  "confident", "disciplined", "patient", "focused", "calm",
  "prepared", "strong", "capable", "resilient", "grateful",
  "opportunity", "progress", "better", "succeed", "win",
];

const DEFAULT_REPLACEMENTS = [
  {
    negative: "I always lose",
    positive: "I am improving with every trade",
  },
  {
    negative: "I should have taken that trade",
    positive: "I will prepare better for the next opportunity",
  },
  {
    negative: "The market is against me",
    positive: "The market is neutral; I control my response",
  },
  {
    negative: "I can't stop overtrading",
    positive: "I am building discipline one session at a time",
  },
  {
    negative: "I'm the worst trader ever",
    positive: "I am on a journey of growth and every expert was once a beginner",
  },
];

const SUGGESTED_REPHRASES: Record<string, string> = {
  "always": "sometimes",
  "never": "not yet",
  "can't": "am learning to",
  "cannot": "am learning to",
  "should have": "will next time",
  "could have": "will prepare to",
  "would have": "will plan to",
  "stupid": "still learning",
  "terrible": "challenging",
  "worst": "a difficult",
  "idiot": "growing trader",
  "hopeless": "a work in progress",
  "impossible": "challenging but achievable",
  "hate": "find difficult",
  "awful": "not ideal",
  "failure": "learning experience",
  "loser": "developing trader",
  "dumb": "inexperienced so far",
  "pathetic": "developing",
  "useless": "evolving",
  "ruined": "temporarily setback",
  "disaster": "tough experience",
  "doomed": "in a challenging phase",
};

export default function DialoguePage() {
  const [journalText, setJournalText] = useState("");
  const [analyzed, setAnalyzed] = useState(false);
  const [replacements, setReplacements] = useState(DEFAULT_REPLACEMENTS);
  const [newNegative, setNewNegative] = useState("");
  const [newPositive, setNewPositive] = useState("");
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Random daily affirmation (stable for the session)
  const [dailyAffirmation] = useState(
    () => DAILY_AFFIRMATIONS[Math.floor(Math.random() * DAILY_AFFIRMATIONS.length)]
  );

  // Analysis results
  const analysis = useMemo(() => {
    if (!analyzed || !journalText) return null;

    const lowerText = journalText.toLowerCase();

    const foundNegative: { word: string; count: number }[] = [];
    const foundPositive: { word: string; count: number }[] = [];

    NEGATIVE_PATTERNS.forEach((pattern) => {
      const regex = new RegExp(`\\b${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, "gi");
      const matches = lowerText.match(regex);
      if (matches) {
        foundNegative.push({ word: pattern, count: matches.length });
      }
    });

    POSITIVE_PATTERNS.forEach((pattern) => {
      const regex = new RegExp(`\\b${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, "gi");
      const matches = lowerText.match(regex);
      if (matches) {
        foundPositive.push({ word: pattern, count: matches.length });
      }
    });

    const negativeCount = foundNegative.reduce((sum, f) => sum + f.count, 0);
    const positiveCount = foundPositive.reduce((sum, f) => sum + f.count, 0);

    // Build highlighted text
    let highlightedText = journalText;
    const allNegativeRegex = NEGATIVE_PATTERNS.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join("|");
    const negRegex = new RegExp(`\\b(${allNegativeRegex})\\b`, "gi");

    const segments: { text: string; isNegative: boolean }[] = [];
    let lastIndex = 0;
    let match;

    while ((match = negRegex.exec(highlightedText)) !== null) {
      if (match.index > lastIndex) {
        segments.push({ text: highlightedText.slice(lastIndex, match.index), isNegative: false });
      }
      segments.push({ text: match[0], isNegative: true });
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < highlightedText.length) {
      segments.push({ text: highlightedText.slice(lastIndex), isNegative: false });
    }

    // Suggested rephrases
    const suggestions: { original: string; replacement: string }[] = [];
    foundNegative.forEach(({ word }) => {
      if (SUGGESTED_REPHRASES[word.toLowerCase()]) {
        suggestions.push({
          original: word,
          replacement: SUGGESTED_REPHRASES[word.toLowerCase()],
        });
      }
    });

    return {
      foundNegative,
      foundPositive,
      negativeCount,
      positiveCount,
      segments,
      suggestions,
    };
  }, [analyzed, journalText]);

  const handleAddReplacement = () => {
    if (newNegative.trim() && newPositive.trim()) {
      setReplacements([...replacements, { negative: newNegative.trim(), positive: newPositive.trim() }]);
      setNewNegative("");
      setNewPositive("");
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/nlp-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          technique: "dialogue",
          duration: 0,
          notes: JSON.stringify({
            journalText,
            negativeCount: analysis?.negativeCount || 0,
            positiveCount: analysis?.positiveCount || 0,
            customReplacements: replacements.slice(DEFAULT_REPLACEMENTS.length),
          }),
          rating: 0,
          triggerError: "All psychological trading errors",
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

      {/* Daily Affirmation */}
      <div className="bg-[#1c1c1e] rounded-2xl p-6 text-center">
        <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mb-2">Daily Affirmation</p>
        <p className="text-zinc-300 text-xl font-medium italic">&quot;{dailyAffirmation}&quot;</p>
      </div>

      {/* Title */}
      <div className="bg-[#1c1c1e] rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-white/5 rounded-xl">
            <svg className="w-8 h-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-white tracking-tight">Internal Dialogue</h1>
            <p className="text-zinc-500 text-sm font-medium">NLP Technique</p>
          </div>
        </div>
      </div>

      {/* Master Your Inner Voice */}
      <div className="bg-[#1c1c1e] rounded-2xl p-6">
        <h2 className="text-lg font-medium text-white mb-3">Master Your Inner Voice</h2>
        <p className="text-zinc-400 leading-relaxed">
          Your internal dialogue -- the constant stream of thoughts running through your mind --
          has a profound impact on your trading performance. Negative self-talk creates anxiety,
          impulsiveness, and poor decision-making. By becoming aware of your internal dialogue
          patterns and consciously replacing destructive thoughts with empowering ones, you can
          transform your trading psychology from your biggest enemy into your greatest asset.
        </p>
      </div>

      {/* Journal Analysis Tool */}
      <div className="bg-[#1c1c1e] rounded-2xl p-6 space-y-6">
        <h2 className="text-lg font-medium text-white">Thought Journal Analysis</h2>
        <p className="text-zinc-400 text-sm">
          Write your current trading thoughts, and we will analyze them for negative patterns.
        </p>

        {/* Input */}
        <div className="space-y-2">
          <label className="text-white font-medium block">Write your current trading thoughts</label>
          <textarea
            value={journalText}
            onChange={(e) => {
              setJournalText(e.target.value);
              setAnalyzed(false);
            }}
            rows={6}
            placeholder="e.g., I always seem to lose on Mondays. I should have taken that EUR/USD trade yesterday. I can't believe I missed another setup. The market is terrible today and I feel stupid for not seeing the reversal..."
            className="w-full bg-white/5 border-0 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-white/20 placeholder-zinc-600 resize-none"
          />
        </div>

        <button
          onClick={() => setAnalyzed(true)}
          disabled={!journalText.trim()}
          className="bg-white text-black rounded-full text-[13px] font-medium px-5 py-2 hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Analyze
        </button>

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-6">
            {/* Counts */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#ff453a]/10 rounded-2xl p-4 text-center">
                <p className="text-3xl font-semibold text-[#ff453a]">{analysis.negativeCount}</p>
                <p className="text-zinc-400 text-sm mt-1">Negative Phrases</p>
              </div>
              <div className="bg-[#30d158]/10 rounded-2xl p-4 text-center">
                <p className="text-3xl font-semibold text-[#30d158]">{analysis.positiveCount}</p>
                <p className="text-zinc-400 text-sm mt-1">Positive Phrases</p>
              </div>
            </div>

            {/* Ratio indicator */}
            {(analysis.negativeCount + analysis.positiveCount) > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#ff453a]">Negative</span>
                  <span className="text-[#30d158]">Positive</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3 flex overflow-hidden">
                  <div
                    className="bg-[#ff453a] h-3 transition-all duration-500"
                    style={{
                      width: `${(analysis.negativeCount / (analysis.negativeCount + analysis.positiveCount)) * 100}%`,
                    }}
                  />
                  <div
                    className="bg-[#30d158] h-3 transition-all duration-500"
                    style={{
                      width: `${(analysis.positiveCount / (analysis.negativeCount + analysis.positiveCount)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Highlighted Text */}
            <div className="space-y-2">
              <h3 className="text-white font-medium">Your text with highlighted patterns:</h3>
              <div className="bg-white/[0.04] rounded-xl p-4">
                <p className="leading-relaxed">
                  {analysis.segments.map((seg, i) =>
                    seg.isNegative ? (
                      <span key={i} className="bg-[#ff453a]/30 text-[#ff453a] px-0.5 rounded">
                        {seg.text}
                      </span>
                    ) : (
                      <span key={i} className="text-zinc-300">{seg.text}</span>
                    )
                  )}
                </p>
              </div>
            </div>

            {/* Suggested Rephrases */}
            {analysis.suggestions.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-white font-medium">Suggested Replacements:</h3>
                <div className="space-y-2">
                  {analysis.suggestions.map((sug, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white/[0.04] rounded-xl p-3">
                      <span className="text-[#ff453a] line-through">&quot;{sug.original}&quot;</span>
                      <svg className="w-4 h-4 text-zinc-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                      <span className="text-[#30d158]">&quot;{sug.replacement}&quot;</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {analysis.negativeCount === 0 && (
              <div className="bg-[#30d158]/10 text-[#30d158] rounded-2xl p-4 text-center">
                <svg className="w-8 h-8 text-[#30d158] mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-medium">Great job! No negative self-talk patterns detected.</p>
                <p className="text-zinc-400 text-sm mt-1">Keep maintaining this positive internal dialogue.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dialogue Replacement Exercise */}
      <div className="bg-[#1c1c1e] rounded-2xl p-6 space-y-6">
        <h2 className="text-lg font-medium text-white">Dialogue Replacement Exercise</h2>
        <p className="text-zinc-400 text-sm">
          Practice replacing negative self-talk with empowering alternatives. Review the examples and add your own.
        </p>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left text-zinc-500 text-sm font-medium py-3 pr-4">Negative Self-Talk</th>
                <th className="text-left text-zinc-500 text-sm font-medium py-3 pl-4">Positive Replacement</th>
              </tr>
            </thead>
            <tbody>
              {replacements.map((item, i) => (
                <tr key={i} className="border-b border-white/[0.06]">
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-[#ff453a] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <p className="text-[#ff453a]/80 text-sm">&quot;{item.negative}&quot;</p>
                    </div>
                  </td>
                  <td className="py-4 pl-4">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-[#30d158] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <p className="text-[#30d158]/80 text-sm">&quot;{item.positive}&quot;</p>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Custom Entry */}
        <div className="bg-white/[0.04] rounded-xl p-4 space-y-3">
          <h3 className="text-white font-medium text-sm">Add Your Own</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-zinc-500 text-xs block mb-1">Negative Self-Talk</label>
              <input
                type="text"
                value={newNegative}
                onChange={(e) => setNewNegative(e.target.value)}
                placeholder='e.g., "I will never be profitable"'
                className="w-full bg-white/5 border-0 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-white/20 placeholder-zinc-600 text-sm"
              />
            </div>
            <div>
              <label className="text-zinc-500 text-xs block mb-1">Positive Replacement</label>
              <input
                type="text"
                value={newPositive}
                onChange={(e) => setNewPositive(e.target.value)}
                placeholder='e.g., "I am building profitability one trade at a time"'
                className="w-full bg-white/5 border-0 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-white/20 placeholder-zinc-600 text-sm"
              />
            </div>
          </div>
          <button
            onClick={handleAddReplacement}
            disabled={!newNegative.trim() || !newPositive.trim()}
            className="bg-white/10 text-white rounded-full text-[13px] font-medium px-5 py-2 hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Entry
          </button>
        </div>
      </div>

      {/* Targeted Errors */}
      <div className="bg-[#1c1c1e] rounded-2xl p-6">
        <h2 className="text-lg font-medium text-white mb-4">Targeted Trading Errors</h2>
        <div className="flex flex-wrap gap-3">
          <span className="px-5 py-2 bg-white/10 rounded-full text-zinc-400 text-[13px] font-medium">
            All psychological trading errors
          </span>
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
