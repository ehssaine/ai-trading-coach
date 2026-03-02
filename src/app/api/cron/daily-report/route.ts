import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateReportText, sendWhatsAppMessage } from "@/lib/whatsapp";

// This endpoint is designed to be called by an external cron service
// (e.g., Vercel Cron, Railway Cron, or any HTTP-based scheduler)
// It should be called every hour to check which users need their report sent.
//
// Setup instructions:
// 1. Set CRON_SECRET in your environment variables
// 2. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM
// 3. Configure a cron job to call GET /api/cron/daily-report every hour
//    with header: Authorization: Bearer <CRON_SECRET>
//
// Example Vercel cron (vercel.json):
// { "crons": [{ "path": "/api/cron/daily-report", "schedule": "0 * * * *" }] }

export async function GET(req: NextRequest) {
  // Verify cron secret
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find all users with WhatsApp notifications enabled
    let settings;
    try {
      settings = await prisma.notificationSettings.findMany({
        where: {
          whatsappEnabled: true,
          whatsappNumber: { not: null },
        },
      });
    } catch {
      // Table may not exist yet
      return NextResponse.json({
        processed: 0,
        results: [],
        timestamp: new Date().toISOString(),
        note: "NotificationSettings table not available",
      });
    }

    const now = new Date();
    const results: { userId: string; success: boolean; error?: string }[] = [];

    for (const setting of settings) {
      // Check if current hour matches the user's report time
      const [targetHour] = setting.reportTime.split(":").map(Number);
      const currentHour = now.getUTCHours();

      // Simple timezone offset calculation
      const tzOffsets: Record<string, number> = {
        UTC: 0, EST: -5, CST: -6, MST: -7, PST: -8,
        CET: 1, EET: 2, IST: 5.5, JST: 9, AEST: 10,
        GMT: 0, "GMT+1": 1, "GMT+2": 2, "GMT+3": 3, "GMT+4": 4,
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
