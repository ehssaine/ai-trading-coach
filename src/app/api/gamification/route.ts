import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const { userId } = await requireAuth();

    // Get or create the gamification profile
    const profile = await prisma.gamificationProfile.upsert({
      where: { userId },
      create: {
        userId,
        totalPoints: 0,
        currentStreak: 0,
        longestStreak: 0,
        level: 1,
        nlpSessionsTotal: 0,
        habitsCompleted: 0,
      },
      update: {},
    });

    return NextResponse.json({
      profile: {
        totalPoints: profile.totalPoints,
        currentStreak: profile.currentStreak,
        longestStreak: profile.longestStreak,
        level: profile.level,
        nlpSessionsTotal: profile.nlpSessionsTotal,
        habitsCompleted: profile.habitsCompleted,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Fetch gamification profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
