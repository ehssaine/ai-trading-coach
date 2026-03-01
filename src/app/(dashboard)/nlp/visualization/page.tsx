"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

type SessionType = "pre-trade-calm" | "handling-losses" | "patient-waiting" | "disciplined-exit";

interface GuidedStep {
  text: string;
  duration: number;
}

const SESSION_DATA: Record<SessionType, { title: string; description: string; steps: GuidedStep[] }> = {
  "pre-trade-calm": {
    title: "Pre-Trade Calm",
    description: "Center yourself before the trading session begins",
    steps: [
      { text: "Close your eyes and take a deep breath. Feel the chair beneath you, the ground under your feet.", duration: 8000 },
      { text: "Imagine yourself sitting at your trading desk. The charts are open, but you feel no urgency.", duration: 8000 },
      { text: "Picture the market moving. You are watching with detached curiosity, like a scientist observing.", duration: 8000 },
      { text: "See your trading plan in front of you. You know exactly what setups you are looking for.", duration: 8000 },
      { text: "Feel the calm confidence flowing through you. You are prepared. You are patient. You are ready.", duration: 8000 },
      { text: "Visualize yourself executing a perfect trade -- entering only when your criteria are met.", duration: 8000 },
      { text: "Take one final deep breath. Open your eyes when ready. You are prepared to trade with discipline.", duration: 8000 },
    ],
  },
  "handling-losses": {
    title: "Handling Losses",
    description: "Build resilience to accept losses gracefully",
    steps: [
      { text: "Take a deep breath. Acknowledge that losses are a natural part of trading.", duration: 8000 },
      { text: "Visualize a recent loss. See the trade on your screen. Notice the numbers without emotion.", duration: 8000 },
      { text: "Now zoom out. See this single trade as one dot among thousands in your trading career.", duration: 8000 },
      { text: "Feel the weight of the loss dissolving. It is just data. It is just feedback.", duration: 8000 },
      { text: "Picture yourself reviewing the trade calmly, extracting the lesson, and writing it down.", duration: 8000 },
      { text: "See yourself moving to the next trade with complete clarity, unaffected by the previous result.", duration: 8000 },
      { text: "You are a professional. Professionals expect losses. They do not define you.", duration: 8000 },
    ],
  },
  "patient-waiting": {
    title: "Patient Waiting",
    description: "Develop patience to wait for A+ setups",
    steps: [
      { text: "Breathe deeply. You are a sniper, not a machine gunner. Quality over quantity.", duration: 8000 },
      { text: "Visualize the market moving without you. Many traders are jumping in. You are still.", duration: 8000 },
      { text: "See yourself watching charts with the patience of a hunter. No FOMO. No urgency.", duration: 8000 },
      { text: "Picture your perfect setup forming. The price action aligns. The timeframes agree.", duration: 8000 },
      { text: "Feel the satisfaction of waiting. When you finally enter, you enter with conviction.", duration: 8000 },
      { text: "Visualize the trade running to your target because you waited for the perfect moment.", duration: 8000 },
      { text: "Patience is your edge. The market rewards those who wait. You are one of them.", duration: 8000 },
    ],
  },
  "disciplined-exit": {
    title: "Disciplined Exit",
    description: "Strengthen your ability to honor your exit plan",
    steps: [
      { text: "Take a calming breath. Your exit strategy exists for a reason. Trust it.", duration: 8000 },
      { text: "Visualize a trade in profit approaching your take-profit level. Feel the temptation to move it.", duration: 8000 },
      { text: "Now see yourself honoring your original plan. The TP is hit. You close the trade.", duration: 8000 },
      { text: "Feel the satisfaction of discipline. You did what you said you would do.", duration: 8000 },
      { text: "Now visualize a trade hitting your stop-loss. See yourself accepting it without hesitation.", duration: 8000 },
      { text: "Your stop-loss protected your capital. Your discipline protected your psychology.", duration: 8000 },
      { text: "You execute your plan flawlessly. Entry, management, and exit -- all with precision.", duration: 8000 },
    ],
  },
};

const BREATHING_PHASES = ["Breathe in...", "Hold...", "Breathe out...", "Hold..."] as const;

