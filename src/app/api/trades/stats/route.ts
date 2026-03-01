import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const trades = await prisma.trade.findMany({
      where: { userId: session.userId },
    });

    const closedTrades = trades.filter((t) => t.status !== "OPEN" && t.status !== "CANCELLED");
    const wins = closedTrades.filter((t) => t.status === "CLOSED_WIN");
    const losses = closedTrades.filter((t) => t.status === "CLOSED_LOSS");
    const breakeven = closedTrades.filter((t) => t.status === "CLOSED_BE");
    const alignedTrades = closedTrades.filter((t) => t.alignedWithHTF);
    const counterTrades = closedTrades.filter((t) => !t.alignedWithHTF);
    const alignedWins = alignedTrades.filter((t) => t.status === "CLOSED_WIN");
    const counterWins = counterTrades.filter((t) => t.status === "CLOSED_WIN");

    const totalPnl = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const avgRR = closedTrades.length > 0
      ? closedTrades.reduce((sum, t) => sum + t.riskRewardRatio, 0) / closedTrades.length
      : 0;

    // Discipline score: percentage of trades aligned with HTF bias
    const disciplineScore = closedTrades.length > 0
      ? Math.round((alignedTrades.length / closedTrades.length) * 100)
      : 100;

    // Win rate for aligned vs counter trades
    const alignedWinRate = alignedTrades.length > 0
      ? Math.round((alignedWins.length / alignedTrades.length) * 100)
      : 0;
    const counterWinRate = counterTrades.length > 0
      ? Math.round((counterWins.length / counterTrades.length) * 100)
      : 0;

    const stats = {
      totalTrades: closedTrades.length,
      openTrades: trades.filter((t) => t.status === "OPEN").length,
      wins: wins.length,
      losses: losses.length,
      breakeven: breakeven.length,
      winRate: closedTrades.length > 0 ? Math.round((wins.length / closedTrades.length) * 100) : 0,
      totalPnl: Math.round(totalPnl * 100) / 100,
      avgRiskReward: Math.round(avgRR * 100) / 100,
      disciplineScore,
      alignedTrades: alignedTrades.length,
      counterTrades: counterTrades.length,
      alignedWinRate,
      counterWinRate,
      // Prove to the trader that counter-HTF trades are bad
      alignedPnl: Math.round(alignedTrades.reduce((s, t) => s + (t.pnl || 0), 0) * 100) / 100,
      counterPnl: Math.round(counterTrades.reduce((s, t) => s + (t.pnl || 0), 0) * 100) / 100,
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Fetch stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
