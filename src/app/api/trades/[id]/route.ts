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
    const trade = await prisma.trade.findFirst({
      where: { id, userId: session.userId },
      include: {
        dailyPlan: {
          include: {
            weeklyAnalysis: true,
          },
        },
      },
    });

    if (!trade) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ trade });
  } catch (error) {
    console.error("Fetch trade error:", error);
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

    const trade = await prisma.trade.updateMany({
      where: { id, userId: session.userId },
      data: {
        exitTime: data.exitTime ? new Date(data.exitTime) : undefined,
        exitPrice: data.exitPrice ?? undefined,
        status: data.status || undefined,
        pnl: data.pnl ?? undefined,
        pnlPercentage: data.pnlPercentage ?? undefined,
        exitReason: data.exitReason || undefined,
        mistakes: data.mistakes || undefined,
        lessonsLearned: data.lessonsLearned || undefined,
        emotionalState: data.emotionalState || undefined,
        rating: data.rating ?? undefined,
      },
    });

    return NextResponse.json({ trade });
  } catch (error) {
    console.error("Update trade error:", error);
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
    await prisma.trade.deleteMany({
      where: { id, userId: session.userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete trade error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
