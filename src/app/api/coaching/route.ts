import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const BRAINS_CONTEXT = `Brains is an independent creative agency and B-Corp.
Values: We Care for Each Other, We Do Good Work, We Look for Magic, We Spark Joy.
Markers of Excellence: Pivot with Purpose, Brave Ideas Bold Action, Speak Fluent Client, Work Out Loud, Enjoy the Ride.
2026 vision: Clarity — of vision, craft, role, process, and care.
Coaches not managers. Work is not your whole identity.`;

const PERSON_INSTRUCTIONS = `You are a coaching intelligence tool for Brains. You are given a team member's full profile.
Write a 4-5 sentence coaching narrative that:
1. Opens with something insightful about how this person's personality profile shapes how they show up at work
2. Connects their strengths to where they may be thriving or struggling RIGHT NOW given their pulse + stress signals
3. Gives the coach 1-2 specific, practical suggestions grounded in Brains values
Sound warm, direct, human. No bullet points. No preamble. No hedging.`;

const ACTION_INSTRUCTIONS = `You are a coaching intelligence tool for Brains.
Write a SHORT (3-4 sentences), direct, human coaching narrative. Sound like a thoughtful Brains leader.
No bullet points. No preamble.`;

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not set" }, { status: 503 });
  }

  const { type, prompt, personContext } = await req.json() as {
    type: "person" | "action";
    prompt: string;
    personContext?: string;
  };

  const instructions = type === "person" ? PERSON_INSTRUCTIONS : ACTION_INSTRUCTIONS;
  const actionSuffix = personContext ? `\n\nWhere relevant, weave in this person's profile: ${personContext}` : "";

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 600,
    system: [
      {
        type: "text",
        text: BRAINS_CONTEXT,
        cache_control: { type: "ephemeral" },
      },
      {
        type: "text",
        text: instructions + actionSuffix,
      },
    ],
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content.find((b) => b.type === "text")?.text ?? "";
  return NextResponse.json({ text });
}
