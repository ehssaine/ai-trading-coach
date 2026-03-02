"use client";

import { useState, useEffect } from "react";

// ── Types ───────────────────────────────────────────────────────────────────
interface Habit {
  id: string;
  name: string;
  description: string;
  category: string;
  frequency: string;
}

interface HabitLog {
  id: string;
  habitId: string;
  date: string;
}

interface GamificationProfile {
  level: number;
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
}

interface Badge {
  type: string;
  name: string;
  description: string;
  earnedAt: string | null;
  earned: boolean;
}

// ── Constants ───────────────────────────────────────────────────────────────
const CATEGORY_LABELS: Record<string, string> = {
  PRE_TRADE: "Pre-Trade",
  POST_TRADE: "Post-Trade",
  NLP: "NLP",
  MINDSET: "Mindset",
  RISK_MANAGEMENT: "Risk Mgmt",
};

const SUGGESTED_HABITS = [
  { name: "Pre-trade anchoring ritual", description: "Perform your anchoring technique before each trading session to enter a peak state", category: "PRE_TRADE", frequency: "DAILY" },
  { name: "Check weekly HTF bias", description: "Review and confirm the higher timeframe bias before placing any trades", category: "PRE_TRADE", frequency: "DAILY" },
  { name: "Review risk management rules", description: "Go through your risk management checklist before the session begins", category: "PRE_TRADE", frequency: "DAILY" },
  { name: "Post-trade journal entry", description: "Document every trade with entry reasoning, emotions, and lessons learned", category: "POST_TRADE", frequency: "DAILY" },
  { name: "Post-loss reframing exercise", description: "Use NLP reframing to transform losses into learning opportunities", category: "NLP", frequency: "DAILY" },
  { name: "Daily visualization session", description: "Visualize yourself executing perfect trades with discipline and patience", category: "NLP", frequency: "DAILY" },
  { name: "Evening incantation practice", description: "Reinforce positive trading beliefs through physiology-driven affirmations", category: "NLP", frequency: "DAILY" },
  { name: "Emotional state check-in", description: "Assess your emotional readiness before and after each trading session", category: "MINDSET", frequency: "DAILY" },
  { name: "Max daily loss review", description: "Check if you are approaching your maximum daily loss limit", category: "RISK_MANAGEMENT", frequency: "DAILY" },
  { name: "Position size calculator", description: "Calculate proper position size based on account risk percentage", category: "RISK_MANAGEMENT", frequency: "DAILY" },
];

const BADGE_DEFINITIONS: Record<string, { name: string; description: string }> = {
  STREAK_7: { name: "7-Day Warrior", description: "Maintain a 7-day habit streak" },
  STREAK_30: { name: "Monthly Master", description: "Maintain a 30-day habit streak" },
  NLP_BEGINNER: { name: "Mind Explorer", description: "Complete 5 NLP sessions" },
  NLP_MASTER: { name: "NLP Master", description: "Complete 50 NLP sessions" },
  DISCIPLINE_KING: { name: "Discipline King", description: "Achieve 80%+ alignment score" },
  FIRST_TRADE: { name: "First Blood", description: "Log your first trade" },
  JOURNAL_STREAK: { name: "Consistent Journalist", description: "Journal for 7 consecutive days" },
  HABIT_STARTER: { name: "Habit Builder", description: "Create 5 habits" },
};

// ── Badge Icons (inline SVG) ────────────────────────────────────────────────
function BadgeIcon({ type, className }: { type: string; className?: string }) {
  const cls = className || "w-8 h-8";
  switch (type) {
    case "STREAK_7":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
        </svg>
      );
    case "STREAK_30":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l2.09 6.26L20.18 9l-4.91 4.09L16.54 20 12 16.27 7.46 20l1.27-6.91L3.82 9l6.09-.74L12 2z" />
        </svg>
      );
    case "NLP_BEGINNER":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.674M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      );
    case "NLP_MASTER":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      );
    case "DISCIPLINE_KING":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
    case "FIRST_TRADE":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      );
    case "JOURNAL_STREAK":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      );
    case "HABIT_STARTER":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.573-1.066z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      );
  }
}

