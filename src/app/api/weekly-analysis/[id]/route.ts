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
    const analysis = await prisma.weeklyAnalysis.findFirst({
      where: { id, userId: session.userId },
      include: {
        dailyPlans: {
          orderBy: { date: "asc" },
          include: { _count: { select: { trades: true } } },
        },
      },
    });

    if (!analysis) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Fetch weekly analysis error:", error);
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

    const analysis = await prisma.weeklyAnalysis.updateMany({
      where: { id, userId: session.userId },
      data: {
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

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Update weekly analysis error:", error);
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
    await prisma.weeklyAnalysis.deleteMany({
      where: { id, userId: session.userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete weekly analysis error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
