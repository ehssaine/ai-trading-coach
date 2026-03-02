import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await prisma.notificationSettings.findUnique({
      where: { userId: session.userId },
    });

    return NextResponse.json({
      settings: settings || {
        whatsappEnabled: false,
        whatsappNumber: null,
        reportTime: "07:00",
        timezone: "UTC",
        includeTradeStats: true,
        includeDailyPlan: true,
        includeHabitReminder: true,
        includeAiInsights: true,
      },
    });
  } catch (error) {
    console.error("Get notification settings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    // Validate phone number format
    if (data.whatsappNumber && !/^\+[1-9]\d{6,14}$/.test(data.whatsappNumber)) {
      return NextResponse.json(
        { error: "Invalid phone number. Use international format: +1234567890" },
        { status: 400 }
      );
    }

    // Validate time format
    if (data.reportTime && !/^\d{2}:\d{2}$/.test(data.reportTime)) {
      return NextResponse.json(
        { error: "Invalid time format. Use HH:mm format." },
        { status: 400 }
      );
    }

    const settings = await prisma.notificationSettings.upsert({
      where: { userId: session.userId },
      create: {
        userId: session.userId,
        whatsappEnabled: data.whatsappEnabled ?? false,
        whatsappNumber: data.whatsappNumber || null,
        reportTime: data.reportTime || "07:00",
        timezone: data.timezone || "UTC",
        includeTradeStats: data.includeTradeStats ?? true,
        includeDailyPlan: data.includeDailyPlan ?? true,
        includeHabitReminder: data.includeHabitReminder ?? true,
        includeAiInsights: data.includeAiInsights ?? true,
      },
      update: {
        whatsappEnabled: data.whatsappEnabled ?? false,
        whatsappNumber: data.whatsappNumber || null,
        reportTime: data.reportTime || "07:00",
        timezone: data.timezone || "UTC",
        includeTradeStats: data.includeTradeStats ?? true,
        includeDailyPlan: data.includeDailyPlan ?? true,
        includeHabitReminder: data.includeHabitReminder ?? true,
        includeAiInsights: data.includeAiInsights ?? true,
      },
    });

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Save notification settings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
