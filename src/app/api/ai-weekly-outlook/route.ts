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

// ── Fetch live spot prices ───────────────────────────────────────────

interface SpotPrices {
  gold: number | null;
  silver: number | null;
}

async function fetchSpotPrices(): Promise<SpotPrices> {
  const result: SpotPrices = { gold: null, silver: null };

  // Try metals.dev (free, no auth)
  try {
    const res = await fetch("https://api.metals.dev/v1/latest?api_key=demo&currency=USD&unit=toz", {
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.metals?.gold) result.gold = data.metals.gold;
      if (data.metals?.silver) result.silver = data.metals.silver;
      if (result.gold && result.silver) return result;
    }
  } catch { /* fallback below */ }

  // Fallback: metals.live (free, no auth)
  try {
    const res = await fetch("https://api.metals.live/v1/spot", {
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        for (const item of data) {
          if (item.gold && !result.gold) result.gold = item.gold;
          if (item.silver && !result.silver) result.silver = item.silver;
        }
      }
    }
  } catch { /* continue with whatever we have */ }

  return result;
}

// ── System prompt ───────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert gold (XAUUSD) and silver (XAGUSD) market analyst. Respond ONLY with a valid JSON object — no markdown, no code fences, no extra text.

CRITICAL RULES:
- Keep all string values SHORT (1-2 sentences max). Keep arrays to 2-3 items max.
- The user will provide REAL-TIME spot prices. You MUST base ALL technical levels around these actual prices. Do NOT invent prices from memory.
- Support levels must be BELOW the current price. Resistance levels must be ABOVE the current price.
- Round levels to the nearest $5-$10 for gold, $0.25-$0.50 for silver.

JSON structure:
{"weekLabel":"Mar 10-14, 2025","goldOutlook":{"bias":"BULLISH","currentContext":"Short context.","fundamentalDrivers":[{"factor":"Name","impact":"BULLISH","detail":"Short detail."}],"keyEventsThisWeek":[{"event":"Name","date":"Day","expectedImpact":"Short impact."}],"technicalLevels":{"weeklySupport":["2850","2820"],"weeklyResistance":["2920","2950"],"keyZones":"Short description of OBs/FVGs."},"scenarioBullish":"Short bull case.","scenarioBearish":"Short bear case."},"silverOutlook":{"bias":"BULLISH","currentContext":"Short context.","keyDrivers":"Short drivers.","technicalLevels":{"weeklySupport":["31.50","31.00"],"weeklyResistance":["33.00","33.50"]}},"macroEnvironment":{"dollarOutlook":"Short.","yieldsOutlook":"Short.","riskSentiment":"Short.","inflationContext":"Short."},"tradingPlan":{"preferredDirection":"LONG","entryConditions":"Short conditions.","riskWarnings":["Warning 1","Warning 2"],"weeklyAdvice":"Short advice."}}

Rules:
- bias: "BULLISH", "BEARISH", or "NEUTRAL"
- preferredDirection: "LONG", "SHORT", or "WAIT"
- fundamentalDrivers: max 4 items
- keyEventsThisWeek: max 4 items
- riskWarnings: max 3 items
- Be specific and actionable`;

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

    // Fetch real-time spot prices
    const spotPrices = await fetchSpotPrices();

    let priceContext = "";
    if (spotPrices.gold || spotPrices.silver) {
      priceContext = `\n\nREAL-TIME SPOT PRICES (use these as the basis for ALL technical levels):`;
      if (spotPrices.gold) priceContext += `\n- Gold (XAUUSD): $${spotPrices.gold.toFixed(2)}/oz`;
      if (spotPrices.silver) priceContext += `\n- Silver (XAGUSD): $${spotPrices.silver.toFixed(2)}/oz`;
      priceContext += `\nSupport levels MUST be below these prices. Resistance levels MUST be above these prices.`;
    }

    const client = getAnthropicClient();
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Generate a weekly market outlook for the week of ${weekLabel}. Today's date is ${new Date().toISOString().split("T")[0]}.${priceContext}${userContext}`,
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

    // Check if the response was truncated (stop_reason !== "end_turn")
    if (response.stop_reason !== "end_turn") {
      console.error("AI response was truncated. stop_reason:", response.stop_reason);
      return NextResponse.json(
        { error: "AI response was cut off. Please try again." },
        { status: 500 }
      );
    }

    let outlook;
    try {
      // Strip any markdown fences if present
      const cleaned = textBlock.text.replace(/```json?\s*/g, "").replace(/```\s*/g, "").trim();
      outlook = JSON.parse(cleaned);
    } catch (parseError) {
      // Try to extract JSON object from the response
      const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          outlook = JSON.parse(jsonMatch[0]);
        } catch {
          console.error("Failed to parse extracted JSON:", parseError);
          return NextResponse.json(
            { error: "Failed to parse AI analysis. Please try again." },
            { status: 500 }
          );
        }
      } else {
        console.error("No JSON found in AI response:", textBlock.text.substring(0, 200));
        return NextResponse.json(
          { error: "Failed to parse AI analysis. Please try again." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      outlook,
      weekStart,
      spotPrices: {
        gold: spotPrices.gold,
        silver: spotPrices.silver,
        fetchedAt: new Date().toISOString(),
      },
    }, { status: 200 });
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
