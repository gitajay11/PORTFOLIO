import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { MAX_QUESTION_LENGTH, systemPrompt } from "@/lib/chatKnowledge";

export const runtime = "nodejs";
/** The assistant is live, so never let a response get cached. */
export const dynamic = "force-dynamic";

/** Deliberately small: replies are chat bubbles, two or three sentences. */
const MAX_TOKENS = 512;
/** Cap the history the browser can push, so one visitor can't run up a bill. */
const MAX_TURNS = 12;

type Turn = { role: "user" | "assistant"; content: string };

function isTurn(value: unknown): value is Turn {
  if (typeof value !== "object" || value === null) return false;
  const t = value as Record<string, unknown>;
  return (
    (t.role === "user" || t.role === "assistant") && typeof t.content === "string"
  );
}

export async function POST(request: Request) {
  // No key configured — tell the client to use its offline answers rather
  // than failing. This keeps the widget useful on a purely static deploy.
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ fallback: true }, { status: 503 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const messages = (payload as { messages?: unknown })?.messages;
  if (!Array.isArray(messages) || !messages.every(isTurn)) {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const trimmed: Anthropic.MessageParam[] = messages
    .slice(-MAX_TURNS)
    .map((t) => ({
      role: t.role,
      content: t.content.slice(0, MAX_QUESTION_LENGTH),
    }));

  if (trimmed.length === 0 || trimmed[0].role !== "user") {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  try {
    const client = new Anthropic();

    const response = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: MAX_TOKENS,
      // Simple grounded Q&A — low effort keeps it fast and cheap.
      output_config: { effort: "low" },
      system: [
        {
          type: "text",
          text: systemPrompt(),
          // The prompt is byte-identical on every request, so it caches.
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: trimmed,
    });

    if (response.stop_reason === "refusal") {
      return NextResponse.json({
        reply: "I can't help with that one. Ask me about Ajay's work instead.",
      });
    }

    const reply = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("")
      .trim();

    if (!reply) return NextResponse.json({ fallback: true }, { status: 503 });

    return NextResponse.json({ reply });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      // A bad key is a deploy problem, not a visitor problem — degrade quietly.
      return NextResponse.json({ fallback: true }, { status: 503 });
    }
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: "Getting a lot of questions right now — try again in a moment." },
        { status: 429 }
      );
    }
    console.error("[chat] request failed:", error);
    return NextResponse.json({ fallback: true }, { status: 503 });
  }
}
