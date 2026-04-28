import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const BRAINS_CONTEXT = `Brains is an independent creative agency and B-Corp.
Values: We Care for Each Other, We Do Good Work, We Look for Magic, We Spark Joy.
Markers of Excellence: Pivot with Purpose, Brave Ideas Bold Action, Speak Fluent Client, Work Out Loud, Enjoy the Ride.
2026 vision: Clarity — of vision, craft, role, process, and care.
Coaches not managers. Work is not your whole identity.`;

const PERSON_INSTRUCTIONS = `You are a coaching intelligence tool for Brains. You are given a team member's full profile.
Write a 4-5 sentence Click for Sparks that:
1. Opens with something insightful about how this person's personality profile shapes how they show up at work
2. Connects their strengths to where they may be thriving or struggling RIGHT NOW given their pulse + stress signals
3. Gives the coach 1-2 specific, practical suggestions grounded in Brains values
Sound warm, direct, human. No bullet points. No preamble. No hedging.`;

const ACTION_INSTRUCTIONS = `You are a coaching intelligence tool for Brains.
Write a SHORT (3-4 sentences), direct, human Click for Sparks. Sound like a thoughtful Brains leader.
No bullet points. No preamble.`;

const THEMES_INSTRUCTIONS = `You are analyzing open-text survey responses from a creative agency team.
Extract the top 5 themes. Return ONLY valid JSON — an array of objects with keys "theme" (short label, max 4 words), "count" (estimated number of responses touching this theme), and "insight" (one sharp sentence about what this signals). No markdown, no explanation, just the JSON array.`;

const FRAMEWORK_INSTRUCTIONS = `You are a senior leadership coach at Brains, an independent creative agency and B-Corp.
Based on the stress signals and support needs from the team's pulse survey, write a concise leadership framework — practical actions for this cycle grounded in Brains' markers of excellence and values.
Format: 3-4 named action areas, each with a 1-sentence directive. Sound like a thoughtful, warm Brains leader. No fluff. No generic advice.`;

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not set" }, { status: 503 });
  }

  const { type, prompt, personContext } = await req.json() as {
    type: "person" | "action" | "themes" | "framework";
    prompt: string;
    personContext?: string;
  };

  let instructions = ACTION_INSTRUCTIONS;
  if (type === "person") instructions = PERSON_INSTRUCTIONS;
  if (type === "themes") instructions = THEMES_INSTRUCTIONS;
  if (type === "framework") instructions = FRAMEWORK_INSTRUCTIONS;

  const actionSuffix = personContext ? `\n\nWhere relevant, weave in this person's profile: ${personContext}` : "";

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: type === "themes" ? 400 : type === "framework" ? 800 : 600,
      system: BRAINS_CONTEXT + "\n\n" + instructions + (type === "person" ? actionSuffix : ""),
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content.find((b) => b.type === "text")?.text ?? "";

    if (type === "themes") {
      try {
        const themes = JSON.parse(text);
        return NextResponse.json({ themes });
      } catch {
        return NextResponse.json({ themes: [] });
      }
    }

    return NextResponse.json({ text });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("Anthropic API error:", msg);
    return NextResponse.json({ error: `Anthropic API error: ${msg}` }, { status: 502 });
  }
}
