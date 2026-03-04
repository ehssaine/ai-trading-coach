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

  // Load conversation history on mount
  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch("/api/coach");
        if (res.ok) {
          const data = await res.json();
          if (data.messages && data.messages.length > 0) {
            const history: Message[] = data.messages.map((m: { id: string; role: string; content: string; createdAt: string }) => ({
              id: m.id,
              role: m.role === "USER" ? "user" as const : "coach" as const,
              content: m.content,
              timestamp: new Date(m.createdAt),
            }));
            setMessages([
              {
                id: "welcome",
                role: "coach",
                content: WELCOME_MESSAGE,
                timestamp: new Date(history[0].timestamp.getTime() - 1000),
              },
              ...history,
            ]);
          }
        }
      } catch (err) {
        console.error("Failed to load coach history:", err);
      }
    }
    loadHistory();
  }, []);

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

      const data = await res.json();

      if (res.ok && data.coachMessage) {
        const coachMsg: Message = {
          id: data.coachMessage.id || (Date.now() + 1).toString(),
          role: "coach",
          content: data.coachMessage.content,
          timestamp: new Date(data.coachMessage.createdAt || Date.now()),
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
          <div className="rounded-xl p-6 space-y-5" style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}>
            {/* Avatar */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3" style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)' }}>
                <span className="text-xl font-bold font-display" style={{ color: '#FFFFFF' }}>TC</span>
              </div>
              <h2 className="text-lg font-medium font-display" style={{ color: '#E8ECF1', letterSpacing: '-0.02em' }}>Your Trading Coach</h2>
              <p className="text-xs mt-1 font-body" style={{ color: '#7A8BA7' }}>20 Years Experience | Gold &amp; Silver Specialist</p>
              <p className="text-xs mt-2 leading-relaxed font-body" style={{ color: '#4A5568' }}>
                Specializing in ICT/SMC concepts, NLP integration, and trading psychology
              </p>
            </div>

            {/* AI indicator */}
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: '#8B5CF6' }} />
              <span className="text-xs font-medium font-body" style={{ color: '#8B5CF6' }}>AI-Powered Coach</span>
            </div>

            {/* Quick action buttons */}
            <div className="space-y-2">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.label}
                  onClick={() => sendMessage(action.text)}
                  disabled={isTyping}
                  className="w-full disabled:opacity-50 text-sm px-4 py-2.5 rounded-xl transition-all duration-200 text-left font-body hover:border-[#00D4AA]/30"
                  style={{ background: '#1A1F2E', color: '#E8ECF1', border: '1px solid rgba(255,255,255,0.06)' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#242B3D'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#1A1F2E'}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Chat Area ──────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col rounded-xl overflow-hidden min-h-0" style={{ background: '#0B0E14', border: '1px solid rgba(255,255,255,0.06)' }}>
          {/* Messages container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[80%] ${msg.role === "user" ? "order-1" : "order-1"}`}>
                  {/* AI icon for coach messages */}
                  {msg.role === "coach" && (
                    <div className="flex items-center gap-2 mb-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" style={{ color: '#8B5CF6' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.674M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <span className="text-xs font-medium font-body" style={{ color: '#8B5CF6' }}>AI Coach</span>
                    </div>
                  )}
                  <div
                    className={`px-4 py-3 whitespace-pre-wrap text-sm leading-relaxed font-body ${
                      msg.role === "coach"
                        ? "rounded-xl rounded-tl-md"
                        : "rounded-xl rounded-tr-md"
                    }`}
                    style={
                      msg.role === "coach"
                        ? { background: 'rgba(139,92,246,0.03)', color: '#E8ECF1', borderLeft: '3px solid #8B5CF6' }
                        : { background: 'linear-gradient(135deg, #00D4AA 0%, #3B82F6 100%)', color: '#FFFFFF' }
                    }
                  >
                    {msg.content}
                  </div>
                  <p className={`text-xs mt-1 font-body ${msg.role === "user" ? "text-right" : "text-left"}`} style={{ color: '#4A5568' }}>
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="rounded-xl rounded-tl-md px-4 py-3" style={{ background: 'rgba(139,92,246,0.03)', borderLeft: '3px solid #8B5CF6' }}>
                  <div className="flex items-center gap-1.5">
                    <div className="bounce-dot w-2 h-2 rounded-full" style={{ background: '#8B5CF6' }} />
                    <div className="bounce-dot w-2 h-2 rounded-full" style={{ background: '#8B5CF6' }} />
                    <div className="bounce-dot w-2 h-2 rounded-full" style={{ background: '#8B5CF6' }} />
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
                className="disabled:opacity-50 text-xs px-3 py-1.5 rounded-full transition-all duration-200 font-body hover:border-[#00D4AA]/30"
                style={{ background: '#1A1F2E', color: '#7A8BA7', border: '1px solid rgba(255,255,255,0.06)' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#242B3D'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#1A1F2E'}
              >
                {pill}
              </button>
            ))}
          </div>

          {/* ── Input area ───────────────────────────────────────────────── */}
          <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-end gap-3">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                rows={1}
                className="flex-1 rounded-xl px-4 py-3 text-sm focus:outline-none transition-all duration-200 resize-none font-body"
                style={{ background: '#1A1F2E', border: '1px solid rgba(255,255,255,0.06)', color: '#E8ECF1', maxHeight: "96px" }}
                onFocus={(e) => e.currentTarget.style.boxShadow = '0 0 0 1px rgba(0,212,170,0.3)'}
                onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isTyping}
                className="disabled:opacity-50 disabled:cursor-not-allowed p-3 rounded-xl transition-all duration-200 flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #00D4AA 0%, #3B82F6 100%)', color: '#FFFFFF' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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
