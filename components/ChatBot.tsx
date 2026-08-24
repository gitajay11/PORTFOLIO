"use client";

import { useEffect, useRef, useState } from "react";
import { MAX_QUESTION_LENGTH, localAnswer } from "@/lib/chatKnowledge";
import { profile } from "@/lib/content";

type Message = { role: "user" | "assistant"; content: string };

const GREETING: Message = {
  role: "assistant",
  content: `Hi — I'm ${profile.shortName}'s assistant. Ask me about his stack, his projects, or how to reach him.`,
};

const SUGGESTIONS = [
  "What does he work with?",
  "Show me his projects",
  "How do I contact him?",
];

/**
 * Once the route has told us no model is configured, stop asking. Without this
 * every question costs a pointless round-trip that can only 503.
 */
let liveModelUnavailable = false;

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Keep the newest message in view as the thread grows.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, pending]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointerDown = (e: MouseEvent) => {
      if (!panelRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onPointerDown);
    };
  }, [open]);

  const send = async (text: string) => {
    const question = text.trim().slice(0, MAX_QUESTION_LENGTH);
    if (!question || pending) return;

    const next = [...messages, { role: "user" as const, content: question }];
    setMessages(next);
    setDraft("");
    setPending(true);

    if (liveModelUnavailable) {
      setMessages([...next, { role: "assistant", content: localAnswer(question) }]);
      setPending(false);
      return;
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Drop the canned greeting — it isn't part of the real exchange.
        body: JSON.stringify({ messages: next.slice(1) }),
      });

      if (res.ok) {
        const data = (await res.json()) as { reply?: string };
        setMessages([
          ...next,
          {
            role: "assistant",
            content: data.reply?.trim() || localAnswer(question),
          },
        ]);
      } else if (res.status === 429) {
        const data = (await res.json()) as { error?: string };
        setMessages([
          ...next,
          { role: "assistant", content: data.error ?? "Try again in a moment." },
        ]);
      } else {
        // 503 means no model is wired up — answer from the local knowledge base.
        if (res.status === 503) liveModelUnavailable = true;
        setMessages([...next, { role: "assistant", content: localAnswer(question) }]);
      }
    } catch {
      // Offline, or a static host with no API route at all.
      setMessages([...next, { role: "assistant", content: localAnswer(question) }]);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="chat" ref={panelRef}>
      {open && (
        <div className="chat__panel" role="dialog" aria-label="Ask about Ajay">
          <header className="chat__head">
            <span className="chat__dot" aria-hidden="true" />
            <div>
              <strong>Ask about {profile.shortName}</strong>
              <small>Answers come from this site</small>
            </div>
            <button
              className="chat__close"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              &#10005;
            </button>
          </header>

          <div className="chat__log" ref={scrollRef}>
            {messages.map((m, i) => (
              <div key={i} className={`chat__msg chat__msg--${m.role}`}>
                {m.content}
              </div>
            ))}
            {pending && (
              <div className="chat__msg chat__msg--assistant chat__typing">
                <i />
                <i />
                <i />
              </div>
            )}
          </div>

          {messages.length === 1 && (
            <div className="chat__chips">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}

          <form
            className="chat__form"
            onSubmit={(e) => {
              e.preventDefault();
              send(draft);
            }}
          >
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask a question…"
              maxLength={MAX_QUESTION_LENGTH}
              aria-label="Your question"
            />
            <button type="submit" disabled={!draft.trim() || pending} aria-label="Send">
              &#8593;
            </button>
          </form>
        </div>
      )}

      <button
        className={`chat__launch${open ? " is-open" : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Close assistant" : "Ask about Ajay"}
      >
        {open ? (
          <span className="chat__launchicon">&#10005;</span>
        ) : (
          <>
            <svg viewBox="0 0 24 24" aria-hidden="true" className="chat__launchicon">
              <path d="M12 3c-4.97 0-9 3.36-9 7.5 0 2.3 1.24 4.36 3.2 5.73-.13 1.1-.6 2.3-1.5 3.3 1.6-.2 3.1-.9 4.2-1.7.98.25 2 .38 3.1.38 4.97 0 9-3.36 9-7.5S16.97 3 12 3z" />
            </svg>
            <span className="chat__launchlabel">Ask AI</span>
          </>
        )}
      </button>
    </div>
  );
}
