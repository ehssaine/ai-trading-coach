import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const dailyPlanId = searchParams.get("dailyPlanId");

    const where: Record<string, unknown> = { userId: session.userId };
    if (status) where.status = status;
    if (dailyPlanId) where.dailyPlanId = dailyPlanId;

    const trades = await prisma.trade.findMany({
      where,
      orderBy: { entryTime: "desc" },
      include: {
        dailyPlan: {
          select: {
            dailyBias: true,
            alignedWithHTF: true,
            weeklyAnalysis: {
              select: { htfBias: true },
            },
          },
        },
      },
    });

    return NextResponse.json({ trades });
  } catch (error) {
    console.error("Fetch trades error:", error);
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

    const trade = await prisma.trade.create({
      data: {
        userId: session.userId,
        dailyPlanId: data.dailyPlanId || null,
        pair: data.pair,
        direction: data.direction,
        entryPrice: data.entryPrice,
        stopLoss: data.stopLoss,
        takeProfit: data.takeProfit,
        positionSize: data.positionSize,
        riskRewardRatio: data.riskRewardRatio,
        entryTime: new Date(data.entryTime),
        exitTime: data.exitTime ? new Date(data.exitTime) : null,
        exitPrice: data.exitPrice ?? null,
        status: data.status || "OPEN",
        alignedWithHTF: data.alignedWithHTF,
        alignedWithDaily: data.alignedWithDaily,
        setupType: data.setupType,
        pnl: data.pnl ?? null,
        pnlPercentage: data.pnlPercentage ?? null,
        entryReason: data.entryReason,
        exitReason: data.exitReason || null,
        screenshot: data.screenshot || null,
        mistakes: data.mistakes || null,
        lessonsLearned: data.lessonsLearned || null,
        emotionalState: data.emotionalState || null,
        rating: data.rating ?? null,
      },
    });

    return NextResponse.json({ trade }, { status: 201 });
  } catch (error) {
    console.error("Create trade error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
