"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

const TRADING_ERRORS = [
  "Overtrading",
  "Revenge Trading",
  "FOMO Entry",
  "Greed - Moving TP",
  "Impulsive Exit",
];

export default function SwishPage() {
  const [selectedError, setSelectedError] = useState(TRADING_ERRORS[0]);
  const [idealResponse, setIdealResponse] = useState("");
  const [animating, setAnimating] = useState(false);
  const [swishComplete, setSwishComplete] = useState(false);
  const [repetitions, setRepetitions] = useState(0);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleSwish = useCallback(() => {
    if (animating) return;
    setAnimating(true);
    setSwishComplete(false);

    setTimeout(() => {
      setSwishComplete(true);
      setRepetitions((prev) => prev + 1);
      setTimeout(() => {
        setAnimating(false);
      }, 600);
    }, 1200);
  }, [animating]);

  const resetSwish = () => {
    setSwishComplete(false);
    setAnimating(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/nlp-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          technique: "swish",
          duration: 0,
          notes: JSON.stringify({
            selectedError,
            idealResponse,
            repetitions,
          }),
          rating,
          triggerError: "Overtrading, Revenge Trading, Impulsive Exits",
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
        <div className="fixed top-6 right-6 z-50 px-6 py-3 rounded-xl" style={{ background: 'rgba(0,212,170,0.1)', color: '#00D4AA' }}>
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
          className="transition-colors flex items-center gap-1 hover:opacity-80"
          style={{ color: '#7A8BA7' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#E8ECF1'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#7A8BA7'; }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to NLP
        </Link>
      </div>

      {/* Title */}
      <div className="rounded-xl p-8" style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl" style={{ background: '#1A1F2E' }}>
            <svg className="w-8 h-8" style={{ color: '#7A8BA7' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display" style={{ color: '#E8ECF1', letterSpacing: '-0.02em' }}>Swish Pattern</h1>
            <p className="text-sm font-medium" style={{ color: '#7A8BA7' }}>NLP Technique</p>
          </div>
        </div>
      </div>

      {/* What is the Swish Pattern */}
      <div className="rounded-xl p-6" style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}>
        <h2 className="text-lg font-semibold mb-3 font-display" style={{ color: '#E8ECF1', letterSpacing: '-0.02em' }}>What is the Swish Pattern?</h2>
        <p className="leading-relaxed font-body" style={{ color: '#7A8BA7' }}>
          The Swish Pattern is an NLP technique designed to break unwanted habits by replacing
          a negative mental image with a positive one. You visualize the unwanted behavior as
          a large, vivid picture, then rapidly &quot;swish&quot; it away while simultaneously
          bringing in a bright, compelling image of your ideal behavior. Through repetition,
          your brain begins to automatically redirect from the old pattern to the new one. For
          traders, this is incredibly powerful for breaking destructive impulses like revenge
          trading, FOMO entries, or premature exits.
        </p>
      </div>

      {/* Interactive Swish Exercise */}
      <div className="rounded-xl p-6 space-y-8" style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}>
        <h2 className="text-lg font-semibold mb-2 font-display" style={{ color: '#E8ECF1', letterSpacing: '-0.02em' }}>Interactive Swish Exercise</h2>

        {/* Step 1: Picture the Unwanted Behavior */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold" style={{ background: '#00D4AA', color: '#0B0E14' }}>1</span>
            <h3 className="font-medium" style={{ color: '#E8ECF1' }}>Picture the Unwanted Behavior</h3>
          </div>
          <p className="text-sm ml-9" style={{ color: '#7A8BA7' }}>Select the destructive trading behavior you want to eliminate.</p>
          <div className="ml-9">
            <select
              value={selectedError}
              onChange={(e) => setSelectedError(e.target.value)}
              className="w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-1"
              style={{ background: '#1A1F2E', border: '1px solid rgba(255,255,255,0.06)', color: '#E8ECF1' }}
            >
              {TRADING_ERRORS.map((err) => (
                <option key={err} value={err}>{err}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Step 2: Picture Your Ideal Response */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold" style={{ background: '#00D4AA', color: '#0B0E14' }}>2</span>
            <h3 className="font-medium" style={{ color: '#E8ECF1' }}>Picture Your Ideal Response</h3>
          </div>
          <p className="text-sm ml-9" style={{ color: '#7A8BA7' }}>Describe what your disciplined, ideal response looks like.</p>
          <div className="ml-9">
            <input
              type="text"
              value={idealResponse}
              onChange={(e) => setIdealResponse(e.target.value)}
              placeholder="e.g., I calmly close the chart and wait for my next A+ setup"
              className="w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-1 placeholder-[#4A5568]"
              style={{ background: '#1A1F2E', border: '1px solid rgba(255,255,255,0.06)', color: '#E8ECF1' }}
            />
          </div>
        </div>

        {/* Step 3: Swish! */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold" style={{ background: '#00D4AA', color: '#0B0E14' }}>3</span>
            <h3 className="font-medium" style={{ color: '#E8ECF1' }}>Swish!</h3>
          </div>
          <p className="text-sm ml-9" style={{ color: '#7A8BA7' }}>
            Click the button to perform the swish. Watch the negative image shrink and the positive one expand.
          </p>

          {/* Animation Area */}
          <div className="ml-9">
            <div className="relative rounded-xl p-8 min-h-[200px] flex items-center justify-center overflow-hidden" style={{ background: '#1A1F2E', border: '1px solid rgba(255,255,255,0.06)' }}>
              {/* Negative Behavior */}
              <div
                className="absolute inset-0 flex items-center justify-center transition-all duration-700 ease-in-out"
                style={{
                  opacity: animating || swishComplete ? 0 : 1,
                  transform: animating ? "scale(0.1)" : swishComplete ? "scale(0)" : "scale(1)",
                }}
              >
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.2)', border: '2px solid rgba(239,68,68,0.4)' }}>
                    <svg className="w-10 h-10 text-[#EF4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <p className="text-[#EF4444] font-semibold text-lg">{selectedError}</p>
                  <p className="text-sm mt-1" style={{ color: '#7A8BA7' }}>Unwanted behavior</p>
                </div>
              </div>

              {/* Positive Behavior */}
              <div
                className="absolute inset-0 flex items-center justify-center transition-all duration-700 ease-in-out"
                style={{
                  opacity: swishComplete ? 1 : 0,
                  transform: swishComplete ? "scale(1)" : "scale(0.1)",
                }}
              >
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,212,170,0.2)', border: '2px solid rgba(0,212,170,0.4)' }}>
                    <svg className="w-10 h-10 text-[#00D4AA]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-[#00D4AA] font-semibold text-lg">
                    {idealResponse || "Disciplined Response"}
                  </p>
                  <p className="text-sm mt-1" style={{ color: '#7A8BA7' }}>Your ideal behavior</p>
                </div>
              </div>

              {/* Swish flash effect */}
              {animating && (
                <div className="absolute inset-0 animate-pulse" style={{ background: 'rgba(0,212,170,0.1)' }} />
              )}
            </div>

            <div className="flex items-center gap-4 mt-4">
              <button
                onClick={handleSwish}
                disabled={animating}
                className="rounded-full text-[13px] font-medium px-5 py-2 disabled:opacity-50 transition-colors flex items-center gap-2"
                style={{ background: 'linear-gradient(135deg, #00D4AA 0%, #3B82F6 100%)', color: '#0B0E14' }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                SWISH!
              </button>
              {swishComplete && (
                <button
                  onClick={resetSwish}
                  className="rounded-full text-[13px] font-medium px-5 py-2 transition-colors"
                  style={{ background: 'rgba(255,255,255,0.06)', color: '#E8ECF1' }}
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Step 4: Repeat & Anchor */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold" style={{ background: '#00D4AA', color: '#0B0E14' }}>4</span>
            <h3 className="font-medium" style={{ color: '#E8ECF1' }}>Repeat &amp; Anchor</h3>
          </div>
          <p className="text-sm ml-9" style={{ color: '#7A8BA7' }}>
            Repeat the swish at least 5 times for maximum effectiveness. The more repetitions, the stronger the new neural pathway.
          </p>
          <div className="ml-9 flex items-center gap-4">
            <div className="rounded-xl px-6 py-4" style={{ background: '#1A1F2E', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-[11px] font-medium uppercase tracking-wider mb-1" style={{ color: '#7A8BA7' }}>Repetitions</p>
              <p className="text-3xl font-semibold font-mono" style={{ color: '#E8ECF1' }}>{repetitions}</p>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs mb-1">
                <span style={{ color: '#7A8BA7' }}>Progress</span>
                <span style={{ color: '#E8ECF1' }}>{Math.min(repetitions, 5)}/5 minimum</span>
              </div>
              <div className="w-full rounded-full h-2" style={{ background: '#1A1F2E' }}>
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min((repetitions / 5) * 100, 100)}%`,
                    background: repetitions >= 5 ? '#00D4AA' : 'linear-gradient(135deg, #00D4AA 0%, #3B82F6 100%)',
                  }}
                />
              </div>
              {repetitions >= 5 && (
                <p className="text-[#00D4AA] text-xs mt-1">Minimum reached! Keep going for stronger results.</p>
              )}
            </div>
          </div>
        </div>

        {/* Step 5: Rate Effectiveness */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold" style={{ background: '#00D4AA', color: '#0B0E14' }}>5</span>
            <h3 className="font-medium" style={{ color: '#E8ECF1' }}>Rate Effectiveness</h3>
          </div>
          <p className="text-sm ml-9" style={{ color: '#7A8BA7' }}>How strong was the pattern interruption?</p>
          <div className="ml-9 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 transition-transform hover:scale-110"
              >
                <svg
                  className={`w-8 h-8 ${
                    star <= (hoverRating || rating) ? "text-[#F59E0B]" : "text-[#4A5568]"
                  } transition-colors`}
                  fill={star <= (hoverRating || rating) ? "currentColor" : "none"}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-2 text-sm font-mono" style={{ color: '#7A8BA7' }}>{rating}/5</span>
            )}
          </div>
        </div>
      </div>

      {/* Targeted Errors */}
      <div className="rounded-xl p-6" style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}>
        <h2 className="text-lg font-semibold mb-4 font-display" style={{ color: '#E8ECF1', letterSpacing: '-0.02em' }}>Targeted Trading Errors</h2>
        <div className="flex flex-wrap gap-3">
          {["Overtrading", "Revenge Trading", "Impulsive Exits"].map((error) => (
            <span
              key={error}
              className="px-5 py-2 rounded-full text-[13px] font-medium"
              style={{ background: 'rgba(255,255,255,0.06)', color: '#7A8BA7' }}
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
          className="rounded-full text-[13px] font-medium px-5 py-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          style={{ background: 'linear-gradient(135deg, #00D4AA 0%, #3B82F6 100%)', color: '#0B0E14' }}
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
