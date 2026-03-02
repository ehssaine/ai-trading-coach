import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// This endpoint is designed to be called by an external cron service
// (e.g., Vercel Cron, Railway Cron, or any HTTP-based scheduler)
// It should be called every hour to check which users need their report sent.
//
// Setup instructions:
// 1. Set CRON_SECRET in your environment variables
// 2. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM
// 3. Configure a cron job to call POST /api/cron/daily-report every hour
//    with header: Authorization: Bearer <CRON_SECRET>
//
// Example Vercel cron (vercel.json):
// { "crons": [{ "path": "/api/cron/daily-report", "schedule": "0 * * * *" }] }

async function generateReportText(userId: string, preferences: {
  includeTradeStats: boolean;
  includeDailyPlan: boolean;
  includeHabitReminder: boolean;
  includeAiInsights: boolean;
}): Promise<string> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const lines: string[] = [];
  lines.push("🏆 *TradingCoach Daily Report*");
  lines.push(`📅 ${today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}`);
  lines.push("");

  if (preferences.includeTradeStats) {
    const trades = await prisma.trade.findMany({ where: { userId } });
    const closedTrades = trades.filter((t) => t.status !== "OPEN" && t.status !== "CANCELLED");
    const yesterdayTrades = closedTrades.filter((t) => {
      const d = new Date(t.entryTime);
      return d >= yesterday && d < today;
    });
    const totalWins = closedTrades.filter((t) => t.status === "CLOSED_WIN").length;
    const winRate = closedTrades.length > 0 ? Math.round((totalWins / closedTrades.length) * 100) : 0;
    const totalPnl = Math.round(closedTrades.reduce((s, t) => s + (t.pnl || 0), 0) * 100) / 100;
    const aligned = closedTrades.filter((t) => t.alignedWithHTF).length;
    const discipline = closedTrades.length > 0 ? Math.round((aligned / closedTrades.length) * 100) : 100;

    lines.push("📊 *Overall Performance*");
    lines.push(`• Win Rate: ${winRate}% (${totalWins}W/${closedTrades.length - totalWins}L)`);
    lines.push(`• Total P&L: ${totalPnl >= 0 ? "+" : ""}${totalPnl}`);
    lines.push(`• Discipline Score: ${discipline}%`);

    if (yesterdayTrades.length > 0) {
      const yWins = yesterdayTrades.filter((t) => t.status === "CLOSED_WIN").length;
      const yPnl = Math.round(yesterdayTrades.reduce((s, t) => s + (t.pnl || 0), 0) * 100) / 100;
      lines.push("");
      lines.push("📈 *Yesterday's Trades*");
      lines.push(`• ${yesterdayTrades.length} trade(s): ${yWins}W / ${yesterdayTrades.length - yWins}L`);
      lines.push(`• P&L: ${yPnl >= 0 ? "+" : ""}${yPnl}`);
    }
    lines.push("");
  }

  if (preferences.includeDailyPlan) {
    const todayPlan = await prisma.dailyPlan.findFirst({
      where: { userId, date: { gte: today, lt: tomorrow } },
      include: { weeklyAnalysis: { select: { htfBias: true, marketStructure: true } } },
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
      lines.push(todayPlan.alignedWithHTF ? "✅ Aligned with HTF" : "⚠️ Not aligned with HTF");
    } else {
      lines.push("⚠️ No daily plan created yet!");
      lines.push("→ Create your plan before trading.");
      if (latestWeekly) {
        lines.push(`📐 HTF Bias: ${latestWeekly.htfBias} (${latestWeekly.marketStructure})`);
      }
    }
    lines.push("");
  }

  if (preferences.includeHabitReminder) {
    const habits = await prisma.habit.findMany({
      where: { userId, isActive: true, frequency: "DAILY" },
    });
    lines.push("✅ *Daily Habits*");
    if (habits.length > 0) {
      lines.push(`${habits.length} habits to complete today:`);
      for (const h of habits.slice(0, 5)) {
        lines.push(`  ☐ ${h.name}`);
      }
      if (habits.length > 5) lines.push(`  ... and ${habits.length - 5} more`);
    } else {
      lines.push("No habits set up yet.");
    }
    lines.push("");
  }

  if (preferences.includeAiInsights) {
    const recentTrades = await prisma.trade.findMany({
      where: { userId, status: { notIn: ["OPEN", "CANCELLED"] } },
      orderBy: { entryTime: "desc" },
      take: 10,
    });

    const tips: string[] = [];
    const negativeStates = recentTrades.slice(0, 5).filter((t) =>
      ["FOMO", "REVENGE", "ANXIOUS"].includes(t.emotionalState || "")
    );
    if (negativeStates.length >= 2) {
      tips.push("🧠 Recent emotional trading detected. Do an NLP session first.");
    }
    const counterHTF = recentTrades.filter((t) => !t.alignedWithHTF);
    if (counterHTF.length >= 3) {
      tips.push("⚠️ Multiple counter-HTF trades. Stay disciplined today.");
    }
    if (tips.length === 0) {
      tips.push("💡 Stay disciplined, follow your plan, respect your rules.");
    }

    lines.push("🤖 *AI Insights*");
    for (const tip of tips) lines.push(tip);
    lines.push("");
  }

  lines.push("_Open the app for your full AI analysis →_");
  lines.push("— TradingCoach AI");
  return lines.join("\n");
}

async function sendWhatsAppMessage(to: string, body: string): Promise<{ success: boolean; error?: string }> {
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
      return { success: false, error: errorData.message || "Failed to send" };
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function GET(req: NextRequest) {
  // Verify cron secret
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find all users with WhatsApp notifications enabled
    const settings = await prisma.notificationSettings.findMany({
      where: {
        whatsappEnabled: true,
        whatsappNumber: { not: null },
      },
    });

    const now = new Date();
    const results: { userId: string; success: boolean; error?: string }[] = [];

    for (const setting of settings) {
      // Check if current hour matches the user's report time
      // Simple hour-based matching (for production, consider timezone properly)
      const [targetHour] = setting.reportTime.split(":").map(Number);
      const currentHour = now.getUTCHours();

      // Simple timezone offset calculation
      const tzOffsets: Record<string, number> = {
        "UTC": 0, "EST": -5, "CST": -6, "MST": -7, "PST": -8,
        "CET": 1, "EET": 2, "IST": 5.5, "JST": 9, "AEST": 10,
        "GMT": 0, "GMT+1": 1, "GMT+2": 2, "GMT+3": 3, "GMT+4": 4,
        "GMT-1": -1, "GMT-2": -2, "GMT-3": -3, "GMT-4": -4, "GMT-5": -5,
      };

      const offset = tzOffsets[setting.timezone] || 0;
      const userHour = (currentHour + offset + 24) % 24;

      if (Math.floor(userHour) !== targetHour) continue;

      const report = await generateReportText(setting.userId, {
        includeTradeStats: setting.includeTradeStats,
        includeDailyPlan: setting.includeDailyPlan,
        includeHabitReminder: setting.includeHabitReminder,
        includeAiInsights: setting.includeAiInsights,
      });

      const result = await sendWhatsAppMessage(setting.whatsappNumber!, report);
      results.push({ userId: setting.userId, ...result });
    }

    return NextResponse.json({
      processed: results.length,
      results,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("Cron daily report error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
