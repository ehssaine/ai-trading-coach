import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

const VALID_TECHNIQUES = [
  "ANCHORING",
  "REFRAMING",
  "SWISH",
  "VISUALIZATION",
  "MODELING",
  "MIRRORING",
  "INCANTATIONS",
  "DIALOGUE",
] as const;

export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireAuth();

    const technique = request.nextUrl.searchParams.get("technique");

    const where: Record<string, unknown> = { userId };
    if (technique) {
      where.technique = technique;
    }

    const sessions = await prisma.nlpSession.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const allSessions = await prisma.nlpSession.findMany({
      where: { userId },
      select: { technique: true, rating: true },
    });

    const totalSessions = allSessions.length;

    const sessionsPerTechnique: Record<string, number> = {};
    let ratingSum = 0;
    let ratingCount = 0;

    for (const s of allSessions) {
      sessionsPerTechnique[s.technique] =
        (sessionsPerTechnique[s.technique] || 0) + 1;
      if (s.rating !== null) {
        ratingSum += s.rating;
        ratingCount++;
      }
    }

    const avgRating = ratingCount > 0 ? ratingSum / ratingCount : null;

    return NextResponse.json({
      sessions,
      stats: {
        totalSessions,
        sessionsPerTechnique,
        avgRating,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Fetch NLP sessions error:", error);
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
    const { technique, duration, notes, rating, triggerError } = body;

    if (!technique || !duration) {
      return NextResponse.json(
        { error: "technique and duration are required" },
        { status: 400 }
      );
    }

    if (!VALID_TECHNIQUES.includes(technique)) {
      return NextResponse.json(
        {
          error: `Invalid technique. Must be one of: ${VALID_TECHNIQUES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    if (typeof duration !== "number" || duration <= 0) {
      return NextResponse.json(
        { error: "duration must be a positive number" },
        { status: 400 }
      );
    }

    if (rating !== undefined && rating !== null) {
      if (typeof rating !== "number" || rating < 1 || rating > 5) {
        return NextResponse.json(
          { error: "rating must be between 1 and 5" },
          { status: 400 }
        );
      }
    }

    const session = await prisma.nlpSession.create({
      data: {
        userId,
        technique,
        duration,
        notes: notes || null,
        rating: rating ?? null,
        triggerError: triggerError || null,
      },
    });

    // Update gamification profile
    const profile = await prisma.gamificationProfile.upsert({
      where: { userId },
      create: {
        userId,
        totalPoints: 10,
        nlpSessionsTotal: 1,
      },
      update: {
        totalPoints: { increment: 10 },
        nlpSessionsTotal: { increment: 1 },
      },
    });

    // Check badge eligibility
    const badgesAwarded: string[] = [];

    if (profile.nlpSessionsTotal >= 5) {
      const existingBeginner = await prisma.userBadge.findFirst({
        where: { userId, badgeType: "NLP_BEGINNER" },
      });
      if (!existingBeginner) {
        await prisma.userBadge.create({
          data: {
            userId,
            badgeType: "NLP_BEGINNER",
            badgeName: "Mind Explorer",
            description: "Complete 5 NLP sessions",
          },
        });
        badgesAwarded.push("NLP_BEGINNER");
      }
    }

    if (profile.nlpSessionsTotal >= 50) {
      const existingMaster = await prisma.userBadge.findFirst({
        where: { userId, badgeType: "NLP_MASTER" },
      });
      if (!existingMaster) {
        await prisma.userBadge.create({
          data: {
            userId,
            badgeType: "NLP_MASTER",
            badgeName: "NLP Master",
            description: "Complete 50 NLP sessions",
          },
        });
        badgesAwarded.push("NLP_MASTER");
      }
    }

    // Update level based on total points
    const newLevel = Math.floor(profile.totalPoints / 100) + 1;
    if (newLevel !== profile.level) {
      await prisma.gamificationProfile.update({
        where: { userId },
        data: { level: newLevel },
      });
    }

    return NextResponse.json(
      {
        session,
        pointsEarned: 10,
        ...(badgesAwarded.length > 0 && { badgesAwarded }),
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Create NLP session error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
