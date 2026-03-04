import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";

// ── Claude Client ───────────────────────────────────────────────────

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are an elite AI Trading Coach with 20 years of experience specializing in gold (XAUUSD) and silver (XAGUSD) markets. You use ICT (Inner Circle Trader) and SMC (Smart Money Concepts) methodology.

Your expertise includes:
- Trading psychology and emotional management
- NLP (Neuro-Linguistic Programming) techniques for traders: Anchoring, Reframing, Swish Pattern, Visualization, Modeling, Mirroring, Incantations, and Dialogue
- ICT/SMC concepts: order blocks, fair value gaps (FVGs), liquidity sweeps, break of structure (BOS), change of character (CHoCH), premium/discount zones
- Risk management and position sizing
- Pre-trade routines and checklists
- Journal review and pattern recognition

Your coaching style:
- Direct, honest, and supportive — never sugarcoating but always constructive
- You reference specific NLP techniques and recommend exercises
- You connect emotional states to trading behaviors
- You emphasize process over outcomes
- You recommend using the app's features: Daily Plans, Journal, Habits tracker, NLP sessions, and AI Analyzer
- Keep responses focused and actionable (2-4 paragraphs max)
- When a trader shares emotions (fear, FOMO, revenge, greed), address the psychology first before any technical advice

Important: You are NOT a financial advisor. You do not give specific trade signals or tell traders to buy/sell. You coach on psychology, discipline, and process.`;

// ── Generate response via Claude ────────────────────────────────────

async function generateCoachResponse(
  userMessage: string,
  conversationHistory: { role: string; content: string }[]
): Promise<{ content: string; context: string }> {
  // Build messages from recent history (last 20 messages for context)
  const recentHistory = conversationHistory.slice(-20);
  const messages: { role: "user" | "assistant"; content: string }[] = recentHistory.map((m) => ({
    role: m.role === "USER" ? ("user" as const) : ("assistant" as const),
    content: m.content,
  }));

  // Add the current user message
  messages.push({ role: "user", content: userMessage });

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages,
  });

  const textBlock = response.content.find((block) => block.type === "text");
  const content = textBlock ? textBlock.text : "I understand. Let me think about that and provide my best coaching advice.";

  // Derive context from the message for categorization
  const msg = userMessage.toLowerCase();
  let context = "general";
  if (msg.includes("loss") || msg.includes("lost") || msg.includes("losing")) context = "loss_coaching";
  else if (msg.includes("fomo") || msg.includes("fear of missing")) context = "fomo_coaching";
  else if (msg.includes("revenge") || msg.includes("angry") || msg.includes("frustrated")) context = "revenge_coaching";
  else if (msg.includes("greed") || msg.includes("move stop")) context = "greed_coaching";
  else if (msg.includes("win") || msg.includes("streak")) context = "overconfidence_coaching";
  else if (msg.includes("plan") || msg.includes("checklist") || msg.includes("routine")) context = "plan_coaching";
  else if (msg.includes("gold") || msg.includes("silver") || msg.includes("xauusd")) context = "commodity_coaching";
  else if (msg.includes("scared") || msg.includes("anxious") || msg.includes("fear")) context = "fear_coaching";

  return { content, context };
}

// ── GET: Conversation History ────────────────────────────────────────

export async function GET() {
  try {
    const { userId } = await requireAuth();

    const messages = await prisma.coachMessage.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      take: 50,
    });

    return NextResponse.json({ messages });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Fetch coach messages error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ── POST: Send Message to Coach ──────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAuth();

    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "content is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    // Save user message
    const userMessage = await prisma.coachMessage.create({
      data: {
        userId,
        role: "USER",
        content: content.trim(),
      },
    });

    // Fetch recent conversation history for context
    const history = await prisma.coachMessage.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      take: 20,
      select: { role: true, content: true },
    });

    // Generate coach response via Claude
    const response = await generateCoachResponse(content.trim(), history);

    // Save coach response
    const coachMessage = await prisma.coachMessage.create({
      data: {
        userId,
        role: "COACH",
        content: response.content,
        context: response.context,
      },
    });

    // Add 2 points for engaging with the coach
    const profile = await prisma.gamificationProfile.upsert({
      where: { userId },
      create: {
        userId,
        totalPoints: 2,
      },
      update: {
        totalPoints: { increment: 2 },
      },
    });

    // Update level based on total points
    const newLevel = Math.floor(profile.totalPoints / 100) + 1;
    if (newLevel !== profile.level) {
      await prisma.gamificationProfile.update({
        where: { userId },
        data: { level: newLevel },
      });
    }

    return NextResponse.json(
      {
        userMessage,
        coachMessage,
        pointsEarned: 2,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Coach message error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
