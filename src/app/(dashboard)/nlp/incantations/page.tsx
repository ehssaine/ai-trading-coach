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
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
          className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to NLP
        </Link>
      </div>

      {/* Title */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Incantations</h1>
            <p className="text-amber-400 text-sm font-medium">NLP Technique</p>
          </div>
        </div>
      </div>

      {/* What are Incantations */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-3">What are Incantations?</h2>
        <p className="text-gray-400 leading-relaxed">
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
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Trading Incantations</h2>
        <div className="space-y-3">
          {PRESET_INCANTATIONS.map((inc, i) => (
            <button
              key={i}
              onClick={() => {
                setSelectedIncantation(inc);
                setUseCustom(false);
              }}
              className={`w-full text-left p-4 rounded-lg border transition-all ${
                !useCustom && selectedIncantation === inc
                  ? "bg-amber-500/10 border-amber-500/40 ring-1 ring-amber-500/20"
                  : "bg-gray-800/50 border-gray-700 hover:border-gray-600"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  !useCustom && selectedIncantation === inc
                    ? "bg-amber-500 text-white"
                    : "bg-gray-700 text-gray-400"
                }`}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <p className={`font-medium text-lg ${
                  !useCustom && selectedIncantation === inc ? "text-amber-200" : "text-gray-300"
                }`}>
                  &quot;{inc}&quot;
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Incantation Builder */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-3">Custom Incantation Builder</h2>
        <p className="text-gray-400 text-sm mb-4">
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
          className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent placeholder-gray-500 resize-none"
        />
        {customIncantation.length > 0 && (
          <button
            onClick={() => setUseCustom(true)}
            className={`mt-2 text-sm px-3 py-1 rounded transition-colors ${
              useCustom
                ? "bg-amber-500/20 text-amber-400"
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            {useCustom ? "Using custom incantation" : "Use this incantation"}
          </button>
        )}
      </div>

      {/* Practice Mode */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6">
        <h2 className="text-xl font-bold text-white">Practice Mode</h2>

        {/* Selected Incantation Display */}
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-6 text-center">
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Current Incantation</p>
          <p className="text-amber-200 text-xl font-medium italic">
            &quot;{activeIncantation || "Select or write an incantation above"}&quot;
          </p>
        </div>

        {/* Instruction */}
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-amber-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-300 text-sm leading-relaxed">
              <span className="font-bold text-white">Stand tall, speak with conviction, feel the certainty.</span>{" "}
              Rise from your chair. Plant your feet firmly. Breathe deeply. Now speak your incantation
              out loud with full intensity. Move your body. Pump your fist. Feel the words as absolute truth.
              This is not passive reading -- this is a full-body declaration.
            </p>
          </div>
        </div>

        {/* Timer Duration Selection */}
        <div className="space-y-2">
          <label className="text-white font-medium block">Practice Duration</label>
          <div className="flex gap-3">
            {TIMER_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setTimerDuration(option.value);
                  setTimeLeft(option.value);
                }}
                disabled={timerActive}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  timerDuration === option.value
                    ? "bg-amber-600 text-white"
                    : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
                } disabled:opacity-50`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Intensity */}
        <div className="space-y-2">
          <label className="text-white font-medium block">
            Intensity Level: <span className="text-amber-400">{intensity}/10</span>
          </label>
          <p className="text-gray-500 text-sm">How much energy and conviction are you bringing?</p>
          <input
            type="range"
            min="1"
            max="10"
            value={intensity}
            onChange={(e) => setIntensity(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <div className="flex justify-between text-xs text-gray-600">
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
              className={`px-8 py-3 rounded-lg font-bold transition-colors flex items-center gap-2 ${
                timerActive
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-amber-600 hover:bg-amber-700 text-white"
              }`}
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
            <div className="text-4xl font-mono font-bold text-white">
              {String(Math.floor(timeLeft / 60)).padStart(1, "0")}:{String(timeLeft % 60).padStart(2, "0")}
            </div>
          </div>

          <div className="w-full bg-gray-800 rounded-full h-3">
            <div
              className="bg-amber-500 h-3 rounded-full transition-all duration-1000"
              style={{ width: `${timerPercent}%` }}
            />
          </div>

          {timeLeft === 0 && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 text-center">
              <p className="text-emerald-400 font-medium">Practice complete! How do you feel?</p>
              <p className="text-gray-400 text-sm mt-1">Save your session to track your progress.</p>
            </div>
          )}
        </div>
      </div>

      {/* Targeted Errors */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Targeted Trading Errors</h2>
        <div className="flex flex-wrap gap-3">
          {["Confirmation Bias", "Overconfidence", "Greed"].map((error) => (
            <span
              key={error}
              className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-sm font-medium"
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
          className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-8 py-3 rounded-lg transition-colors flex items-center gap-2"
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
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
