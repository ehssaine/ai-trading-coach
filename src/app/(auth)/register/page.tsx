"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0B0E14' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold" style={{ color: '#E8ECF1', letterSpacing: '-0.02em' }}>
            <span style={{ background: 'linear-gradient(135deg, #00D4AA 0%, #3B82F6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>TradingCoach</span>
          </h1>
          <p className="font-body mt-2" style={{ color: '#7A8BA7' }}>
            Build discipline. Protect your capital.
          </p>
        </div>

        <div className="rounded-xl p-8" style={{ background: '#111621', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 className="font-display text-xl font-semibold mb-6" style={{ color: '#E8ECF1', letterSpacing: '-0.02em' }}>
            Create Account
          </h2>

          {error && (
            <div className="text-sm rounded-xl p-3 mb-4" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="font-body block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: '#7A8BA7' }}>
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-lg px-4 py-2.5 text-sm focus:outline-none"
                style={{ background: '#1A1F2E', border: '1px solid rgba(255,255,255,0.06)', color: '#E8ECF1', transition: 'border-color 0.2s' }}
                onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(0,212,170,0.3)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="font-body block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: '#7A8BA7' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg px-4 py-2.5 text-sm focus:outline-none"
                style={{ background: '#1A1F2E', border: '1px solid rgba(255,255,255,0.06)', color: '#E8ECF1', transition: 'border-color 0.2s' }}
                onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(0,212,170,0.3)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
                placeholder="trader@example.com"
              />
            </div>

            <div>
              <label className="font-body block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: '#7A8BA7' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg px-4 py-2.5 text-sm focus:outline-none"
                style={{ background: '#1A1F2E', border: '1px solid rgba(255,255,255,0.06)', color: '#E8ECF1', transition: 'border-color 0.2s' }}
                onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(0,212,170,0.3)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
                placeholder="Min. 6 characters"
              />
            </div>

            <div>
              <label className="font-body block text-xs font-medium uppercase tracking-wider mb-1.5" style={{ color: '#7A8BA7' }}>
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full rounded-lg px-4 py-2.5 text-sm focus:outline-none"
                style={{ background: '#1A1F2E', border: '1px solid rgba(255,255,255,0.06)', color: '#E8ECF1', transition: 'border-color 0.2s' }}
                onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(0,212,170,0.3)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
                placeholder="Repeat your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-semibold rounded-lg px-5 py-2.5 text-sm disabled:opacity-50 transition-all duration-200 mt-2"
              style={{ background: 'linear-gradient(135deg, #00D4AA 0%, #3B82F6 100%)' }}
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm mt-5 font-body" style={{ color: '#4A5568' }}>
            Already have an account?{" "}
            <Link href="/login" className="text-[#3B82F6] hover:text-[#60A5FA] transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
