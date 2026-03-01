import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const analyses = await prisma.weeklyAnalysis.findMany({
      where: { userId: session.userId },
      orderBy: { weekStart: "desc" },
      include: {
        _count: { select: { dailyPlans: true } },
      },
    });

    return NextResponse.json({ analyses });
  } catch (error) {
    console.error("Fetch weekly analyses error:", error);
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

    const analysis = await prisma.weeklyAnalysis.create({
      data: {
        userId: session.userId,
        weekStart: new Date(data.weekStart),
        marketStructure: data.marketStructure,
        keyLevel: data.keyLevel,
        trendDescription: data.trendDescription,
        htfBias: data.htfBias,
        biasReasoning: data.biasReasoning,
        weeklySupport: data.weeklySupport,
        weeklyResistance: data.weeklyResistance,
        weeklyPOI: data.weeklyPOI,
        notes: data.notes || null,
      },
    });

    return NextResponse.json({ analysis }, { status: 201 });
  } catch (error) {
    console.error("Create weekly analysis error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
