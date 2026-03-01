"use client";

import { useState, useEffect, useRef } from "react";

// ── Types ───────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: "coach" | "user";
  content: string;
  timestamp: Date;
}

// ── Constants ───────────────────────────────────────────────────────────────
const WELCOME_MESSAGE = `Welcome, trader. I'm your AI Trading Coach with 20 years of experience in gold and silver markets. I specialize in helping you eliminate psychological trading errors using advanced NLP techniques.

How can I help you today? I can:
- Review your recent trades and identify patterns
- Guide you through an NLP exercise
- Help you build your pre-trade routine
- Analyze your emotional state for trading readiness`;

const QUICK_ACTIONS = [
  { label: "Review My Trades", text: "Can you review my recent trades and identify any patterns or recurring mistakes?" },
  { label: "NLP Exercise", text: "I'd like to do an NLP exercise to improve my trading psychology." },
  { label: "Pre-Trade Checklist", text: "Help me go through my pre-trade checklist before I start trading today." },
  { label: "Analyze My Errors", text: "Analyze my trading errors and help me understand what's causing them." },
];

const SCENARIO_PILLS = [
  "I just took a loss",
  "I feel FOMO right now",
  "Should I take this trade?",
  "I'm on a winning streak",
];

// ── Page ────────────────────────────────────────────────────────────────────
export default function CoachPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "coach",
      content: WELCOME_MESSAGE,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const maxHeight = 4 * 24; // ~4 lines
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, maxHeight) + "px";
    }
  }, [input]);

  // ── Send message ────────────────────────────────────────────────────────
  async function sendMessage(content?: string) {
    const text = (content || input).trim();
    if (!text) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });

      if (res.ok) {
        const data = await res.json();
        const coachMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "coach",
          content: data.response || data.message || "I understand. Let me think about that and give you my best advice.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, coachMsg]);
      } else {
        const coachMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "coach",
          content: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, coachMsg]);
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      const coachMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "coach",
        content: "I apologize, but I'm having trouble connecting right now. Please check your connection and try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, coachMsg]);
    } finally {
      setIsTyping(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function formatTime(date: Date) {
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-0">
      {/* Typing indicator CSS */}
      <style>{`
        @keyframes coachBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
        .bounce-dot {
          animation: coachBounce 1.4s infinite ease-in-out;
        }
        .bounce-dot:nth-child(2) {
          animation-delay: 0.16s;
        }
        .bounce-dot:nth-child(3) {
          animation-delay: 0.32s;
        }
      `}</style>

      <div className="flex flex-col lg:flex-row gap-6" style={{ height: "calc(100vh - 12rem)" }}>
        {/* ── Coach Info Sidebar ──────────────────────────────────────────── */}
        <div className="lg:w-72 flex-shrink-0">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
            {/* Avatar */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20 mb-3">
                <span className="text-amber-400 text-xl font-bold">TC</span>
              </div>
              <h2 className="text-lg font-bold text-white">Your Trading Coach</h2>
              <p className="text-gray-400 text-xs mt-1">20 Years Experience | Gold &amp; Silver Specialist</p>
              <p className="text-gray-500 text-xs mt-2 leading-relaxed">
                Specializing in ICT/SMC concepts, NLP integration, and trading psychology
              </p>
            </div>

            {/* Quick action buttons */}
            <div className="space-y-2">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.label}
                  onClick={() => sendMessage(action.text)}
                  disabled={isTyping}
                  className="w-full bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white text-sm px-4 py-2.5 rounded-lg transition-colors text-left"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Chat Area ──────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col bg-gray-950 border border-gray-800 rounded-xl overflow-hidden min-h-0">
          {/* Messages container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[80%] ${msg.role === "user" ? "order-1" : "order-1"}`}>
                  <div
                    className={`px-4 py-3 whitespace-pre-wrap text-sm leading-relaxed ${
                      msg.role === "coach"
                        ? "bg-gray-800 text-gray-100 rounded-2xl rounded-tl-sm"
                        : "bg-amber-600 text-white rounded-2xl rounded-tr-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                  <p className={`text-gray-500 text-xs mt-1 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <div className="bounce-dot w-2 h-2 rounded-full bg-gray-400" />
                    <div className="bounce-dot w-2 h-2 rounded-full bg-gray-400" />
                    <div className="bounce-dot w-2 h-2 rounded-full bg-gray-400" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ── Scenario pills ───────────────────────────────────────────── */}
          <div className="px-4 pb-2 flex flex-wrap gap-2">
            {SCENARIO_PILLS.map((pill) => (
              <button
                key={pill}
                onClick={() => setInput(pill)}
                disabled={isTyping}
                className="bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-gray-300 text-xs px-3 py-1.5 rounded-full border border-gray-700 transition-colors"
              >
                {pill}
              </button>
            ))}
          </div>

          {/* ── Input area ───────────────────────────────────────────────── */}
          <div className="border-t border-gray-800 p-4">
            <div className="flex items-end gap-3">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                rows={1}
                className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-amber-500 transition-colors resize-none"
                style={{ maxHeight: "96px" }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isTyping}
                className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-colors flex-shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-7 7m7-7l7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
