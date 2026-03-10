import { NextResponse } from "next/server";
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

const SYSTEM_PROMPT = `You are a senior FX macro strategist. Analyse the SINGLE MOST POWERFUL DRIVER of EUR/USD: the Fed vs ECB monetary policy divergence. Use your most current knowledge (approximately March 2026) to assess:
* Current Fed Funds Rate and ECB Deposit Rate
* Fed forward guidance and dot plot implied path
* ECB forward guidance and market-implied rate path
* Relative hawkishness/dovishness gap
* Policy cycle asymmetry

Return ONLY valid JSON — no markdown, no code fences, no extra text — in this exact structure:
{
  "fed": {
    "current_rate": "e.g. 4.25-4.50%",
    "stance": "HAWKISH|NEUTRAL|DOVISH",
    "next_move": "CUT|HOLD|HIKE",
    "cuts_expected_2025": "e.g. 2 cuts of 25bps",
    "key_signal": "most recent decisive signal from Fed",
    "score": <0-100, 100 = maximally hawkish>
  },
  "ecb": {
    "current_rate": "e.g. 2.50%",
    "stance": "HAWKISH|NEUTRAL|DOVISH",
    "next_move": "CUT|HOLD|HIKE",
    "cuts_expected_2025": "e.g. 3 cuts",
    "key_signal": "most recent decisive signal from ECB",
    "score": <0-100, 100 = maximally hawkish>
  },
  "divergence_spread": <Fed score minus ECB score, can be negative>,
  "divergence_direction": "USD_ADVANTAGE|EUR_ADVANTAGE|CONVERGING",
  "signal": "BEARISH|BULLISH|NEUTRAL",
  "signal_strength": "STRONG|MODERATE|WEAK",
  "deep_analysis": "4-5 sentences analysing the policy gap, forward path, and what it means for EUR/USD rate dynamics. Include specific data points.",
  "trading_implication": "3-4 sentences on how to position EUR/USD based on this divergence, including key catalysts to watch and potential inflection points.",
  "catalyst_to_watch": "Single most important upcoming event that could shift this divergence"
}

Be precise with rates and data. Return ONLY the JSON.`;

// ── POST: Generate EUR/USD Fundamental Analysis ──────────────────────

export async function POST() {
  try {
    await requireAuth();

    const client = getAnthropicClient();
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Analyse the current Fed vs ECB monetary policy divergence and its impact on EUR/USD. Today's date is ${new Date().toISOString().split("T")[0]}.`,
        },
      ],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { error: "Failed to generate analysis" },
        { status: 500 }
      );
    }

    if (response.stop_reason !== "end_turn") {
      console.error("AI response was truncated. stop_reason:", response.stop_reason);
      return NextResponse.json(
        { error: "AI response was cut off. Please try again." },
        { status: 500 }
      );
    }

    let analysis;
    try {
      const cleaned = textBlock.text.replace(/```json?\s*/g, "").replace(/```\s*/g, "").trim();
      analysis = JSON.parse(cleaned);
    } catch (parseError) {
      const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          analysis = JSON.parse(jsonMatch[0]);
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
      analysis,
      generatedAt: new Date().toISOString(),
    }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes("ANTHROPIC_API_KEY")) {
      return NextResponse.json(
        { error: "AI analysis is not configured. Please set ANTHROPIC_API_KEY." },
        { status: 503 }
      );
    }
    console.error("EUR/USD analysis error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
