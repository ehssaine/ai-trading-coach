import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const plan = await prisma.dailyPlan.findFirst({
      where: { id, userId: session.userId },
      include: {
        weeklyAnalysis: true,
        trades: { orderBy: { entryTime: "asc" } },
      },
    });

    if (!plan) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ plan });
  } catch (error) {
    console.error("Fetch daily plan error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const data = await req.json();

    const plan = await prisma.dailyPlan.updateMany({
      where: { id, userId: session.userId },
      data: {
        dailyBias: data.dailyBias,
        dailyMarketStructure: data.dailyMarketStructure,
        alignedWithHTF: data.alignedWithHTF,
        asianSessionNotes: data.asianSessionNotes || null,
        londonSessionNotes: data.londonSessionNotes || null,
        nySessionNotes: data.nySessionNotes || null,
        dailySupport: data.dailySupport,
        dailyResistance: data.dailyResistance,
        dailyPOI: data.dailyPOI,
        maxTrades: data.maxTrades,
        riskPerTrade: data.riskPerTrade,
        tradePlan: data.tradePlan,
        reviewNotes: data.reviewNotes || null,
        followedPlan: data.followedPlan ?? null,
        emotionalState: data.emotionalState || null,
        lessonLearned: data.lessonLearned || null,
      },
    });

    return NextResponse.json({ plan });
  } catch (error) {
    console.error("Update daily plan error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.dailyPlan.deleteMany({
      where: { id, userId: session.userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete daily plan error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
