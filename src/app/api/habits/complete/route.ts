import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

async function calculateStreak(userId: string): Promise<number> {
  // Get all active habits for the user
  const activeHabits = await prisma.habit.findMany({
    where: { userId, isActive: true },
    select: { id: true },
  });

  if (activeHabits.length === 0) return 0;

  const activeHabitIds = activeHabits.map((h) => h.id);
  const totalActiveHabits = activeHabitIds.length;

  // Walk backwards from today checking each day
  let streak = 0;
  const checkDate = new Date(new Date().setHours(0, 0, 0, 0));

  while (true) {
    const nextDay = new Date(checkDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const completedCount = await prisma.habitLog.count({
      where: {
        userId,
        habitId: { in: activeHabitIds },
        completed: true,
        date: {
          gte: checkDate,
          lt: nextDay,
        },
      },
    });

    if (completedCount >= totalActiveHabits) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAuth();

    const body = await request.json();
    const { habitId, date, notes } = body;

    if (!habitId) {
      return NextResponse.json(
        { error: "habitId is required" },
        { status: 400 }
      );
    }

    // Verify the habit belongs to the user
    const habit = await prisma.habit.findFirst({
      where: { id: habitId, userId },
    });

    if (!habit) {
      return NextResponse.json(
        { error: "Habit not found" },
        { status: 404 }
      );
    }

    const logDate = date
      ? new Date(new Date(date).setHours(0, 0, 0, 0))
      : new Date(new Date().setHours(0, 0, 0, 0));

    // Upsert the habit log (based on habitId + date unique constraint)
    const log = await prisma.habitLog.upsert({
      where: {
        habitId_date: {
          habitId,
          date: logDate,
        },
      },
      create: {
        userId,
        habitId,
        date: logDate,
        completed: true,
        notes: notes || null,
      },
      update: {
        completed: true,
        notes: notes || null,
      },
    });

    // Update gamification profile
    const profile = await prisma.gamificationProfile.upsert({
      where: { userId },
      create: {
        userId,
        totalPoints: 5,
        habitsCompleted: 1,
      },
      update: {
        totalPoints: { increment: 5 },
        habitsCompleted: { increment: 1 },
      },
    });

    // Calculate streak
    const currentStreak = await calculateStreak(userId);
    const longestStreak = Math.max(currentStreak, profile.longestStreak);

    await prisma.gamificationProfile.update({
      where: { userId },
      data: {
        currentStreak,
        longestStreak,
      },
    });

    // Check streak badges
    const badgesAwarded: string[] = [];

    if (currentStreak >= 7) {
      const existingBadge = await prisma.userBadge.findFirst({
        where: { userId, badgeType: "STREAK_7" },
      });
      if (!existingBadge) {
        await prisma.userBadge.create({
          data: {
            userId,
            badgeType: "STREAK_7",
            badgeName: "7-Day Warrior",
            description: "Complete all daily habits for 7 consecutive days",
          },
        });
        badgesAwarded.push("STREAK_7");
      }
    }

    if (currentStreak >= 30) {
      const existingBadge = await prisma.userBadge.findFirst({
        where: { userId, badgeType: "STREAK_30" },
      });
      if (!existingBadge) {
        await prisma.userBadge.create({
          data: {
            userId,
            badgeType: "STREAK_30",
            badgeName: "Monthly Master",
            description: "Complete all daily habits for 30 consecutive days",
          },
        });
        badgesAwarded.push("STREAK_30");
      }
    }

    // Update level based on total points
    const updatedProfile = await prisma.gamificationProfile.findUnique({
      where: { userId },
    });
    if (updatedProfile) {
      const newLevel = Math.floor(updatedProfile.totalPoints / 100) + 1;
      if (newLevel !== updatedProfile.level) {
        await prisma.gamificationProfile.update({
          where: { userId },
          data: { level: newLevel },
        });
      }
    }

    return NextResponse.json(
      {
        log,
        streak: currentStreak,
        pointsEarned: 5,
        ...(badgesAwarded.length > 0 && { badgesAwarded }),
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Complete habit error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await requireAuth();

    const body = await request.json();
    const { habitId, date } = body;

    if (!habitId || !date) {
      return NextResponse.json(
        { error: "habitId and date are required" },
        { status: 400 }
      );
    }

    // Verify the habit belongs to the user
    const habit = await prisma.habit.findFirst({
      where: { id: habitId, userId },
    });

    if (!habit) {
      return NextResponse.json(
        { error: "Habit not found" },
        { status: 404 }
      );
    }

    const logDate = new Date(new Date(date).setHours(0, 0, 0, 0));

    // Delete the habit log
    await prisma.habitLog.delete({
      where: {
        habitId_date: {
          habitId,
          date: logDate,
        },
      },
    });

    // Recalculate streak
    const currentStreak = await calculateStreak(userId);

    const profile = await prisma.gamificationProfile.findUnique({
      where: { userId },
    });

    if (profile) {
      await prisma.gamificationProfile.update({
        where: { userId },
        data: {
          currentStreak,
          // longestStreak is not reduced - it's a high water mark
        },
      });
    }

    return NextResponse.json({ success: true, streak: currentStreak });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Remove habit completion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
