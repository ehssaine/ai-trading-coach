import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const plans = await prisma.dailyPlan.findMany({
      where: { userId: session.userId },
      orderBy: { date: "desc" },
      include: {
        weeklyAnalysis: {
          select: { htfBias: true, marketStructure: true },
        },
        _count: { select: { trades: true } },
      },
    });

    return NextResponse.json({ plans });
  } catch (error) {
    console.error("Fetch daily plans error:", error);
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

    const plan = await prisma.dailyPlan.create({
      data: {
        userId: session.userId,
        date: new Date(data.date),
        weeklyAnalysisId: data.weeklyAnalysisId || null,
        dailyBias: data.dailyBias,
        dailyMarketStructure: data.dailyMarketStructure,
        alignedWithHTF: data.alignedWithHTF,
        asianSessionNotes: data.asianSessionNotes || null,
        londonSessionNotes: data.londonSessionNotes || null,
        nySessionNotes: data.nySessionNotes || null,
        dailySupport: data.dailySupport,
        dailyResistance: data.dailyResistance,
        dailyPOI: data.dailyPOI,
        maxTrades: data.maxTrades || 3,
        riskPerTrade: data.riskPerTrade || 1.0,
        tradePlan: data.tradePlan,
      },
    });

    return NextResponse.json({ plan }, { status: 201 });
  } catch (error) {
    console.error("Create daily plan error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
