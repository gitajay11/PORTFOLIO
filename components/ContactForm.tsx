"use client";

import { useState, type FormEvent } from "react";
import { profile } from "@/lib/content";

/**
 * No backend wired up — submitting builds a mailto: link and hands off to
 * the visitor's own mail app. Honest about that in the copy below rather
 * than claiming a "message sent" state nothing actually sent. Swap this
 * for a real POST to an API route if/when there's an email service
 * (Resend, SendGrid, etc.) configured to send on the server instead.
 */
export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [opening, setOpening] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    const subject = encodeURIComponent(`Portfolio message from ${name.trim()}`);
    const body = encodeURIComponent(`${message.trim()}\n\n— ${name.trim()} (${email.trim()})`);
    setOpening(true);
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
  };

  return (
    <form className="cform" onSubmit={onSubmit}>
      <div className="cform__row">
        <label className="cform__field">
          <span>Name</span>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            autoComplete="name"
          />
        </label>
        <label className="cform__field">
          <span>Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </label>
      </div>

      <label className="cform__field">
        <span>Message</span>
        <textarea
          required
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What are you building?"
        />
      </label>

      <div className="cform__foot">
        <button type="submit" className="cform__submit">
          Send message <span>&#8599;</span>
        </button>
        <p className="cform__note">
          {opening
            ? "Opening your email app to finish sending…"
            : `Opens your email app, addressed to ${profile.email}.`}
        </p>
      </div>
    </form>
  );
}
