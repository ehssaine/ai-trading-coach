"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

const STATES = ["CALM", "CONFIDENT", "FOCUSED", "PATIENT"] as const;

export default function AnchoringPage() {
  const [selectedState, setSelectedState] = useState<string>("CALM");
  const [anchor, setAnchor] = useState("");
  const [peakMoment, setPeakMoment] = useState("");
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const stopTimer = useCallback(() => {
    setTimerActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    setTimeLeft(60);
    setTimerActive(true);
  }, []);

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            stopTimer();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerActive, timeLeft, stopTimer]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/nlp-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          technique: "anchoring",
          duration: 60 - timeLeft,
          notes: JSON.stringify({
            selectedState,
            anchor,
            peakMoment,
          }),
          rating,
          triggerError: "Loss Aversion, Emotional Decision-Making, FOMO",
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

  const timerPercent = ((60 - timeLeft) / 60) * 100;

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
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a3 3 0 00-3 3c0 1.66 1.34 3 3 3s3-1.34 3-3a3 3 0 00-3-3zm0 8v10m0 0l-4-2m4 2l4-2M5 12a7 7 0 0114 0" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display" style={{ color: '#E8ECF1', letterSpacing: '-0.02em' }}>Anchoring</h1>
            <p className="text-sm font-medium" style={{ color: '#7A8BA7' }}>NLP Technique</p>
          </div>
        </div>
      </div>

      {/* What is Anchoring */}
      <div className="rounded-xl p-6" style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}>
        <h2 className="text-lg font-semibold mb-3 font-display" style={{ color: '#E8ECF1', letterSpacing: '-0.02em' }}>What is Anchoring?</h2>
        <p className="leading-relaxed font-body" style={{ color: '#7A8BA7' }}>
          Anchoring is a powerful NLP technique that links a specific physical gesture or stimulus
          to a desired emotional state. By repeatedly pairing a physical action (like pressing
          your thumb and forefinger together) with a peak emotional state, you create a neural
          shortcut that can instantly shift your mood and mindset. In trading, this allows you
          to access states of calm, confidence, and focus on demand -- especially during high-pressure
          market situations.
        </p>
      </div>

      {/* Trading Application */}
      <div className="rounded-xl p-6" style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}>
        <h2 className="text-lg font-semibold mb-3 font-display" style={{ color: '#E8ECF1', letterSpacing: '-0.02em' }}>Trading Application</h2>
        <p className="leading-relaxed font-body" style={{ color: '#7A8BA7' }}>
          Use anchoring to access calm, confident states during market stress. When you feel
          the urge to revenge trade, panic sell, or chase a FOMO entry, fire your anchor to
          instantly reset your emotional state and return to disciplined decision-making.
        </p>
      </div>

      {/* Step-by-Step Interactive Guide */}
      <div className="rounded-xl p-6 space-y-8" style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}>
        <h2 className="text-lg font-semibold mb-2 font-display" style={{ color: '#E8ECF1', letterSpacing: '-0.02em' }}>Interactive Anchoring Exercise</h2>

        {/* Step 1: Choose Your State */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold" style={{ background: '#00D4AA', color: '#0B0E14' }}>1</span>
            <h3 className="font-medium" style={{ color: '#E8ECF1' }}>Choose Your State</h3>
          </div>
          <p className="text-sm ml-9" style={{ color: '#7A8BA7' }}>Select the emotional state you want to anchor.</p>
          <div className="ml-9">
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-1"
              style={{ background: '#1A1F2E', border: '1px solid rgba(255,255,255,0.06)', color: '#E8ECF1' }}
            >
              {STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Step 2: Create Your Anchor */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold" style={{ background: '#00D4AA', color: '#0B0E14' }}>2</span>
            <h3 className="font-medium" style={{ color: '#E8ECF1' }}>Create Your Anchor</h3>
          </div>
          <p className="text-sm ml-9" style={{ color: '#7A8BA7' }}>Describe the physical gesture you will use as your trigger.</p>
          <div className="ml-9">
            <input
              type="text"
              value={anchor}
              onChange={(e) => setAnchor(e.target.value)}
              placeholder="e.g., Press thumb and forefinger together on left hand"
              className="w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-1 placeholder-[#4A5568]"
              style={{ background: '#1A1F2E', border: '1px solid rgba(255,255,255,0.06)', color: '#E8ECF1' }}
            />
          </div>
        </div>

        {/* Step 3: Build the Association */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold" style={{ background: '#00D4AA', color: '#0B0E14' }}>3</span>
            <h3 className="font-medium" style={{ color: '#E8ECF1' }}>Build the Association</h3>
          </div>
          <p className="text-sm ml-9" style={{ color: '#7A8BA7' }}>Describe a peak trading moment where you felt your chosen state intensely.</p>
          <div className="ml-9">
            <textarea
              value={peakMoment}
              onChange={(e) => setPeakMoment(e.target.value)}
              rows={4}
              placeholder="e.g., I remember the trade on EUR/USD where I waited patiently for the perfect setup, entered with full confidence, and let it run to my target without hesitation..."
              className="w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-1 placeholder-[#4A5568] resize-none"
              style={{ background: '#1A1F2E', border: '1px solid rgba(255,255,255,0.06)', color: '#E8ECF1' }}
            />
          </div>
        </div>

        {/* Step 4: Practice Timer */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold" style={{ background: '#00D4AA', color: '#0B0E14' }}>4</span>
            <h3 className="font-medium" style={{ color: '#E8ECF1' }}>Practice Timer</h3>
          </div>
          <p className="text-sm ml-9" style={{ color: '#7A8BA7' }}>
            Close your eyes, vividly recall your peak moment, perform your anchor gesture, and hold it for 60 seconds.
          </p>
          <div className="ml-9 space-y-4">
            <div className="flex items-center gap-4">
              <button
                onClick={timerActive ? stopTimer : startTimer}
                className="px-6 py-2 rounded-full text-[13px] font-medium transition-colors"
                style={
                  timerActive
                    ? { background: '#EF4444', color: '#FFFFFF' }
                    : { background: 'linear-gradient(135deg, #00D4AA 0%, #3B82F6 100%)', color: '#0B0E14' }
                }
              >
                {timerActive ? "Stop" : timeLeft < 60 && timeLeft > 0 ? "Resume" : "Start 60s Practice"}
              </button>
              <div className="text-3xl font-mono font-bold" style={{ color: '#E8ECF1' }}>
                {String(Math.floor(timeLeft / 60)).padStart(1, "0")}:{String(timeLeft % 60).padStart(2, "0")}
              </div>
            </div>
            {/* Progress bar */}
            <div className="w-full rounded-full h-3" style={{ background: '#1A1F2E' }}>
              <div
                className="h-3 rounded-full transition-all duration-1000"
                style={{ width: `${timerPercent}%`, background: 'linear-gradient(135deg, #00D4AA 0%, #3B82F6 100%)' }}
              />
            </div>
            {timeLeft === 0 && (
              <p className="text-[#00D4AA] font-medium">Practice complete! Rate your experience below.</p>
            )}
          </div>
        </div>

        {/* Step 5: Rate Effectiveness */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold" style={{ background: '#00D4AA', color: '#0B0E14' }}>5</span>
            <h3 className="font-medium" style={{ color: '#E8ECF1' }}>Rate Effectiveness</h3>
          </div>
          <p className="text-sm ml-9" style={{ color: '#7A8BA7' }}>How effectively did you access your desired state?</p>
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
          {["Loss Aversion", "Emotional Decision-Making", "FOMO"].map((error) => (
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
