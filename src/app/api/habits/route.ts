import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

const VALID_CATEGORIES = [
  "PRE_TRADE",
  "POST_TRADE",
  "NLP",
  "MINDSET",
  "RISK_MANAGEMENT",
] as const;

export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireAuth();

    const showAll = request.nextUrl.searchParams.get("all") === "true";

    const where: Record<string, unknown> = { userId };
    if (!showAll) {
      where.isActive = true;
    }

    const today = new Date(new Date().setHours(0, 0, 0, 0));
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const habits = await prisma.habit.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        logs: {
          where: {
            date: {
              gte: today,
              lt: tomorrow,
            },
          },
        },
      },
    });

    const habitsWithTodayLog = habits.map((habit) => ({
      ...habit,
      todayLog: habit.logs[0] || null,
      logs: undefined,
    }));

    // Calculate today's completion stats for active habits only
    const activeHabits = habits.filter((h) => h.isActive);
    const totalActive = activeHabits.length;
    const completedToday = activeHabits.filter(
      (h) => h.logs.length > 0
    ).length;
    const percentage =
      totalActive > 0 ? Math.round((completedToday / totalActive) * 100) : 0;

    return NextResponse.json({
      habits: habitsWithTodayLog,
      todayStats: {
        total: totalActive,
        completed: completedToday,
        percentage,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Fetch habits error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAuth();

    const body = await request.json();
    const { name, description, category, frequency } = body;

    if (!name || !category) {
      return NextResponse.json(
        { error: "name and category are required" },
        { status: 400 }
      );
    }

    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        {
          error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    if (frequency && !["DAILY", "WEEKLY"].includes(frequency)) {
      return NextResponse.json(
        { error: "frequency must be DAILY or WEEKLY" },
        { status: 400 }
      );
    }

    const habit = await prisma.habit.create({
      data: {
        userId,
        name,
        description: description || null,
        category,
        frequency: frequency || "DAILY",
      },
    });

    // Check badge eligibility: HABIT_STARTER if user has >= 5 active habits
    const activeHabitCount = await prisma.habit.count({
      where: { userId, isActive: true },
    });

    let badgeAwarded: string | null = null;

    if (activeHabitCount >= 5) {
      const existingBadge = await prisma.userBadge.findFirst({
        where: { userId, badgeType: "HABIT_STARTER" },
      });
      if (!existingBadge) {
        await prisma.userBadge.create({
          data: {
            userId,
            badgeType: "HABIT_STARTER",
            badgeName: "Habit Builder",
            description: "Create 5 active habits",
          },
        });
        badgeAwarded = "HABIT_STARTER";
      }
    }

    return NextResponse.json(
      {
        habit,
        ...(badgeAwarded && { badgeAwarded }),
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Create habit error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
