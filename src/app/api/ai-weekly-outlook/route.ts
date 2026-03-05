import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";

// ── Claude Client (lazy init) ───────────────────────────────────────

let anthropicClient: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY environment variable is not set");
  }
  if (!anthropicClient) {
    anthropicClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return anthropicClient;
}

const SYSTEM_PROMPT = `You are an expert gold (XAUUSD) and silver (XAGUSD) market analyst who combines fundamental analysis, macroeconomic factors, and ICT/SMC technical concepts.

When generating a weekly market outlook, you MUST respond with a valid JSON object (no markdown, no code fences) with this exact structure:

{
  "weekLabel": "March 10 - March 14, 2025",
  "goldOutlook": {
    "bias": "BULLISH" | "BEARISH" | "NEUTRAL",
    "currentContext": "2-3 sentences on where gold stands right now based on recent macro context",
    "fundamentalDrivers": [
      {"factor": "Factor Name", "impact": "BULLISH" | "BEARISH" | "NEUTRAL", "detail": "1-2 sentence explanation"}
    ],
    "keyEventsThisWeek": [
      {"event": "Event Name", "date": "Day of week", "expectedImpact": "Description of potential impact on gold"}
    ],
    "technicalLevels": {
      "weeklySupport": ["level1", "level2"],
      "weeklyResistance": ["level1", "level2"],
      "keyZones": "Description of important order blocks, FVGs, or liquidity pools on the weekly/daily chart"
    },
    "scenarioBullish": "What needs to happen for gold to rally this week",
    "scenarioBearish": "What needs to happen for gold to drop this week"
  },
  "silverOutlook": {
    "bias": "BULLISH" | "BEARISH" | "NEUTRAL",
    "currentContext": "2-3 sentences on silver's current position",
    "keyDrivers": "Key factors specific to silver (industrial demand, gold-silver ratio, etc.)",
    "technicalLevels": {
      "weeklySupport": ["level1", "level2"],
      "weeklyResistance": ["level1", "level2"]
    }
  },
  "macroEnvironment": {
    "dollarOutlook": "DXY/USD analysis and impact on metals",
    "yieldsOutlook": "Treasury yields context and impact",
    "riskSentiment": "Risk-on vs risk-off assessment",
    "inflationContext": "Current inflation narrative and impact on gold"
  },
  "tradingPlan": {
    "preferredDirection": "LONG" | "SHORT" | "WAIT",
    "entryConditions": "What ICT/SMC conditions to look for before entering",
    "riskWarnings": ["Warning 1", "Warning 2"],
    "weeklyAdvice": "One key piece of discipline/psychology advice for this week"
  }
}

Important guidelines:
- Base your analysis on well-known macro relationships: USD strength vs gold, real yields vs gold, inflation expectations, central bank policy, geopolitical risk premiums, seasonal patterns
- For technical levels, use realistic price ranges based on recent gold/silver market context
- Always include major scheduled economic events (FOMC, NFP, CPI, PPI, etc.) if they fall in the requested week
- Be specific and actionable — traders need concrete levels and scenarios
- The user will tell you the week they want analyzed`;

// ── POST: Generate AI Weekly Outlook ─────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAuth();

    const body = await request.json();
    const { weekStart } = body;

    if (!weekStart) {
      return NextResponse.json(
        { error: "weekStart date is required" },
        { status: 400 }
      );
    }

    const weekDate = new Date(weekStart);
    const weekEnd = new Date(weekDate);
    weekEnd.setDate(weekEnd.getDate() + 4);

    const weekLabel = `${weekDate.toLocaleDateString("en-US", { month: "long", day: "numeric" })} - ${weekEnd.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`;

    // Fetch user's recent trading history for personalized advice
    const recentTrades = await prisma.trade.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        pair: true,
        direction: true,
        status: true,
        pnl: true,
        emotionalState: true,
        setupType: true,
      },
    }).catch(() => []);

    const recentAnalyses = await prisma.weeklyAnalysis.findMany({
      where: { userId },
      orderBy: { weekStart: "desc" },
      take: 2,
      select: {
        htfBias: true,
        marketStructure: true,
        biasReasoning: true,
        weeklySupport: true,
        weeklyResistance: true,
      },
    }).catch(() => []);

    let userContext = "";
    if (recentTrades.length > 0) {
      const wins = recentTrades.filter((t) => t.status === "CLOSED_WIN").length;
      const losses = recentTrades.filter((t) => t.status === "CLOSED_LOSS").length;
      const pairs = [...new Set(recentTrades.map((t) => t.pair))].join(", ");
      userContext += `\n\nTrader context: Recently traded ${pairs}. Last 10 trades: ${wins}W/${losses}L.`;
    }
    if (recentAnalyses.length > 0) {
      const last = recentAnalyses[0];
      userContext += ` Previous week bias: ${last.htfBias}, structure: ${last.marketStructure}. Reasoning: "${last.biasReasoning}"`;
    }

    const client = getAnthropicClient();
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Generate a comprehensive weekly market outlook for the week of ${weekLabel}. Today's date is ${new Date().toISOString().split("T")[0]}.${userContext}`,
        },
      ],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { error: "Failed to generate outlook" },
        { status: 500 }
      );
    }

    let outlook;
    try {
      outlook = JSON.parse(textBlock.text);
    } catch {
      // Try to extract JSON from the response if it has extra text
      const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        outlook = JSON.parse(jsonMatch[0]);
      } else {
        console.error("Failed to parse AI response:", textBlock.text);
        return NextResponse.json(
          { error: "Failed to parse AI analysis" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ outlook, weekStart }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes("ANTHROPIC_API_KEY")) {
      console.error("AI Outlook error: ANTHROPIC_API_KEY is not configured");
      return NextResponse.json(
        { error: "AI outlook is not configured. Please set ANTHROPIC_API_KEY." },
        { status: 503 }
      );
    }
    console.error("AI weekly outlook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
