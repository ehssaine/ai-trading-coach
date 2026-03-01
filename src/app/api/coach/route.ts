import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// ── Coach Response Generator ─────────────────────────────────────────

interface CoachResponse {
  content: string;
  context: string;
}

function generateCoachResponse(userMessage: string): CoachResponse {
  const msg = userMessage.toLowerCase();

  // ── Loss / Lost ────────────────────────────────────────────────────
  if (msg.includes("loss") || msg.includes("lost") || msg.includes("losing")) {
    const responses = [
      {
        content:
          "Every loss is a data point, not a death sentence. The market is giving you feedback -- let's reframe this. Instead of thinking 'I lost money,' try 'I paid tuition for a valuable lesson.' Now, what did the price action actually tell you before entry? Was your stop placement respecting structure, or were you fighting the HTF bias? I'd recommend a Reframing session right now -- take 10 minutes to write down what this loss taught you, then visualize yourself executing the correct version of this trade. Losses only compound when we let them live rent-free in our heads.",
        context: "loss_reframing",
      },
      {
        content:
          "I hear you. Losses sting, and pretending they don't would be dishonest. But here's what separates profitable traders from the rest: they process the loss, extract the lesson, and move forward without emotional baggage. Let's do an NLP Reframing exercise. Close your eyes and replay the trade -- but this time, zoom out. See it as one trade among thousands in your career. Does this single loss define you? No. Now, visualize the disciplined version of yourself reviewing the chart calmly, identifying the mistake, and journaling it. That's who you're becoming. Try logging a Reframing session after this.",
        context: "loss_reframing",
      },
      {
        content:
          "Losses are the cost of doing business in this game. The key question isn't 'why did I lose?' -- it's 'did I follow my plan?' If yes, then the loss is simply variance. If no, then we need to address the process breakdown. I want you to try a Visualization exercise: picture yourself at your trading desk tomorrow, calm and composed, executing only A+ setups that align with your HTF bias. See the patience, feel the discipline. This mental rehearsal rewires your neural pathways over time. Also, make sure you're logging this trade in your journal -- pattern recognition from losses is where the real edge lives.",
        context: "loss_visualization",
      },
      {
        content:
          "Let's separate signal from noise here. One loss means nothing statistically. But how you respond to it means everything psychologically. Here's what I want you to do: pull up your journal, find your last 10 trades, and look at the data objectively. What's your actual win rate? What's your average R? I bet the numbers tell a different story than your emotions right now. After that, do a quick Dialogue session -- have a conversation with your 'inner trader' about what discipline looks like. Sometimes we need to coach ourselves through the emotional fog to see the structural clarity on the other side.",
        context: "loss_dialogue",
      },
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // ── FOMO / Fear of Missing Out ─────────────────────────────────────
  if (msg.includes("fomo") || msg.includes("fear of missing") || msg.includes("missed the move")) {
    const responses = [
      {
        content:
          "FOMO is one of the deadliest emotions in trading. When you see a move happening without you, your amygdala fires up and screams 'GET IN NOW!' But that's not your trading plan speaking -- that's your lizard brain. The market will always present another opportunity. Always. There's no such thing as the 'last good trade.' Try this Anchoring technique: recall a time when you waited patiently for your setup and it paid off beautifully. Press your thumb and forefinger together while reliving that feeling of disciplined patience. Use that anchor next time FOMO hits.",
        context: "fomo_anchoring",
      },
      {
        content:
          "Let me be direct: chasing a move you missed is how accounts blow up. The entry you wanted is gone -- the risk/reward has shifted, the structure has changed, and you'd be entering someone else's trade, not yours. Here's a Visualization exercise for you: close your eyes and see the market as an ocean. Waves come and go endlessly. You missed this wave? Another one is forming right now. See yourself sitting on the shore, calm and patient, waiting for YOUR wave. This is the mindset of a consistently profitable trader. The market doesn't care about your FOMO, but your account does.",
        context: "fomo_visualization",
      },
      {
        content:
          "FOMO is really just a scarcity mindset in disguise. It's the belief that opportunities are limited. But in an ICT/SMC framework, we know that liquidity sweeps, FVGs, and order block retests happen every single session. Your setup will come back. Try an Incantations exercise: repeat to yourself 'I only take trades that align with my plan. I am patient. I am disciplined. The market rewards patience.' Say it with conviction, feel it in your body. Rewiring your subconscious beliefs around abundance in the market is how you kill FOMO permanently.",
        context: "fomo_incantations",
      },
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // ── Revenge / Anger / Frustration ──────────────────────────────────
  if (
    msg.includes("revenge") ||
    msg.includes("angry") ||
    msg.includes("frustrated") ||
    msg.includes("mad") ||
    msg.includes("pissed")
  ) {
    const responses = [
      {
        content:
          "Stop. Step away from the charts right now. Revenge trading is the fastest path to account destruction. I know you're feeling the heat, but executing another trade from this emotional state is like driving angry -- you're going to crash. Here's what I need you to do: Anchoring exercise. Take 5 deep breaths. On each inhale, count to 4. On each exhale, count to 6. While breathing, press your thumb and forefinger together and recall a moment of pure calm and clarity. Do this for 2 minutes. Then, and only then, ask yourself: 'Would I take this trade if I had zero positions and a fresh mind?' If the answer isn't an emphatic yes, close the platform.",
        context: "revenge_anchoring",
      },
      {
        content:
          "Frustration is a signal, not a command. It's telling you something is off -- maybe your expectations are misaligned with reality, or maybe you're overtrading. Either way, the worst thing you can do right now is trade. The market is an ATM for disciplined traders and a shredder for emotional ones. Try this: do a 10-minute Reframing session. Write down exactly what happened and why you're frustrated. Then rewrite the narrative -- not as a victim of the market, but as a student learning a lesson. Shift from 'the market took my money' to 'I identified a gap in my execution that I can now fix.' That reframe changes everything.",
        context: "revenge_reframing",
      },
      {
        content:
          "I can feel the frustration in your message, and I respect that you're reaching out instead of just firing off another trade. That shows self-awareness, which is a massive edge in this game. Here's the reality: the market doesn't know you exist. It's not punishing you personally. Your frustration is your ego responding to a perceived attack on your competence. Let's do a Swish Pattern: visualize the frustrated version of yourself -- the one reaching for the mouse to enter a revenge trade. Now swish that image away and replace it with the composed, methodical version of you who reviews the chart, identifies the error, and walks away. Do this 5 times rapidly. Then journal what triggered this emotion.",
        context: "revenge_swish",
      },
      {
        content:
          "Frustration and anger in trading almost always come from one place: unmet expectations. You expected the trade to work, the market had other plans, and now your ego is bruised. I get it. But here's the truth -- the best traders in the world have losing streaks. What they don't do is let those streaks turn into account-destroying revenge spirals. Right now, I want you to do box breathing: 4 seconds in, 4 seconds hold, 4 seconds out, 4 seconds hold. Repeat 6 times. Then try an Anchoring exercise to lock in a state of calm detachment. You can trade again tomorrow with a clear head and a fresh plan.",
        context: "revenge_anchoring",
      },
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // ── Greed / Moving Stops ───────────────────────────────────────────
  if (
    msg.includes("greed") ||
    msg.includes("greedy") ||
    msg.includes("move stop") ||
    msg.includes("move my stop") ||
    msg.includes("widen stop") ||
    msg.includes("bigger position")
  ) {
    const responses = [
      {
        content:
          "Greed is the silent killer of trading accounts. It whispers 'just a little more' while slowly eroding your edge. If you're thinking about moving your stop loss further away, ask yourself: has the market structure changed to justify this, or are you just hoping? Hope is not a strategy. Your stop loss was placed based on your analysis -- trust it. Try a Dialogue session: have an honest conversation with yourself about why you want to deviate from the plan. Write down the greedy voice and the disciplined voice. Which one has served you better historically? The numbers don't lie.",
        context: "greed_dialogue",
      },
      {
        content:
          "Let me share something with you: the most successful traders I've modeled don't focus on maximizing each individual trade. They focus on executing their edge consistently over hundreds of trades. Moving your stop or oversizing because 'this one feels like a winner' is exactly how you turn a winning system into a losing one. Use a Modeling technique here -- think about the trader you aspire to be. Would that person move their stop based on a feeling? Would they double their risk because of excitement? Be that trader now. Discipline in the moment of temptation is what separates the professionals from the amateurs.",
        context: "greed_modeling",
      },
      {
        content:
          "Your risk management is your lifeline. It's non-negotiable. Every pip you move that stop is a pip you're donating to the market's randomness. Here's the framework I use: before the trade, you're the planner -- logical, calculated, data-driven. During the trade, you're the executor -- you follow the plan, period. Greed tries to make you the planner AND executor simultaneously, and that's when mistakes happen. Do a Visualization exercise: see yourself executing the trade exactly as planned, taking profit at your target, accepting the result regardless. Feel the satisfaction of discipline. That's the feeling we're optimizing for, not the dopamine of a bigger win.",
        context: "greed_visualization",
      },
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // ── Winning / Overconfidence ───────────────────────────────────────
  if (
    msg.includes("win") ||
    msg.includes("winning") ||
    msg.includes("streak") ||
    msg.includes("on fire") ||
    msg.includes("crushing it")
  ) {
    const responses = [
      {
        content:
          "Congratulations on the wins -- but this is actually one of the most dangerous moments in trading. After a winning streak, your brain releases dopamine and starts whispering 'you've figured it out, go bigger.' Overconfidence leads to oversizing, overtrading, and giving back all your gains. The market humbles everyone. Stay grounded. Try this Anchoring exercise: before your next trade, anchor the feeling of disciplined calm -- not the excitement of winning. Press your thumb and forefinger together while recalling a time you felt composed and methodical. Trade from that state, not from euphoria. Your process got you here; trust it, don't abandon it.",
        context: "overconfidence_anchoring",
      },
      {
        content:
          "I love the energy, but let me be the voice of reason here. Winning streaks end. Always. The question is whether you'll be positioned to survive when the streak breaks. Are you sticking to your risk per trade? Are you still waiting for A+ setups aligned with your HTF bias, or are you starting to take B and C setups because 'everything is working'? Do a Mirroring exercise: observe yourself from a third-person perspective. Is this trader following the same disciplined process that created the streak, or is this trader starting to get loose? Honest self-observation is the antidote to overconfidence. Keep journaling every trade, especially now.",
        context: "overconfidence_mirroring",
      },
      {
        content:
          "Nice work! But here's the paradox of trading: the better things go, the more vigilant you need to be. A winning streak can create a false sense of invincibility that leads to the exact behaviors that destroy accounts -- oversizing, skipping analysis, trading outside your plan. I want you to treat each new trade as if your winning streak doesn't exist. Fresh analysis, fresh bias, fresh risk management. Try a Visualization session where you see yourself continuing to execute with the same precision and discipline regardless of recent results. The goal isn't to ride the high -- it's to maintain the process that creates consistent results over time.",
        context: "overconfidence_visualization",
      },
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // ── Trade Plan ─────────────────────────────────────────────────────
  if (
    msg.includes("plan") ||
    msg.includes("trade plan") ||
    msg.includes("checklist") ||
    msg.includes("routine") ||
    msg.includes("process")
  ) {
    const responses = [
      {
        content:
          "A trade plan is your contract with yourself. Every time you honor it, you build the neural pathways of discipline. Every time you break it, you strengthen the pathways of impulsivity. Here's what a solid pre-trade checklist should include: 1) HTF bias confirmed on weekly/daily? 2) Daily structure aligned with bias? 3) Clear POI identified (order block, FVG, liquidity level)? 4) Risk defined (stop loss, position size, max risk %)? 5) R:R minimum 2:1? 6) No conflicting news events? If any answer is 'no,' you don't trade. Try an Incantations exercise: before each session, repeat your rules out loud with conviction. 'I only trade A+ setups. I follow my plan. I am disciplined.' This programs your subconscious for execution.",
        context: "plan_incantations",
      },
      {
        content:
          "The fact that you're thinking about your plan tells me you're on the right track. Most struggling traders don't have a plan at all -- they have hopes and feelings. Your plan should be specific enough that someone else could execute it. Can you describe your entry criteria in 3 sentences? If not, it's too vague. Here's a Visualization technique: every morning before markets open, spend 5 minutes visualizing yourself going through your complete routine -- analysis, bias confirmation, setup identification, and most importantly, the moment where a trade doesn't meet your criteria and you walk away. Visualize the patience. That's where the real edge lives. Make sure you're using the Daily Plan feature here to document your bias and key levels every single day.",
        context: "plan_visualization",
      },
      {
        content:
          "Your trading plan is the foundation that everything else is built on. Without it, you're gambling with a chart open. Let me help you structure it. Start with your weekly HTF analysis -- what's the bias? Then drill down to the daily structure. Is price at a premium or discount? Where are the key levels? Only after this top-down analysis should you even think about entries. Use the Modeling technique here: study how institutional traders approach the market. They have rigid frameworks. They don't 'feel' their way into trades. Build your pre-market routine as a habit in the Habits tracker -- make it non-negotiable. Over time, this routine becomes automatic, and that's when consistency shows up in your results.",
        context: "plan_modeling",
      },
      {
        content:
          "Sticking to the plan is where 90% of traders fail. They have the plan, they know the rules, but in the heat of the moment, emotion overrides logic. This is exactly where NLP shines. Build a pre-trade Anchoring ritual: before you sit down at the charts, trigger your calm, focused state. Then go through your checklist mechanically. No trade that doesn't check every box. After the session, do a post-trade review -- not just the P&L, but did you follow the process? Rate your discipline separately from the outcome. A losing trade executed perfectly is a better trade than a winner taken on impulse. Use the habits feature to track your plan adherence daily.",
        context: "plan_anchoring",
      },
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // ── Gold / Silver / Commodities ────────────────────────────────────
  if (
    msg.includes("gold") ||
    msg.includes("silver") ||
    msg.includes("xauusd") ||
    msg.includes("xagusd") ||
    msg.includes("commodity") ||
    msg.includes("commodities")
  ) {
    const responses = [
      {
        content:
          "Gold and silver are beautiful instruments, but they demand respect. XAUUSD can move 200-300 pips in a single session, so your risk management needs to be airtight. Here's my framework for precious metals: always start with the weekly structure. Where's the last break of structure? Where are the unmitigated order blocks? Gold tends to respect HTF levels with impressive precision. For your daily plan, mark the Asian session high and low -- these often become liquidity targets during London. And here's an NLP tip: before trading gold, do an Anchoring exercise for patience. Gold will test your resolve with its volatility -- you need to be in a calm, detached state before engaging. Size down if needed; there's no shame in trading smaller to maintain emotional control.",
        context: "commodity_anchoring",
      },
      {
        content:
          "Trading precious metals requires a specific mindset. The pip values are different, the volatility is higher, and the liquidity pools can be deceptive. For XAUUSD specifically, pay close attention to DXY (Dollar Index) correlation -- when the dollar weakens, gold typically strengthens. Also watch real yields and the bond market for macro confluence. On the technical side, gold respects ICT concepts beautifully -- weekly FVGs often get filled, order blocks hold as support/resistance, and the Asian session range is a goldmine (pun intended) for liquidity sweeps. Use Visualization to rehearse your gold trading process -- see yourself patiently waiting for price to sweep a key level before entering. Gold punishes impatience more than any other instrument.",
        context: "commodity_visualization",
      },
      {
        content:
          "When it comes to gold and silver trading, the number one mistake I see is overleveraging. These instruments have wide ranges, and what looks like a small stop on the chart can be significant in dollar terms. Always calculate your position size based on the dollar risk, not the pip distance. For silver (XAGUSD), add extra caution -- it's even more volatile than gold and can gap significantly. My suggestion: create a specific habit in your Habits tracker for 'Pre-Gold Trade Risk Check' where you verify position size, confirm HTF alignment, and check DXY before every gold trade. Use an Incantations exercise: 'I respect gold's volatility. I size appropriately. I wait for my level.' Discipline with commodities is worth its weight in, well, gold.",
        context: "commodity_incantations",
      },
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // ── Fear / Anxiety / Scared ────────────────────────────────────────
  if (
    msg.includes("scared") ||
    msg.includes("afraid") ||
    msg.includes("anxious") ||
    msg.includes("anxiety") ||
    msg.includes("nervous") ||
    msg.includes("fear")
  ) {
    const responses = [
      {
        content:
          "Fear in trading often comes from one of two places: either you're risking more than you're comfortable with, or you don't fully trust your analysis. Let's address both. First, are you truly risking only 1-2% per trade? If losing this trade would materially affect your account or your emotional state, you're too big. Size down until the loss feels like nothing. Second, do you have a documented edge? If yes, trust the probabilities. Try this Anchoring technique right now: take 3 deep breaths, recall a moment when you felt completely confident and in control -- maybe a trade that played out perfectly. Press your thumb and forefinger together. Hold that state. That's your pre-trade anchor. Use it before every entry.",
        context: "fear_anchoring",
      },
      {
        content:
          "Anxiety before trading is actually more common than most traders admit. It's your nervous system's way of saying 'this matters.' But when anxiety becomes paralyzing, it prevents you from executing valid setups. Here's a powerful Visualization exercise: sit comfortably, close your eyes, and visualize your entire trading process from start to finish. See yourself analyzing the chart calmly, identifying a setup, placing the order with steady hands, setting your stop and target, and then walking away. See the trade hit your stop -- and watch yourself respond with complete calm. See the trade hit your target -- same calm response. When you can visualize both outcomes with equanimity, you've found the right mental state for trading.",
        context: "fear_visualization",
      },
      {
        content:
          "Being nervous about trading tells me you care about doing it right, which is actually a good starting point. The goal isn't to eliminate fear -- it's to transform it from a paralyzing force into a sharpening one. Some practical steps: reduce your position size until the fear subsides. Trade on a demo account for a week if needed -- there's no shame in it. Build your confidence through repetition with small size. And here's an NLP approach: do an Incantations exercise every morning. 'I am a competent trader. My analysis is sound. I accept both wins and losses as part of my edge playing out over time. I am calm, focused, and disciplined.' Say it like you mean it. Over time, your subconscious will begin to believe it, and the fear will transform into focused awareness.",
        context: "fear_incantations",
      },
      {
        content:
          "Let's get to the root of this fear. Is it fear of losing money? Fear of being wrong? Fear of missing out? Each has a different solution. For fear of loss: shrink your risk until the trade feels insignificant. For fear of being wrong: reframe 'wrong' as 'one iteration in a probability game.' For fear of missing out: remind yourself that the market opens every day with new opportunities. Try a Swish Pattern: see the fearful, hesitant version of yourself about to avoid a valid trade. Now rapidly replace that image with the confident, decisive version who executes the plan without hesitation. Flash between the two images 5 times, ending on the confident version. Then try journaling about what specifically triggers the fear -- awareness is the first step to transformation.",
        context: "fear_swish",
      },
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // ── Default: General Trading Wisdom ────────────────────────────────
  const defaultResponses = [
    {
      content:
        "Great that you're engaging with your trading development. Remember, the market rewards consistency over brilliance. Focus on executing your edge repeatedly rather than chasing the perfect trade. Here's something powerful: try starting each trading day with a 5-minute Visualization session. See yourself going through your complete process -- analysis, bias confirmation, patient waiting, disciplined entry, and accepting the result either way. This mental rehearsal creates neural pathways for discipline that compound over time. Also, make sure you're using your Daily Plan and journaling every trade. The data you collect now is the foundation for your future edge refinement.",
      context: "general_visualization",
    },
    {
      content:
        "Trading is as much a mental game as it is a technical one. You can have the best strategy in the world, but if your psychology isn't right, you'll sabotage yourself. That's why combining ICT/SMC technical analysis with NLP techniques gives you a massive edge. My recommendation: build a daily routine that includes pre-market analysis (HTF bias, key levels, daily plan), a brief NLP session (even 5 minutes of Anchoring or Incantations), and a post-session review. Track this routine in your Habits -- consistency here is what separates the dreamers from the earners. What specific area of your trading do you want to work on today?",
      context: "general_routine",
    },
    {
      content:
        "Here's a truth about trading that most people overlook: the best trades often feel boring. They're methodical, planned, and executed without drama. If your trading feels exciting, you might be gambling. Excitement usually means you're oversized, chasing, or trading outside your plan. Try a Modeling exercise: study the habits of consistently profitable traders. What do they all have in common? Patience, discipline, risk management, and a systematic approach. They treat trading like a business, not a casino. Use the tools in this app -- journal your trades, track your habits, do your NLP sessions, and review your data weekly. The compound effect of daily discipline is where the magic happens.",
      context: "general_modeling",
    },
    {
      content:
        "The biggest edge in trading isn't a secret indicator or a magic entry -- it's self-awareness. Knowing your emotional triggers, your cognitive biases, and your typical mistake patterns is more valuable than any technical setup. That's where NLP becomes a superpower for traders. Start with a Dialogue exercise: have an honest internal conversation about your trading. What patterns keep repeating? Where do you deviate from your plan? What emotions drive those deviations? Write it all down. Then use targeted NLP techniques to address each pattern -- Reframing for losses, Anchoring for emotional control, Visualization for execution, Swish for breaking bad habits. You have all the tools. The question is: will you use them consistently? Track your NLP sessions and watch how your trading transforms over 30 days.",
      context: "general_dialogue",
    },
    {
      content:
        "Let me share something important: the traders who make it long-term are the ones who fall in love with the process, not the profits. Profits are a byproduct of consistent execution. If you're focused on money, every loss will feel like a personal attack and every win will inflate your ego. Instead, focus on these metrics: Did I follow my plan? Did I respect my risk management? Did I wait for my setup? These are the inputs you can control. Use the Incantations technique to reinforce this mindset: 'I am process-oriented. I measure my success by my discipline, not my P&L. Every day I follow my plan, I am winning regardless of the outcome.' Repeat this daily and watch your relationship with trading transform.",
      context: "general_incantations",
    },
  ];

  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
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

    // Generate coach response
    const response = generateCoachResponse(content);

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
