"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

const PRESET_INCANTATIONS = [
  "I am a disciplined trader who follows my plan with precision",
  "I welcome small losses as the cost of doing business",
  "I trade with patience and wait for A+ setups only",
  "My risk management protects my capital and my psychology",
  "I am calm, focused, and aligned with the higher timeframe",
];

const TIMER_OPTIONS = [
  { label: "30s", value: 30 },
  { label: "60s", value: 60 },
  { label: "90s", value: 90 },
];

export default function IncantationsPage() {
  const [selectedIncantation, setSelectedIncantation] = useState(PRESET_INCANTATIONS[0]);
  const [customIncantation, setCustomIncantation] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [timerDuration, setTimerDuration] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerActive, setTimerActive] = useState(false);
  const [intensity, setIntensity] = useState(5);
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
    setTimeLeft(timerDuration);
    setTimerActive(true);
  }, [timerDuration]);

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

  const activeIncantation = useCustom ? customIncantation : selectedIncantation;
  const timerPercent = ((timerDuration - timeLeft) / timerDuration) * 100;

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/nlp-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          technique: "incantations",
          duration: timerDuration - timeLeft,
          notes: JSON.stringify({
            incantation: activeIncantation,
            isCustom: useCustom,
            intensity,
            timerDuration,
          }),
          rating: 0,
          triggerError: "Confirmation Bias, Overconfidence, Greed",
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display" style={{ color: '#E8ECF1', letterSpacing: '-0.02em' }}>Incantations</h1>
            <p className="text-sm font-medium" style={{ color: '#7A8BA7' }}>NLP Technique</p>
          </div>
        </div>
      </div>

      {/* What are Incantations */}
      <div className="rounded-xl p-6" style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}>
        <h2 className="text-lg font-semibold mb-3 font-display" style={{ color: '#E8ECF1', letterSpacing: '-0.02em' }}>What are Incantations?</h2>
        <p className="leading-relaxed font-body" style={{ color: '#7A8BA7' }}>
          Incantations go beyond simple affirmations by engaging your entire physiology. While
          affirmations are statements you say to yourself, incantations combine spoken words
          with physical movement, powerful posture, and intense emotional engagement. You do not
          just think or whisper them -- you speak them with conviction, stand tall, move your
          body, and fully embody the state you are creating. This total mind-body engagement
          creates far stronger neural pathways than passive affirmations alone, making them
          especially powerful for overriding deep-seated trading fears and habits.
        </p>
      </div>

      {/* Pre-built Trading Incantations */}
      <div className="rounded-xl p-6" style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}>
        <h2 className="text-lg font-semibold mb-4 font-display" style={{ color: '#E8ECF1', letterSpacing: '-0.02em' }}>Trading Incantations</h2>
        <div className="space-y-3">
          {PRESET_INCANTATIONS.map((inc, i) => (
            <button
              key={i}
              onClick={() => {
                setSelectedIncantation(inc);
                setUseCustom(false);
              }}
              className="w-full text-left p-4 rounded-xl transition-all"
              style={
                !useCustom && selectedIncantation === inc
                  ? { background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.3)' }
                  : { background: '#1A1F2E', border: '1px solid rgba(255,255,255,0.06)' }
              }
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={
                    !useCustom && selectedIncantation === inc
                      ? { background: '#00D4AA', color: '#0B0E14' }
                      : { background: 'rgba(255,255,255,0.06)', color: '#7A8BA7' }
                  }
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <p className="font-medium text-lg font-body" style={{ color: !useCustom && selectedIncantation === inc ? '#E8ECF1' : '#7A8BA7' }}>
                  &quot;{inc}&quot;
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Incantation Builder */}
      <div className="rounded-xl p-6" style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}>
        <h2 className="text-lg font-semibold mb-3 font-display" style={{ color: '#E8ECF1', letterSpacing: '-0.02em' }}>Custom Incantation Builder</h2>
        <p className="text-sm mb-4 font-body" style={{ color: '#7A8BA7' }}>
          Create your own personalized trading incantation. Make it specific, positive, and present-tense.
        </p>
        <textarea
          value={customIncantation}
          onChange={(e) => {
            setCustomIncantation(e.target.value);
            if (e.target.value.length > 0) setUseCustom(true);
          }}
          rows={3}
          placeholder='e.g., "I execute my edge with machine-like precision and emotional detachment"'
          className="w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-1 placeholder-[#4A5568] resize-none font-body"
          style={{ background: '#1A1F2E', border: '1px solid rgba(255,255,255,0.06)', color: '#E8ECF1' }}
        />
        {customIncantation.length > 0 && (
          <button
            onClick={() => setUseCustom(true)}
            className="mt-2 text-sm px-3 py-1 rounded-full transition-colors"
            style={
              useCustom
                ? { background: 'rgba(0,212,170,0.15)', color: '#00D4AA' }
                : { background: '#1A1F2E', color: '#7A8BA7' }
            }
          >
            {useCustom ? "Using custom incantation" : "Use this incantation"}
          </button>
        )}
      </div>

      {/* Practice Mode */}
      <div className="rounded-xl p-6 space-y-6" style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}>
        <h2 className="text-lg font-semibold font-display" style={{ color: '#E8ECF1', letterSpacing: '-0.02em' }}>Practice Mode</h2>

        {/* Selected Incantation Display */}
        <div className="rounded-xl p-6 text-center" style={{ background: '#1A1F2E', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-[11px] font-medium uppercase tracking-wider mb-2" style={{ color: '#7A8BA7' }}>Current Incantation</p>
          <p className="text-xl font-medium italic font-body" style={{ color: '#E8ECF1' }}>
            &quot;{activeIncantation || "Select or write an incantation above"}&quot;
          </p>
        </div>

        {/* Instruction */}
        <div className="rounded-xl p-4" style={{ background: '#1A1F2E', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 mt-0.5 shrink-0" style={{ color: '#7A8BA7' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm leading-relaxed font-body" style={{ color: '#7A8BA7' }}>
              <span className="font-medium" style={{ color: '#E8ECF1' }}>Stand tall, speak with conviction, feel the certainty.</span>{" "}
              Rise from your chair. Plant your feet firmly. Breathe deeply. Now speak your incantation
              out loud with full intensity. Move your body. Pump your fist. Feel the words as absolute truth.
              This is not passive reading -- this is a full-body declaration.
            </p>
          </div>
        </div>

        {/* Timer Duration Selection */}
        <div className="space-y-2">
          <label className="font-medium block font-body" style={{ color: '#E8ECF1' }}>Practice Duration</label>
          <div className="flex gap-3">
            {TIMER_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setTimerDuration(option.value);
                  setTimeLeft(option.value);
                }}
                disabled={timerActive}
                className="px-6 py-2 rounded-full text-[13px] font-medium transition-colors disabled:opacity-50"
                style={
                  timerDuration === option.value
                    ? { background: '#00D4AA', color: '#0B0E14' }
                    : { background: 'rgba(255,255,255,0.06)', color: '#7A8BA7' }
                }
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Intensity */}
        <div className="space-y-2">
          <label className="font-medium block font-body" style={{ color: '#E8ECF1' }}>
            Intensity Level: <span className="font-mono" style={{ color: '#00D4AA' }}>{intensity}/10</span>
          </label>
          <p className="text-sm font-body" style={{ color: '#7A8BA7' }}>How much energy and conviction are you bringing?</p>
          <input
            type="range"
            min="1"
            max="10"
            value={intensity}
            onChange={(e) => setIntensity(parseInt(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{ background: '#1A1F2E', accentColor: '#00D4AA' }}
          />
          <div className="flex justify-between text-xs" style={{ color: '#4A5568' }}>
            <span>Whisper</span>
            <span>Moderate</span>
            <span>Full Power</span>
          </div>
        </div>

        {/* Timer */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <button
              onClick={timerActive ? stopTimer : startTimer}
              className="rounded-full text-[13px] font-medium px-5 py-2 transition-colors flex items-center gap-2"
              style={
                timerActive
                  ? { background: '#EF4444', color: '#FFFFFF' }
                  : { background: 'linear-gradient(135deg, #00D4AA 0%, #3B82F6 100%)', color: '#0B0E14' }
              }
            >
              {timerActive ? (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                  Stop
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Start Practice
                </>
              )}
            </button>
            <div className="text-4xl font-mono font-bold" style={{ color: '#E8ECF1' }}>
              {String(Math.floor(timeLeft / 60)).padStart(1, "0")}:{String(timeLeft % 60).padStart(2, "0")}
            </div>
          </div>

          <div className="w-full rounded-full h-3" style={{ background: '#1A1F2E' }}>
            <div
              className="h-3 rounded-full transition-all duration-1000"
              style={{ width: `${timerPercent}%`, background: 'linear-gradient(135deg, #00D4AA 0%, #3B82F6 100%)' }}
            />
          </div>

          {timeLeft === 0 && (
            <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(0,212,170,0.1)' }}>
              <p className="font-medium" style={{ color: '#00D4AA' }}>Practice complete! How do you feel?</p>
              <p className="text-sm mt-1 font-body" style={{ color: '#7A8BA7' }}>Save your session to track your progress.</p>
            </div>
          )}
        </div>
      </div>

      {/* Targeted Errors */}
      <div className="rounded-xl p-6" style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}>
        <h2 className="text-lg font-semibold mb-4 font-display" style={{ color: '#E8ECF1', letterSpacing: '-0.02em' }}>Targeted Trading Errors</h2>
        <div className="flex flex-wrap gap-3">
          {["Confirmation Bias", "Overconfidence", "Greed"].map((error) => (
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
