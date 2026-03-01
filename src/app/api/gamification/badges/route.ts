import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

const ALL_BADGES = [
  {
    type: "STREAK_7",
    name: "7-Day Warrior",
    description: "Complete all daily habits for 7 consecutive days",
  },
  {
    type: "STREAK_30",
    name: "Monthly Master",
    description: "Complete all daily habits for 30 consecutive days",
  },
  {
    type: "NLP_BEGINNER",
    name: "Mind Explorer",
    description: "Complete 5 NLP sessions",
  },
  {
    type: "NLP_MASTER",
    name: "NLP Master",
    description: "Complete 50 NLP sessions",
  },
  {
    type: "DISCIPLINE_KING",
    name: "Discipline King",
    description: "Achieve 80%+ HTF alignment score",
  },
  {
    type: "FIRST_TRADE",
    name: "First Blood",
    description: "Log your first trade",
  },
  {
    type: "JOURNAL_STREAK",
    name: "Consistent Journalist",
    description: "Journal for 7 consecutive days",
  },
  {
    type: "HABIT_STARTER",
    name: "Habit Builder",
    description: "Create 5 active habits",
  },
];

export async function GET() {
  try {
    const { userId } = await requireAuth();

    // Get all earned badges for the user
    const userBadges = await prisma.userBadge.findMany({
      where: { userId },
      orderBy: { earnedAt: "desc" },
    });

    const earnedBadgeTypes = new Set(userBadges.map((b) => b.badgeType));

    // Determine which badges are available (not yet earned)
    const available = ALL_BADGES.filter(
      (badge) => !earnedBadgeTypes.has(badge.type)
    );

    // Map earned badges with full details
    const earned = userBadges.map((badge) => ({
      id: badge.id,
      type: badge.badgeType,
      name: badge.badgeName,
      description: badge.description,
      earnedAt: badge.earnedAt,
    }));

    return NextResponse.json({
      earned,
      available,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Fetch badges error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
