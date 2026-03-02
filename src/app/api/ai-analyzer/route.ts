import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

interface AnalysisInsight {
  id: string;
  category: "critical" | "warning" | "improvement" | "positive";
  title: string;
  description: string;
  metric?: string;
  recommendation?: string;
  relatedNlp?: string;
}

interface AnalysisReport {
  healthScore: number;
  insights: AnalysisInsight[];
  ruleCompliance: {
    htfAlignment: { score: number; total: number; aligned: number };
    planAdherence: { score: number; followed: number; total: number };
    riskManagement: { score: number; violations: number };
    maxTradesRespected: { score: number; violations: number };
  };
  patterns: {
    bestSession: string | null;
    worstEmotionalState: string | null;
    bestSetupType: string | null;
    worstSetupType: string | null;
    winRateTrend: "improving" | "declining" | "stable";
    revengeTrading: number;
    overtrading: number;
  };
  weeklyTrend: {
    week: string;
    winRate: number;
    pnl: number;
    trades: number;
    discipline: number;
  }[];
  lastAnalyzed: string;
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.userId;

    // Fetch all data in parallel
    const [trades, dailyPlans, weeklyAnalyses, habits, habitLogs, nlpSessions, gamification] =
      await Promise.all([
        prisma.trade.findMany({
          where: { userId },
          orderBy: { entryTime: "desc" },
          include: {
            dailyPlan: {
              select: {
                dailyBias: true,
                maxTrades: true,
                riskPerTrade: true,
                followedPlan: true,
                emotionalState: true,
                alignedWithHTF: true,
              },
            },
          },
        }),
        prisma.dailyPlan.findMany({
          where: { userId },
          orderBy: { date: "desc" },
          include: {
            _count: { select: { trades: true } },
            weeklyAnalysis: { select: { htfBias: true } },
          },
        }),
        prisma.weeklyAnalysis.findMany({
          where: { userId },
          orderBy: { weekStart: "desc" },
          take: 8,
        }),
        prisma.habit.findMany({
          where: { userId, isActive: true },
        }),
        prisma.habitLog.findMany({
          where: { userId },
          orderBy: { date: "desc" },
          take: 200,
        }),
        prisma.nlpSession.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: 100,
        }),
        prisma.gamificationProfile.findFirst({
          where: { userId },
        }),
      ]);

    const closedTrades = trades.filter(
      (t) => t.status !== "OPEN" && t.status !== "CANCELLED"
    );
    const insights: AnalysisInsight[] = [];
    let insightId = 0;
    const nextId = () => `insight-${++insightId}`;

    // ── 1. RULE COMPLIANCE ──────────────────────────────────────────

    // HTF Alignment
    const alignedTrades = closedTrades.filter((t) => t.alignedWithHTF);
    const htfScore =
      closedTrades.length > 0
        ? Math.round((alignedTrades.length / closedTrades.length) * 100)
        : 100;

    if (htfScore < 60 && closedTrades.length >= 3) {
      insights.push({
        id: nextId(),
        category: "critical",
        title: "Low HTF Alignment",
        description: `Only ${htfScore}% of your trades are aligned with the Higher Timeframe bias. Counter-trend trades are statistically more likely to lose.`,
        metric: `${htfScore}%`,
        recommendation:
          "Before entering any trade, check your weekly analysis and confirm your trade direction matches the HTF bias.",
        relatedNlp: "REFRAMING",
      });
    } else if (htfScore < 80 && closedTrades.length >= 3) {
      insights.push({
        id: nextId(),
        category: "warning",
        title: "HTF Alignment Could Improve",
        description: `${htfScore}% of trades follow the HTF bias. Aim for 80%+ to maximize your edge.`,
        metric: `${htfScore}%`,
        recommendation:
          "Use your daily plan to explicitly confirm HTF alignment before each trade entry.",
      });
    } else if (closedTrades.length >= 5) {
      insights.push({
        id: nextId(),
        category: "positive",
        title: "Strong HTF Discipline",
        description: `Excellent! ${htfScore}% of your trades are aligned with your HTF bias. This is a core edge.`,
        metric: `${htfScore}%`,
      });
    }

    // Plan adherence
    const plansWithReview = dailyPlans.filter((p) => p.followedPlan !== null);
    const plansFollowed = plansWithReview.filter((p) => p.followedPlan === true);
    const planScore =
      plansWithReview.length > 0
        ? Math.round((plansFollowed.length / plansWithReview.length) * 100)
        : 100;

    if (planScore < 60 && plansWithReview.length >= 3) {
      insights.push({
        id: nextId(),
        category: "critical",
        title: "Not Following Your Plan",
        description: `You only followed your daily plan ${planScore}% of the time. Trading without a plan or deviating leads to emotional decisions.`,
        metric: `${planScore}%`,
        recommendation:
          "Review your daily plan before each session. Write down your exact entry criteria and stick to it.",
        relatedNlp: "ANCHORING",
      });
    } else if (planScore < 80 && plansWithReview.length >= 3) {
      insights.push({
        id: nextId(),
        category: "warning",
        title: "Plan Adherence Needs Work",
        description: `You followed your plan ${planScore}% of the time. Consistency is key.`,
        metric: `${planScore}%`,
        recommendation:
          "Start each trading session with your anchoring technique to reinforce plan commitment.",
        relatedNlp: "ANCHORING",
      });
    }

    // Risk management (check if any trades exceed daily plan risk)
    let riskViolations = 0;
    for (const trade of closedTrades) {
      if (trade.dailyPlan && trade.positionSize > (trade.dailyPlan.riskPerTrade * 2)) {
        riskViolations++;
      }
    }
    const riskScore =
      closedTrades.length > 0
        ? Math.round(((closedTrades.length - riskViolations) / closedTrades.length) * 100)
        : 100;

    if (riskViolations > 0) {
      insights.push({
        id: nextId(),
        category: riskViolations >= 3 ? "critical" : "warning",
        title: "Risk Management Violations",
        description: `${riskViolations} trade(s) exceeded your planned risk per trade. Oversizing positions amplifies losses.`,
        metric: `${riskViolations} violations`,
        recommendation:
          "Set a hard rule: never risk more than your daily plan allows. Use the swish pattern to interrupt the urge to oversize.",
        relatedNlp: "SWISH",
      });
    }

    // Max trades per day
    const tradesByDay = new Map<string, number>();
    const planByDay = new Map<string, number>();
    for (const trade of trades) {
      const day = new Date(trade.entryTime).toISOString().split("T")[0];
      tradesByDay.set(day, (tradesByDay.get(day) || 0) + 1);
    }
    for (const plan of dailyPlans) {
      const day = new Date(plan.date).toISOString().split("T")[0];
      planByDay.set(day, plan.maxTrades);
    }
    let overtradingDays = 0;
    for (const [day, count] of tradesByDay.entries()) {
      const max = planByDay.get(day) || 3;
      if (count > max) overtradingDays++;
    }

    const maxTradesScore =
      tradesByDay.size > 0
        ? Math.round(((tradesByDay.size - overtradingDays) / tradesByDay.size) * 100)
        : 100;

    if (overtradingDays > 0) {
      insights.push({
        id: nextId(),
        category: overtradingDays >= 3 ? "critical" : "warning",
        title: "Overtrading Detected",
        description: `You exceeded your max trades limit on ${overtradingDays} day(s). Overtrading often signals emotional decisions.`,
        metric: `${overtradingDays} days`,
        recommendation:
          "When you feel the urge to take another trade after hitting your limit, use the SWISH pattern or speak to your AI Coach.",
        relatedNlp: "SWISH",
      });
    }

    // ── 2. PATTERN DETECTION ────────────────────────────────────────

    // Emotional state correlation
    const emotionalResults: Record<string, { wins: number; total: number }> = {};
    for (const trade of closedTrades) {
      const state = trade.emotionalState || "UNKNOWN";
      if (!emotionalResults[state]) emotionalResults[state] = { wins: 0, total: 0 };
      emotionalResults[state].total++;
      if (trade.status === "CLOSED_WIN") emotionalResults[state].wins++;
    }

    let worstEmotionalState: string | null = null;
    let worstEmotionalWinRate = 100;
    for (const [state, data] of Object.entries(emotionalResults)) {
      if (state === "UNKNOWN") continue;
      const wr = data.total > 0 ? (data.wins / data.total) * 100 : 0;
      if (data.total >= 2 && wr < worstEmotionalWinRate) {
        worstEmotionalWinRate = wr;
        worstEmotionalState = state;
      }
    }

    if (worstEmotionalState && worstEmotionalWinRate < 40) {
      const nlpMap: Record<string, string> = {
        ANXIOUS: "ANCHORING",
        FOMO: "SWISH",
        REVENGE: "REFRAMING",
        CONFIDENT: "DIALOGUE",
      };
      insights.push({
        id: nextId(),
        category: "warning",
        title: `Poor Performance When ${worstEmotionalState}`,
        description: `Your win rate drops to ${Math.round(worstEmotionalWinRate)}% when trading in a ${worstEmotionalState.toLowerCase()} state. This emotional pattern is costing you money.`,
        metric: `${Math.round(worstEmotionalWinRate)}% win rate`,
        recommendation: `Use the ${nlpMap[worstEmotionalState] || "REFRAMING"} technique before trading when you notice this emotional state.`,
        relatedNlp: nlpMap[worstEmotionalState] || "REFRAMING",
      });
    }

    // Setup type performance
    const setupResults: Record<string, { wins: number; total: number; pnl: number }> = {};
    for (const trade of closedTrades) {
      const setup = trade.setupType;
      if (!setupResults[setup]) setupResults[setup] = { wins: 0, total: 0, pnl: 0 };
      setupResults[setup].total++;
      setupResults[setup].pnl += trade.pnl || 0;
      if (trade.status === "CLOSED_WIN") setupResults[setup].wins++;
    }

    let bestSetup: string | null = null;
    let bestSetupWR = 0;
    let worstSetup: string | null = null;
    let worstSetupWR = 100;
    for (const [setup, data] of Object.entries(setupResults)) {
      if (data.total < 2) continue;
      const wr = (data.wins / data.total) * 100;
      if (wr > bestSetupWR) {
        bestSetupWR = wr;
        bestSetup = setup;
      }
      if (wr < worstSetupWR) {
        worstSetupWR = wr;
        worstSetup = setup;
      }
    }

    if (bestSetup && bestSetupWR > 60) {
      insights.push({
        id: nextId(),
        category: "positive",
        title: `Strong Setup: ${bestSetup.replace(/_/g, " ")}`,
        description: `Your ${bestSetup.replace(/_/g, " ")} setup has a ${Math.round(bestSetupWR)}% win rate. This is one of your best performing patterns.`,
        metric: `${Math.round(bestSetupWR)}% WR`,
        recommendation: "Focus on this setup type when conditions align with your HTF bias.",
      });
    }

    if (worstSetup && worstSetupWR < 35 && setupResults[worstSetup].total >= 3) {
      insights.push({
        id: nextId(),
        category: "warning",
        title: `Weak Setup: ${worstSetup.replace(/_/g, " ")}`,
        description: `Your ${worstSetup.replace(/_/g, " ")} setup only has a ${Math.round(worstSetupWR)}% win rate across ${setupResults[worstSetup].total} trades. Consider refining or dropping it.`,
        metric: `${Math.round(worstSetupWR)}% WR`,
        recommendation:
          "Use visualization technique to mentally rehearse better execution of this setup, or focus on your stronger setups.",
        relatedNlp: "VISUALIZATION",
      });
    }

    // Session-based performance (by entry time hour)
    const sessionPerf: Record<string, { wins: number; total: number }> = {
      Asian: { wins: 0, total: 0 },
      London: { wins: 0, total: 0 },
      "New York": { wins: 0, total: 0 },
    };
    for (const trade of closedTrades) {
      const hour = new Date(trade.entryTime).getUTCHours();
      let sessionName: string;
      if (hour >= 0 && hour < 8) sessionName = "Asian";
      else if (hour >= 8 && hour < 13) sessionName = "London";
      else sessionName = "New York";
      sessionPerf[sessionName].total++;
      if (trade.status === "CLOSED_WIN") sessionPerf[sessionName].wins++;
    }

    let bestSession: string | null = null;
    let bestSessionWR = 0;
    for (const [sessionName, data] of Object.entries(sessionPerf)) {
      if (data.total < 2) continue;
      const wr = (data.wins / data.total) * 100;
      if (wr > bestSessionWR) {
        bestSessionWR = wr;
        bestSession = sessionName;
      }
    }

    if (bestSession) {
      insights.push({
        id: nextId(),
        category: "improvement",
        title: `Best Session: ${bestSession}`,
        description: `You perform best during the ${bestSession} session with a ${Math.round(bestSessionWR)}% win rate. Consider concentrating your trading during this window.`,
        metric: `${Math.round(bestSessionWR)}% WR`,
      });
    }

    // Revenge trading detection (2+ losses followed by another trade same day)
    let revengeTradingCount = 0;
    const tradesByDayList = new Map<string, typeof closedTrades>();
    for (const trade of closedTrades) {
      const day = new Date(trade.entryTime).toISOString().split("T")[0];
      if (!tradesByDayList.has(day)) tradesByDayList.set(day, []);
      tradesByDayList.get(day)!.push(trade);
    }
    for (const dayTrades of tradesByDayList.values()) {
      const sorted = dayTrades.sort(
        (a, b) => new Date(a.entryTime).getTime() - new Date(b.entryTime).getTime()
      );
      let consecutiveLosses = 0;
      for (const trade of sorted) {
        if (trade.status === "CLOSED_LOSS") {
          consecutiveLosses++;
        } else {
          if (consecutiveLosses >= 2) revengeTradingCount++;
          consecutiveLosses = 0;
        }
      }
    }

    if (revengeTradingCount > 0) {
      insights.push({
        id: nextId(),
        category: "critical",
        title: "Revenge Trading Pattern",
        description: `Detected ${revengeTradingCount} instance(s) of possible revenge trading — continuing to trade after consecutive losses in the same day.`,
        metric: `${revengeTradingCount} instances`,
        recommendation:
          "After 2 consecutive losses, STOP trading for the day. Use the reframing technique to process the losses before your next session.",
        relatedNlp: "REFRAMING",
      });
    }

    // Trades without a daily plan
    const tradesWithoutPlan = closedTrades.filter((t) => !t.dailyPlanId);
    if (tradesWithoutPlan.length > 0 && closedTrades.length >= 3) {
      const pct = Math.round((tradesWithoutPlan.length / closedTrades.length) * 100);
      if (pct > 20) {
        insights.push({
          id: nextId(),
          category: "warning",
          title: "Trading Without a Plan",
          description: `${pct}% of your trades (${tradesWithoutPlan.length}) were taken without linking to a daily plan. Unplanned trades lack structure.`,
          metric: `${pct}%`,
          recommendation:
            "Always create a daily plan before your trading session and link every trade to it.",
        });
      }
    }

    // ── 3. HABIT & NLP CONSISTENCY ──────────────────────────────────

    // Habit consistency (last 14 days)
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const recentLogs = habitLogs.filter((l) => new Date(l.date) >= twoWeeksAgo);
    const expectedLogs = habits.length * 14;
    const habitConsistency =
      expectedLogs > 0 ? Math.round((recentLogs.length / expectedLogs) * 100) : 0;

    if (habits.length > 0 && habitConsistency < 50) {
      insights.push({
        id: nextId(),
        category: "warning",
        title: "Low Habit Consistency",
        description: `Only ${habitConsistency}% habit completion in the last 2 weeks. Consistent habits build the discipline that drives trading success.`,
        metric: `${habitConsistency}%`,
        recommendation:
          "Start with just 2-3 core habits and build consistency before adding more. Use incantations each morning to set your intention.",
        relatedNlp: "INCANTATIONS",
      });
    } else if (habits.length > 0 && habitConsistency >= 80) {
      insights.push({
        id: nextId(),
        category: "positive",
        title: "Excellent Habit Consistency",
        description: `${habitConsistency}% habit completion over the last 2 weeks. Your discipline routine is strong.`,
        metric: `${habitConsistency}%`,
      });
    }

    // NLP session frequency
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentNlp = nlpSessions.filter((s) => new Date(s.createdAt) >= thirtyDaysAgo);

    if (recentNlp.length === 0 && closedTrades.length > 0) {
      insights.push({
        id: nextId(),
        category: "improvement",
        title: "No NLP Sessions Recently",
        description:
          "You haven't done any NLP training in the last 30 days. Regular NLP practice strengthens your trading psychology.",
        recommendation:
          "Aim for at least 3-4 NLP sessions per week. Start with anchoring or visualization before your trading session.",
        relatedNlp: "ANCHORING",
      });
    } else if (recentNlp.length >= 12) {
      insights.push({
        id: nextId(),
        category: "positive",
        title: "Active NLP Practice",
        description: `${recentNlp.length} NLP sessions in the last 30 days. This mental training is a strong edge.`,
        metric: `${recentNlp.length} sessions`,
      });
    }

    // Streak check
    if (gamification && gamification.currentStreak === 0 && gamification.longestStreak > 3) {
      insights.push({
        id: nextId(),
        category: "warning",
        title: "Streak Broken",
        description: `Your streak was broken! Your longest was ${gamification.longestStreak} days. Consistency compounds over time.`,
        metric: `0 / ${gamification.longestStreak} best`,
        recommendation:
          "Don't be discouraged. Start a new streak today by completing at least one habit and an NLP session.",
      });
    }

    // Common mistakes analysis
    const mistakeFreq: Record<string, number> = {};
    for (const trade of closedTrades) {
      if (trade.mistakes) {
        const keywords = [
          "fomo",
          "revenge",
          "oversize",
          "early entry",
          "late entry",
          "no stop",
          "moved stop",
          "emotional",
          "impatient",
          "greed",
          "fear",
          "chased",
        ];
        const lower = trade.mistakes.toLowerCase();
        for (const kw of keywords) {
          if (lower.includes(kw)) {
            mistakeFreq[kw] = (mistakeFreq[kw] || 0) + 1;
          }
        }
      }
    }

    const topMistakes = Object.entries(mistakeFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    if (topMistakes.length > 0 && topMistakes[0][1] >= 2) {
      const mistakeNlpMap: Record<string, string> = {
        fomo: "SWISH",
        revenge: "REFRAMING",
        emotional: "ANCHORING",
        impatient: "ANCHORING",
        greed: "DIALOGUE",
        fear: "VISUALIZATION",
        chased: "SWISH",
        "moved stop": "DIALOGUE",
      };
      insights.push({
        id: nextId(),
        category: "improvement",
        title: "Top Recurring Mistakes",
        description: `Your most common mistakes: ${topMistakes.map(([k, v]) => `${k} (${v}x)`).join(", ")}. Awareness is the first step to change.`,
        recommendation: `Focus on eliminating your #1 mistake: "${topMistakes[0][0]}". The ${mistakeNlpMap[topMistakes[0][0]] || "REFRAMING"} technique can help.`,
        relatedNlp: mistakeNlpMap[topMistakes[0][0]] || "REFRAMING",
      });
    }

    // ── 4. WEEKLY TREND ─────────────────────────────────────────────

    const weeklyTrend: AnalysisReport["weeklyTrend"] = [];
    const now = new Date();
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - i * 7);
      weekStart.setHours(0, 0, 0, 0);
      const weekDay = weekStart.getDay();
      weekStart.setDate(weekStart.getDate() - weekDay);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const weekTrades = closedTrades.filter((t) => {
        const d = new Date(t.entryTime);
        return d >= weekStart && d < weekEnd;
      });

      if (weekTrades.length === 0) continue;

      const weekWins = weekTrades.filter((t) => t.status === "CLOSED_WIN");
      const weekAligned = weekTrades.filter((t) => t.alignedWithHTF);

      weeklyTrend.push({
        week: weekStart.toISOString().split("T")[0],
        winRate: Math.round((weekWins.length / weekTrades.length) * 100),
        pnl: Math.round(weekTrades.reduce((s, t) => s + (t.pnl || 0), 0) * 100) / 100,
        trades: weekTrades.length,
        discipline: Math.round((weekAligned.length / weekTrades.length) * 100),
      });
    }

    // Win rate trend
    let winRateTrend: "improving" | "declining" | "stable" = "stable";
    if (weeklyTrend.length >= 3) {
      const recent = weeklyTrend.slice(-2);
      const earlier = weeklyTrend.slice(-4, -2);
      const recentAvg = recent.reduce((s, w) => s + w.winRate, 0) / recent.length;
      const earlierAvg =
        earlier.length > 0
          ? earlier.reduce((s, w) => s + w.winRate, 0) / earlier.length
          : recentAvg;
      if (recentAvg > earlierAvg + 5) winRateTrend = "improving";
      else if (recentAvg < earlierAvg - 5) winRateTrend = "declining";
    }

    if (winRateTrend === "declining" && closedTrades.length >= 5) {
      insights.push({
        id: nextId(),
        category: "warning",
        title: "Win Rate Declining",
        description:
          "Your recent win rate is trending downward. This could indicate market conditions changing or a shift in your execution quality.",
        recommendation:
          "Review your last 5-10 trades for patterns. Consider reducing position size until the trend stabilizes.",
      });
    } else if (winRateTrend === "improving" && closedTrades.length >= 5) {
      insights.push({
        id: nextId(),
        category: "positive",
        title: "Win Rate Improving",
        description:
          "Your win rate is trending upward. Your recent changes in approach appear to be working.",
      });
    }

    // ── 5. CALCULATE HEALTH SCORE ───────────────────────────────────

    const healthScore = Math.round(
      (htfScore * 0.3 + planScore * 0.25 + riskScore * 0.25 + maxTradesScore * 0.2)
    );

    // Sort insights by priority
    const priorityOrder = { critical: 0, warning: 1, improvement: 2, positive: 3 };
    insights.sort((a, b) => priorityOrder[a.category] - priorityOrder[b.category]);

    const report: AnalysisReport = {
      healthScore,
      insights,
      ruleCompliance: {
        htfAlignment: {
          score: htfScore,
          total: closedTrades.length,
          aligned: alignedTrades.length,
        },
        planAdherence: {
          score: planScore,
          followed: plansFollowed.length,
          total: plansWithReview.length,
        },
        riskManagement: { score: riskScore, violations: riskViolations },
        maxTradesRespected: { score: maxTradesScore, violations: overtradingDays },
      },
      patterns: {
        bestSession,
        worstEmotionalState,
        bestSetupType: bestSetup,
        worstSetupType: worstSetup,
        winRateTrend,
        revengeTrading: revengeTradingCount,
        overtrading: overtradingDays,
      },
      weeklyTrend,
      lastAnalyzed: new Date().toISOString(),
    };

    return NextResponse.json({ report });
  } catch (error) {
    console.error("AI Analyzer error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
