"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Technique {
  slug: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  mastery: number;
}

const techniques: Technique[] = [
  {
    slug: "anchoring",
    title: "Anchoring",
    description: "Create triggers for calm, confident trading states",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a3 3 0 00-3 3c0 1.66 1.34 3 3 3s3-1.34 3-3a3 3 0 00-3-3zm0 8v10m0 0l-4-2m4 2l4-2M5 12a7 7 0 0114 0" />
      </svg>
    ),
    mastery: 35,
  },
  {
    slug: "reframing",
    title: "Reframing",
    description: "Transform losses into powerful learning opportunities",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h16v16H4V4zm3 3h10v10H7V7z" />
      </svg>
    ),
    mastery: 50,
  },
  {
    slug: "swish",
    title: "Swish Pattern",
    description: "Replace destructive impulses with winning behaviors",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    ),
    mastery: 20,
  },
  {
    slug: "visualization",
    title: "Visualization",
    description: "Mentally rehearse successful trades",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
    mastery: 65,
  },
  {
    slug: "modeling",
    title: "Modeling",
    description: "Adopt the mindset of veteran traders",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    mastery: 10,
  },
  {
    slug: "mirroring",
    title: "Mirroring",
    description: "Build confidence through positive body language",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v20M4 6h4a4 4 0 010 8H4m16-8h-4a4 4 0 000 8h4" />
      </svg>
    ),
    mastery: 15,
  },
  {
    slug: "incantations",
    title: "Incantations",
    description: "Power up with physiology-driven affirmations",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
    mastery: 40,
  },
  {
    slug: "dialogue",
    title: "Internal Dialogue",
    description: "Master your inner trading voice",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    mastery: 55,
  },
];

export default function NlpHubPage() {
  const [totalSessions, setTotalSessions] = useState(0);
  const [favoriteTechnique, setFavoriteTechnique] = useState("Anchoring");
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    // Simulated stats - in production these would come from an API
    setTotalSessions(42);
    setFavoriteTechnique("Visualization");
    setStreak(7);
  }, []);

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gray-900 border border-gray-800 rounded-xl p-10 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-yellow-500/5 pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-amber-400 text-sm font-medium">NLP for Traders</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Rewire Your Trading Mind</h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Neuro-Linguistic Programming techniques specifically adapted for trading psychology.
            Break destructive patterns, build unshakeable discipline, and develop the mental edge
            that separates consistent winners from the rest.
          </p>
        </div>
      </div>

      {/* Technique Cards Grid */}
      <div>
        <h2 className="text-xl font-bold text-white mb-6">Choose a Technique</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {techniques.map((t) => (
            <Link
              key={t.slug}
              href={`/nlp/${t.slug}`}
              className="group bg-gray-900 border border-gray-800 rounded-xl p-6 transition-all duration-200 hover:scale-[1.03] hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/5"
            >
              <div className="text-amber-400 mb-4 group-hover:text-amber-300 transition-colors">
                {t.icon}
              </div>
              <h3 className="text-white font-bold text-lg mb-1">{t.title}</h3>
              <p className="text-gray-400 text-sm mb-4 leading-relaxed">{t.description}</p>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Mastery</span>
                  <span className="text-amber-400 font-medium">{t.mastery}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-1.5">
                  <div
                    className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${t.mastery}%` }}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Your NLP Progress */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Your NLP Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-5 text-center">
            <div className="text-amber-400 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-white">{totalSessions}</p>
            <p className="text-gray-400 text-sm mt-1">Total Sessions</p>
          </div>
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-5 text-center">
            <div className="text-amber-400 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-white">{favoriteTechnique}</p>
            <p className="text-gray-400 text-sm mt-1">Favorite Technique</p>
          </div>
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-5 text-center">
            <div className="text-amber-400 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-white">{streak} days</p>
            <p className="text-gray-400 text-sm mt-1">Current Streak</p>
          </div>
        </div>
      </div>
    </div>
  );
}
