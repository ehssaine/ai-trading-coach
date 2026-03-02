import { prisma } from "@/lib/prisma";

// Generate the daily report text
export async function generateReportText(
  userId: string,
  preferences: {
    includeTradeStats: boolean;
    includeDailyPlan: boolean;
    includeHabitReminder: boolean;
    includeAiInsights: boolean;
  }
): Promise<string> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const lines: string[] = [];
  lines.push("🏆 *TradingCoach Daily Report*");
  lines.push(
    `📅 ${today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}`
  );
  lines.push("");

  // Trade stats
  if (preferences.includeTradeStats) {
    const trades = await prisma.trade.findMany({
      where: { userId },
    });

    const closedTrades = trades.filter(
      (t) => t.status !== "OPEN" && t.status !== "CANCELLED"
    );
    const yesterdayTrades = closedTrades.filter((t) => {
      const d = new Date(t.entryTime);
      return d >= yesterday && d < today;
    });

    const totalWins = closedTrades.filter((t) => t.status === "CLOSED_WIN").length;
    const winRate =
      closedTrades.length > 0 ? Math.round((totalWins / closedTrades.length) * 100) : 0;
    const totalPnl =
      Math.round(closedTrades.reduce((s, t) => s + (t.pnl || 0), 0) * 100) / 100;
    const aligned = closedTrades.filter((t) => t.alignedWithHTF).length;
    const discipline =
      closedTrades.length > 0 ? Math.round((aligned / closedTrades.length) * 100) : 100;

    lines.push("📊 *Overall Performance*");
    lines.push(
      `• Win Rate: ${winRate}% (${totalWins}W/${closedTrades.length - totalWins}L)`
    );
    lines.push(`• Total P&L: ${totalPnl >= 0 ? "+" : ""}${totalPnl}`);
    lines.push(`• Discipline Score: ${discipline}%`);

    if (yesterdayTrades.length > 0) {
      const yWins = yesterdayTrades.filter((t) => t.status === "CLOSED_WIN").length;
      const yPnl =
        Math.round(yesterdayTrades.reduce((s, t) => s + (t.pnl || 0), 0) * 100) / 100;
      lines.push("");
      lines.push("📈 *Yesterday's Trades*");
      lines.push(
        `• ${yesterdayTrades.length} trade(s): ${yWins}W / ${yesterdayTrades.length - yWins}L`
      );
      lines.push(`• P&L: ${yPnl >= 0 ? "+" : ""}${yPnl}`);
    }
    lines.push("");
  }

  // Daily plan reminder
  if (preferences.includeDailyPlan) {
    const todayPlan = await prisma.dailyPlan.findFirst({
      where: {
        userId,
        date: { gte: today, lt: tomorrow },
      },
      include: {
        weeklyAnalysis: { select: { htfBias: true, marketStructure: true } },
      },
    });

    const latestWeekly = await prisma.weeklyAnalysis.findFirst({
      where: { userId },
      orderBy: { weekStart: "desc" },
    });

    lines.push("📋 *Today's Plan*");
    if (todayPlan) {
      lines.push(`• Bias: ${todayPlan.dailyBias}`);
      lines.push(`• Max Trades: ${todayPlan.maxTrades}`);
      lines.push(`• Risk/Trade: ${todayPlan.riskPerTrade}%`);
      if (todayPlan.alignedWithHTF) {
        lines.push("✅ Aligned with HTF");
      } else {
        lines.push("⚠️ Not aligned with HTF — trade with caution");
      }
    } else {
      lines.push("⚠️ No daily plan created yet!");
      lines.push("→ Create your plan before trading.");
      if (latestWeekly) {
        lines.push(
          `📐 HTF Bias: ${latestWeekly.htfBias} (${latestWeekly.marketStructure})`
        );
      }
    }
    lines.push("");
  }

  // Habit reminder
  if (preferences.includeHabitReminder) {
    const habits = await prisma.habit.findMany({
      where: { userId, isActive: true, frequency: "DAILY" },
    });

    const todayLogs = await prisma.habitLog.findMany({
      where: {
        userId,
        date: { gte: today, lt: tomorrow },
      },
    });

    const completedIds = new Set(todayLogs.map((l) => l.habitId));
    const pendingHabits = habits.filter((h) => !completedIds.has(h.id));

    lines.push("✅ *Daily Habits*");
    if (pendingHabits.length === 0 && habits.length > 0) {
      lines.push("🎉 All habits completed! Great job!");
    } else if (pendingHabits.length > 0) {
      lines.push(`${habits.length - pendingHabits.length}/${habits.length} completed`);
      lines.push("Remaining:");
      for (const h of pendingHabits.slice(0, 5)) {
        lines.push(`  ☐ ${h.name}`);
      }
    } else {
      lines.push("No habits set up yet. Add some in the app!");
    }
    lines.push("");
  }

  // AI insights
  if (preferences.includeAiInsights) {
    const closedTrades = await prisma.trade.findMany({
      where: { userId, status: { notIn: ["OPEN", "CANCELLED"] } },
      orderBy: { entryTime: "desc" },
      take: 20,
    });

    const tips: string[] = [];

    // Check recent emotional states
    const recentEmotional = closedTrades
      .slice(0, 5)
      .map((t) => t.emotionalState)
      .filter(Boolean);
    const negativeStates = recentEmotional.filter((s) =>
      ["FOMO", "REVENGE", "ANXIOUS"].includes(s!)
    );
    if (negativeStates.length >= 2) {
      tips.push(
        "🧠 You've been trading emotionally. Do an NLP session before trading today."
      );
    }

    // Check counter-HTF trades recently
    const recentCounter = closedTrades.slice(0, 10).filter((t) => !t.alignedWithHTF);
    if (recentCounter.length >= 3) {
      tips.push("⚠️ Multiple counter-HTF trades recently. Stick to the plan today.");
    }

    // Check losing streak
    const recentResults = closedTrades.slice(0, 5).map((t) => t.status);
    const consecutiveLosses = recentResults.findIndex((s) => s !== "CLOSED_LOSS");
    if (
      consecutiveLosses >= 3 ||
      (consecutiveLosses === -1 && recentResults.length >= 3)
    ) {
      tips.push(
        "🛑 You're on a losing streak. Consider reducing size or taking a break."
      );
    }

    if (tips.length === 0) {
      tips.push("💡 Stay disciplined, follow your plan, and respect your rules.");
    }

    lines.push("🤖 *AI Insights*");
    for (const tip of tips) {
      lines.push(tip);
    }
    lines.push("");
  }

  lines.push("_Open the app for your full AI analysis →_");
  lines.push("— TradingCoach AI");

  return lines.join("\n");
}

// Send WhatsApp message via Twilio
export async function sendWhatsAppMessage(
  to: string,
  body: string
): Promise<{ success: boolean; error?: string }> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886";

  if (!accountSid || !authToken) {
    return { success: false, error: "Twilio credentials not configured" };
  }

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        },
        body: new URLSearchParams({
          From: fromNumber,
          To: `whatsapp:${to}`,
          Body: body,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.message || "Failed to send message",
      };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}