// ── Helper ──────────────────────────────────────────────────────────────────
function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function last30Days(): string[] {
  const days: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [profile, setProfile] = useState<GamificationProfile>({ level: 1, totalPoints: 0, currentStreak: 0, longestStreak: 0 });
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // New habit form state
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState("PRE_TRADE");
  const [newFrequency, setNewFrequency] = useState("DAILY");
  const [submitting, setSubmitting] = useState(false);

  // ── Fetch data ──────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const [habitsRes, gamRes, badgesRes] = await Promise.all([
          fetch("/api/habits"),
          fetch("/api/gamification"),
          fetch("/api/gamification/badges"),
        ]);
        const habitsData = await habitsRes.json();
        const gamData = await gamRes.json();
        const badgesData = await badgesRes.json();

        setHabits(habitsData.habits || []);
        setLogs(habitsData.logs || []);
        setProfile(gamData.profile || { level: 1, totalPoints: 0, currentStreak: 0, longestStreak: 0 });
        setBadges(badgesData.badges || []);
      } catch (err) {
        console.error("Failed to load habits data:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ── Computed ─────────────────────────────────────────────────────────────
  const today = todayString();
  const todayLogs = logs.filter((l) => l.date?.slice(0, 10) === today);
  const completedIds = new Set(todayLogs.map((l) => l.habitId));
  const dailyHabits = habits.filter((h) => h.frequency === "DAILY" || h.frequency === "WEEKLY");
  const completionPct = dailyHabits.length > 0 ? Math.round((completedIds.size / dailyHabits.length) * 100) : 0;
  const pointsInLevel = profile.totalPoints % 500;
  const progressToNext = (pointsInLevel / 500) * 100;

  // ── Handlers ─────────────────────────────────────────────────────────────
  async function toggleHabit(habitId: string) {
    if (completedIds.has(habitId)) return;
    try {
      const res = await fetch("/api/habits/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habitId, date: today }),
      });
      if (res.ok) {
        const data = await res.json();
        setLogs((prev) => [...prev, { id: data.log?.id || Date.now().toString(), habitId, date: today }]);
        if (data.profile) setProfile(data.profile);
        showSuccess("Habit completed! +10 points");
      }
    } catch (err) {
      console.error("Failed to complete habit:", err);
    }
  }

  async function addHabit(name: string, description: string, category: string, frequency: string) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, category, frequency }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.habit) {
          setHabits((prev) => [...prev, data.habit]);
        }
        showSuccess(`"${name}" added to your habits!`);
        setNewName("");
        setNewDesc("");
        setNewCategory("PRE_TRADE");
        setNewFrequency("DAILY");
        setShowAddForm(false);
      }
    } catch (err) {
      console.error("Failed to add habit:", err);
    } finally {
      setSubmitting(false);
    }
  }

  function showSuccess(msg: string) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  }

  // ── Streak calendar data ────────────────────────────────────────────────
  const days30 = last30Days();
  function dayStatus(day: string): "none" | "partial" | "full" {
    const dayLogs = logs.filter((l) => l.date?.slice(0, 10) === day);
    if (dayLogs.length === 0) return "none";
    if (dayLogs.length >= dailyHabits.length && dailyHabits.length > 0) return "full";
    return "partial";
  }

  // ── Render ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div style={{ color: '#4A5568' }}>Loading habits...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Success message */}
      {successMsg && (
        <div className="rounded-xl p-3 text-sm font-medium font-body" style={{ background: 'rgba(0,212,170,0.1)', color: '#00D4AA' }}>
          {successMsg}
        </div>
      )}

      {/* ── Gamification Profile ────────────────────────────────────────── */}
      <div className="rounded-xl p-6" style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Level badge */}
          <div className="flex-shrink-0 flex items-center justify-center">
            <div className="relative w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00D4AA 0%, #3B82F6 100%)' }}>
              <span className="font-mono text-2xl font-bold" style={{ color: '#E8ECF1' }}>{profile.level}</span>
              <span className="absolute -bottom-1 text-[10px] font-medium font-body px-2 rounded-full" style={{ color: '#7A8BA7', background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}>
                LEVEL
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider font-body" style={{ color: '#4A5568' }}>Total Points</p>
                <p className="text-2xl font-semibold font-mono" style={{ color: '#E8ECF1', letterSpacing: '-0.02em' }}>{profile.totalPoints.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider font-body" style={{ color: '#4A5568' }}>Current Streak</p>
                <div className="flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" style={{ color: '#F59E0B' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  </svg>
                  <span className="text-2xl font-semibold font-mono" style={{ color: '#E8ECF1', letterSpacing: '-0.02em' }}>{profile.currentStreak} days</span>
                </div>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider font-body" style={{ color: '#4A5568' }}>Longest Streak</p>
                <p className="text-2xl font-semibold font-mono" style={{ color: '#E8ECF1', letterSpacing: '-0.02em' }}>{profile.longestStreak} days</p>
              </div>
            </div>

            {/* Progress bar to next level */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-body" style={{ color: '#4A5568' }}>Progress to Level {profile.level + 1}</span>
                <span className="font-medium font-mono" style={{ color: '#7A8BA7' }}>{pointsInLevel} / 500</span>
              </div>
              <div className="w-full rounded-full h-2.5 bg-[#1A1F2E]">
                <div
                  className="h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${progressToNext}%`, background: 'linear-gradient(135deg, #00D4AA 0%, #3B82F6 100%)' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Today's Habits ──────────────────────────────────────────────── */}
      <div className="rounded-xl p-6" style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold font-display" style={{ color: '#E8ECF1', letterSpacing: '-0.02em' }}>Today&apos;s Habits</h2>
            <p className="text-sm mt-1 font-body" style={{ color: '#7A8BA7' }}>
              {completedIds.size} of {dailyHabits.length} completed
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-2xl font-semibold font-mono" style={{ color: '#E8ECF1', letterSpacing: '-0.02em' }}>{completionPct}%</span>
            </div>
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#1A1F2E' }}>
              <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
                <circle cx="18" cy="18" r="15.9155" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                <circle
                  cx="18"
                  cy="18"
                  r="15.9155"
                  fill="none"
                  stroke="#00D4AA"
                  strokeWidth="3"
                  strokeDasharray={`${completionPct} ${100 - completionPct}`}
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {dailyHabits.length === 0 ? (
          <div className="text-center py-8 font-body" style={{ color: '#4A5568' }}>
            <p>No habits yet. Add your first habit below or pick from our suggestions!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {dailyHabits.map((habit) => {
              const done = completedIds.has(habit.id);
              return (
                <button
                  key={habit.id}
                  onClick={() => toggleHabit(habit.id)}
                  disabled={done}
                  className={`w-full flex items-start gap-4 p-4 rounded-xl transition-all duration-200 text-left ${
                    done
                      ? "opacity-50"
                      : "cursor-pointer hover:border-[#00D4AA]/30"
                  }`}
                  style={{ background: done ? 'rgba(26,31,46,0.5)' : '#1A1F2E' }}
                  onMouseEnter={(e) => { if (!done) e.currentTarget.style.background = '#242B3D'; }}
                  onMouseLeave={(e) => { if (!done) e.currentTarget.style.background = '#1A1F2E'; }}
                >
                  <input
                    type="checkbox"
                    checked={done}
                    readOnly
                    className="accent-[#00D4AA] w-5 h-5 mt-0.5 flex-shrink-0 cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-medium font-body ${done ? "line-through" : ""}`} style={{ color: done ? '#4A5568' : '#E8ECF1' }}>
                        {habit.name}
                      </span>
                      <span
                        className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium font-body"
                        style={{ background: '#1A1F2E', color: '#7A8BA7', border: '1px solid rgba(255,255,255,0.06)' }}
                      >
                        {CATEGORY_LABELS[habit.category] || habit.category}
                      </span>
                    </div>
                    {habit.description && (
                      <p className="text-sm mt-1 font-body" style={{ color: '#4A5568' }}>{habit.description}</p>
                    )}
                  </div>
                  {done && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#00D4AA' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Add New Habit Form ──────────────────────────────────────────── */}
      <div className="rounded-xl" style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-full flex items-center justify-between p-6 text-left transition-all duration-200"
        >
          <h2 className="text-2xl font-semibold font-display" style={{ color: '#E8ECF1', letterSpacing: '-0.02em' }}>Add New Habit</h2>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`w-5 h-5 transition-transform ${showAddForm ? "rotate-180" : ""}`}
            style={{ color: '#7A8BA7' }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showAddForm && (
          <div className="px-6 pb-6 space-y-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider mb-1 font-body" style={{ color: '#4A5568' }}>Habit Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Pre-trade meditation"
                className="w-full rounded-xl px-4 py-3 focus:outline-none transition-all duration-200 font-body"
                style={{ background: '#1A1F2E', border: '1px solid rgba(255,255,255,0.06)', color: '#E8ECF1' }}
                onFocus={(e) => e.currentTarget.style.boxShadow = '0 0 0 1px rgba(0,212,170,0.3)'}
                onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider mb-1 font-body" style={{ color: '#4A5568' }}>Description</label>
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Describe what this habit involves..."
                rows={3}
                className="w-full rounded-xl px-4 py-3 focus:outline-none transition-all duration-200 resize-none font-body"
                style={{ background: '#1A1F2E', border: '1px solid rgba(255,255,255,0.06)', color: '#E8ECF1' }}
                onFocus={(e) => e.currentTarget.style.boxShadow = '0 0 0 1px rgba(0,212,170,0.3)'}
                onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wider mb-1 font-body" style={{ color: '#4A5568' }}>Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 focus:outline-none transition-all duration-200 font-body"
                  style={{ background: '#1A1F2E', border: '1px solid rgba(255,255,255,0.06)', color: '#E8ECF1' }}
                  onFocus={(e) => e.currentTarget.style.boxShadow = '0 0 0 1px rgba(0,212,170,0.3)'}
                  onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
                >
                  <option value="PRE_TRADE">Pre-Trade</option>
                  <option value="POST_TRADE">Post-Trade</option>
                  <option value="NLP">NLP</option>
                  <option value="MINDSET">Mindset</option>
                  <option value="RISK_MANAGEMENT">Risk Management</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-wider mb-1 font-body" style={{ color: '#4A5568' }}>Frequency</label>
                <select
                  value={newFrequency}
                  onChange={(e) => setNewFrequency(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 focus:outline-none transition-all duration-200 font-body"
                  style={{ background: '#1A1F2E', border: '1px solid rgba(255,255,255,0.06)', color: '#E8ECF1' }}
                  onFocus={(e) => e.currentTarget.style.boxShadow = '0 0 0 1px rgba(0,212,170,0.3)'}
                  onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
                >
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                </select>
              </div>
            </div>
            <button
              onClick={() => addHabit(newName, newDesc, newCategory, newFrequency)}
              disabled={!newName.trim() || submitting}
              className="rounded-full text-[13px] font-medium px-5 py-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-body"
              style={{ background: 'linear-gradient(135deg, #00D4AA 0%, #3B82F6 100%)', color: '#FFFFFF' }}
            >
              {submitting ? "Adding..." : "Add Habit"}
            </button>
          </div>
        )}
      </div>

      {/* ── Streak Calendar ─────────────────────────────────────────────── */}
      <div className="rounded-xl p-6" style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}>
        <h2 className="text-2xl font-semibold font-display mb-4" style={{ color: '#E8ECF1', letterSpacing: '-0.02em' }}>Streak Calendar</h2>
        <p className="text-sm mb-4 font-body" style={{ color: '#7A8BA7' }}>Last 30 days of habit activity</p>
        <div className="flex flex-wrap gap-1.5">
          {days30.map((day) => {
            const status = dayStatus(day);
            const label = new Date(day + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
            return (
              <div
                key={day}
                title={`${label} - ${status === "full" ? "All completed" : status === "partial" ? "Partially completed" : "No activity"}`}
                className="w-7 h-7 rounded-md"
                style={{
                  background: status === "full"
                    ? "#00D4AA"
                    : status === "partial"
                    ? "rgba(0,212,170,0.4)"
                    : "#1A1F2E"
                }}
              />
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs font-body" style={{ color: '#4A5568' }}>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-md" style={{ background: '#1A1F2E' }} />
            <span>No activity</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-md" style={{ background: 'rgba(0,212,170,0.4)' }} />
            <span>Partial</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-md" style={{ background: '#00D4AA' }} />
            <span>All completed</span>
          </div>
        </div>
      </div>

      {/* ── Badge Collection ────────────────────────────────────────────── */}
      <div className="rounded-xl p-6" style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}>
        <h2 className="text-2xl font-semibold font-display mb-6" style={{ color: '#E8ECF1', letterSpacing: '-0.02em' }}>Badge Collection</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Object.entries(BADGE_DEFINITIONS).map(([type, def]) => {
            const earned = badges.find((b) => b.type === type && b.earned);
            return (
              <div
                key={type}
                className={`rounded-xl p-4 text-center transition-all duration-200 ${
                  earned
                    ? "hover:border-[#00D4AA]/30"
                    : "opacity-40"
                }`}
                style={{
                  background: '#1A1F2E',
                  border: earned ? '1px solid rgba(0,212,170,0.3)' : '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-3" style={{
                  background: earned ? 'rgba(0,212,170,0.1)' : 'rgba(255,255,255,0.04)',
                  color: earned ? '#00D4AA' : '#4A5568',
                }}>
                  <BadgeIcon type={type} />
                </div>
                <h3 className="font-medium text-sm font-body" style={{ color: earned ? '#E8ECF1' : '#4A5568' }}>
                  {def.name}
                </h3>
                <p className="text-xs mt-1 font-body" style={{ color: '#4A5568' }}>{def.description}</p>
                {earned && earned.earnedAt && (
                  <p className="text-xs mt-2 font-body" style={{ color: '#7A8BA7' }}>
                    Earned {new Date(earned.earnedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Suggested Trading Habits ────────────────────────────────────── */}
      <div className="rounded-xl p-6" style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}>
        <h2 className="text-2xl font-semibold font-display mb-2" style={{ color: '#E8ECF1', letterSpacing: '-0.02em' }}>Suggested Trading Habits</h2>
        <p className="text-sm mb-6 font-body" style={{ color: '#7A8BA7' }}>One-click add pre-built habits recommended for traders</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SUGGESTED_HABITS.map((sh) => {
            const alreadyAdded = habits.some(
              (h) => h.name.toLowerCase() === sh.name.toLowerCase()
            );
            return (
              <div
                key={sh.name}
                className={`flex items-center justify-between p-4 rounded-xl transition-all duration-200 ${
                  alreadyAdded
                    ? "opacity-50"
                    : "hover:border-[#00D4AA]/30"
                }`}
                style={{ background: '#1A1F2E' }}
              >
                <div className="flex-1 min-w-0 mr-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium font-body" style={{ color: '#E8ECF1' }}>{sh.name}</span>
                    <span
                      className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium font-body"
                      style={{ background: '#1A1F2E', color: '#7A8BA7', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      {CATEGORY_LABELS[sh.category]}
                    </span>
                  </div>
                  <p className="text-xs mt-1 truncate font-body" style={{ color: '#4A5568' }}>{sh.description}</p>
                </div>
                {alreadyAdded ? (
                  <span className="text-xs flex-shrink-0 font-body" style={{ color: '#4A5568' }}>Added</span>
                ) : (
                  <button
                    onClick={() => addHabit(sh.name, sh.description, sh.category, sh.frequency)}
                    className="rounded-full text-[13px] font-medium px-5 py-2 transition-all duration-200 flex-shrink-0 font-body"
                    style={{ background: 'linear-gradient(135deg, #00D4AA 0%, #3B82F6 100%)', color: '#FFFFFF' }}
                  >
                    + Add
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
