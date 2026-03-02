import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { generateReportText, sendWhatsAppMessage } from "@/lib/whatsapp";

// Manual trigger: send report for current user
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const isTest = body.test === true;

    let settings;
    try {
      settings = await prisma.notificationSettings.findUnique({
        where: { userId: session.userId },
      });
    } catch {
      return NextResponse.json(
        { error: "WhatsApp notifications not configured. Please save your settings first." },
        { status: 400 }
      );
    }

    if (!settings || !settings.whatsappEnabled || !settings.whatsappNumber) {
      return NextResponse.json(
        { error: "WhatsApp notifications not configured. Enable WhatsApp and enter your phone number first." },
        { status: 400 }
      );
    }

    const reportText = await generateReportText(session.userId, {
      includeTradeStats: settings.includeTradeStats,
      includeDailyPlan: settings.includeDailyPlan,
      includeHabitReminder: settings.includeHabitReminder,
      includeAiInsights: settings.includeAiInsights,
    });

    if (isTest) {
      return NextResponse.json({ report: reportText, preview: true });
    }

    const result = await sendWhatsAppMessage(settings.whatsappNumber, reportText);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to send WhatsApp message" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "Report sent successfully" });
  } catch (error) {
    console.error("Send report error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
