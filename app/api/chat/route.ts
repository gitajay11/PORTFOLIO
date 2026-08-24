import Groq from "groq-sdk";
import { NextResponse } from "next/server";
import { MAX_QUESTION_LENGTH, systemPrompt } from "@/lib/chatKnowledge";

export const runtime = "nodejs";
/** The assistant is live, so never let a response get cached. */
export const dynamic = "force-dynamic";

/** Fast, general-purpose, and current on Groq — good fit for short grounded Q&A. */
const MODEL = "llama-3.3-70b-versatile";
/** Deliberately small: replies are chat bubbles, two or three sentences. */
const MAX_COMPLETION_TOKENS = 512;
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
  if (!process.env.GROQ_API_KEY) {
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

  const trimmed: Groq.Chat.ChatCompletionMessageParam[] = messages
    .slice(-MAX_TURNS)
    .map((t) => ({
      role: t.role,
      content: t.content.slice(0, MAX_QUESTION_LENGTH),
    }));

  if (trimmed.length === 0 || trimmed[0].role !== "user") {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  try {
    const client = new Groq();

    // Groq's API is OpenAI-compatible: there's no separate top-level `system`
    // parameter like Anthropic's — the system prompt is just the first
    // message in the array.
    const response = await client.chat.completions.create({
      model: MODEL,
      max_completion_tokens: MAX_COMPLETION_TOKENS,
      temperature: 0.4,
      messages: [{ role: "system", content: systemPrompt() }, ...trimmed],
    });

    // Groq's finish_reason union doesn't carry a distinct "refused" state the
    // way Anthropic's stop_reason does — off-topic questions are handled by
    // the system prompt's own instructions instead, same as the offline
    // fallback rules. An empty reply is the only thing left to guard here.
    const reply = response.choices[0]?.message?.content?.trim();

    if (!reply) return NextResponse.json({ fallback: true }, { status: 503 });

    return NextResponse.json({ reply });
  } catch (error) {
    if (error instanceof Groq.AuthenticationError) {
      // A bad key is a deploy problem, not a visitor problem — degrade quietly.
      return NextResponse.json({ fallback: true }, { status: 503 });
    }
    if (error instanceof Groq.RateLimitError) {
      return NextResponse.json(
        { error: "Getting a lot of questions right now — try again in a moment." },
        { status: 429 }
      );
    }
    console.error("[chat] request failed:", error);
    return NextResponse.json({ fallback: true }, { status: 503 });
  }
}