export default function VisualizationPage() {
  const [sessionType, setSessionType] = useState<SessionType>("pre-trade-calm");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [breathingPhase, setBreathingPhase] = useState(0);
  const [breathingActive, setBreathingActive] = useState(false);
  const [journalNotes, setJournalNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [breathingScale, setBreathingScale] = useState(1);

  const stepTimerRef = useRef<NodeJS.Timeout | null>(null);
  const breathingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const session = SESSION_DATA[sessionType];

  const stopSession = useCallback(() => {
    setIsPlaying(false);
    if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
  }, []);

  // Handle guided step auto-advance
  useEffect(() => {
    if (!isPlaying) return;

    if (currentStep >= session.steps.length) {
      stopSession();
      return;
    }

    stepTimerRef.current = setTimeout(() => {
      setCurrentStep((prev) => prev + 1);
    }, session.steps[currentStep].duration);

    return () => {
      if (stepTimerRef.current) clearTimeout(stepTimerRef.current);
    };
  }, [isPlaying, currentStep, session.steps, stopSession]);

  // Handle breathing animation
  useEffect(() => {
    if (!breathingActive) return;

    const cycleDuration = 4000; // 4 seconds per phase

    breathingTimerRef.current = setInterval(() => {
      setBreathingPhase((prev) => (prev + 1) % 4);
    }, cycleDuration);

    return () => {
      if (breathingTimerRef.current) clearInterval(breathingTimerRef.current);
    };
  }, [breathingActive]);

  // Update breathing circle scale based on phase
  useEffect(() => {
    if (breathingPhase === 0) setBreathingScale(1.4); // Breathe in - expand
    else if (breathingPhase === 1) setBreathingScale(1.4); // Hold - stay expanded
    else if (breathingPhase === 2) setBreathingScale(1); // Breathe out - contract
    else setBreathingScale(1); // Hold - stay contracted
  }, [breathingPhase]);

  const startSession = () => {
    setCurrentStep(0);
    setIsPlaying(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/nlp-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          technique: "visualization",
          duration: session.steps.length * 8,
          notes: JSON.stringify({
            sessionType,
            journalNotes,
            completedSteps: currentStep,
          }),
          rating: 0,
          triggerError: "FOMO, Impatience, Emotional Decision-Making",
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

  const gradientClasses: Record<SessionType, string> = {
    "pre-trade-calm": "from-blue-900/20 via-gray-900 to-indigo-900/20",
    "handling-losses": "from-purple-900/20 via-gray-900 to-blue-900/20",
    "patient-waiting": "from-emerald-900/20 via-gray-900 to-teal-900/20",
    "disciplined-exit": "from-amber-900/20 via-gray-900 to-orange-900/20",
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Visualization</h1>
            <p className="text-amber-400 text-sm font-medium">NLP Technique</p>
          </div>
        </div>
      </div>

      {/* What is Visualization */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-3">What is Visualization?</h2>
        <p className="text-gray-400 leading-relaxed">
          Visualization (or mental rehearsal) is a technique where you create vivid mental images
          of desired outcomes and behaviors. Elite athletes have used visualization for decades to
          improve performance, and it is equally powerful for traders. By mentally rehearsing
          disciplined trading scenarios -- handling losses, waiting patiently, exiting on plan --
          you strengthen the neural pathways that support these behaviors, making them more
          automatic when you face real market situations.
        </p>
      </div>

      {/* Session Type Selection */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Choose Your Session</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(Object.keys(SESSION_DATA) as SessionType[]).map((key) => (
            <label
              key={key}
              className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                sessionType === key
                  ? "bg-amber-500/10 border-amber-500/40"
                  : "bg-gray-800/50 border-gray-700 hover:border-gray-600"
              }`}
            >
              <input
                type="radio"
                name="sessionType"
                value={key}
                checked={sessionType === key}
                onChange={() => {
                  setSessionType(key);
                  setCurrentStep(0);
                  setIsPlaying(false);
                }}
                className="mt-1 text-amber-500 focus:ring-amber-500"
              />
              <div>
                <p className={`font-medium ${sessionType === key ? "text-amber-400" : "text-white"}`}>
                  {SESSION_DATA[key].title}
                </p>
                <p className="text-gray-500 text-sm">{SESSION_DATA[key].description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Guided Visualization */}
      <div className={`bg-gradient-to-br ${gradientClasses[sessionType]} border border-gray-800 rounded-xl p-8 transition-all duration-1000`}>
        <h2 className="text-xl font-bold text-white mb-6">Guided Visualization: {session.title}</h2>

        {/* Progress indicators */}
        <div className="flex gap-1 mb-6">
          {session.steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                i < currentStep
                  ? "bg-amber-500"
                  : i === currentStep && isPlaying
                  ? "bg-amber-500/50"
                  : "bg-gray-700"
              }`}
            />
          ))}
        </div>

        {/* Current step text */}
        <div className="min-h-[120px] flex items-center justify-center">
          {!isPlaying && currentStep === 0 ? (
            <p className="text-gray-400 text-center text-lg">
              Press start to begin your guided visualization session.
            </p>
          ) : currentStep >= session.steps.length ? (
            <div className="text-center">
              <svg className="w-12 h-12 text-emerald-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-emerald-400 text-xl font-medium">Session Complete</p>
              <p className="text-gray-400 text-sm mt-1">Take a moment to journal your experience below.</p>
            </div>
          ) : (
            <p className="text-white text-xl text-center leading-relaxed font-light animate-pulse">
              {session.steps[currentStep]?.text}
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mt-6">
          {!isPlaying ? (
            <button
              onClick={startSession}
              className="bg-amber-600 hover:bg-amber-700 text-white font-medium px-8 py-3 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              {currentStep > 0 ? "Restart Session" : "Start Session"}
            </button>
          ) : (
            <button
              onClick={stopSession}
              className="bg-gray-700 hover:bg-gray-600 text-white font-medium px-8 py-3 rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
              Pause
            </button>
          )}
        </div>
      </div>

      {/* Breathing Guide */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Breathing Guide</h2>
        <p className="text-gray-400 text-sm mb-6">
          Use this 4-4-4-4 box breathing technique to center yourself before or during visualization.
        </p>

        <div className="flex flex-col items-center space-y-6">
          {/* Breathing circle */}
          <div className="relative flex items-center justify-center w-40 h-40">
            <div
              className="w-32 h-32 rounded-full bg-amber-500/20 border-2 border-amber-500/40 flex items-center justify-center transition-transform duration-[4000ms] ease-in-out"
              style={{ transform: `scale(${breathingScale})` }}
            >
              <p className="text-amber-400 font-medium text-sm text-center px-2">
                {breathingActive ? BREATHING_PHASES[breathingPhase] : "Press Start"}
              </p>
            </div>
          </div>

          {/* Breathing phase indicators */}
          {breathingActive && (
            <div className="flex items-center gap-2 text-sm">
              {BREATHING_PHASES.map((phase, i) => (
                <span
                  key={i}
                  className={`px-3 py-1 rounded-full transition-colors ${
                    i === breathingPhase
                      ? "bg-amber-500/20 text-amber-400"
                      : "text-gray-600"
                  }`}
                >
                  {phase} 4s
                </span>
              ))}
            </div>
          )}

          <button
            onClick={() => {
              setBreathingActive(!breathingActive);
              setBreathingPhase(0);
              setBreathingScale(1);
            }}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              breathingActive
                ? "bg-gray-700 hover:bg-gray-600 text-white"
                : "bg-amber-600 hover:bg-amber-700 text-white"
            }`}
          >
            {breathingActive ? "Stop Breathing Guide" : "Start Breathing Guide"}
          </button>
        </div>
      </div>

      {/* Journal Entry */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-3">Journal Entry</h2>
        <p className="text-gray-400 text-sm mb-3">
          Record your thoughts, feelings, and observations after the visualization.
        </p>
        <textarea
          value={journalNotes}
          onChange={(e) => setJournalNotes(e.target.value)}
          rows={5}
          placeholder="How did the visualization feel? What images were most vivid? How do you feel now compared to before?"
          className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent placeholder-gray-500 resize-none"
        />
      </div>

      {/* Targeted Errors */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Targeted Trading Errors</h2>
        <div className="flex flex-wrap gap-3">
          {["FOMO", "Impatience", "Emotional Decision-Making"].map((error) => (
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
