"use client";

import { useState, type FormEvent } from "react";
import { profile } from "@/lib/content";

/**
 * Submits to Formspree (https://formspree.io/f/mvkpjooa) via fetch + FormData
 * rather than a native form POST, so a send never navigates away from the
 * page — the status message below the button is the only feedback, matching
 * the rest of this site's inline, no-page-reload interactions (the chat
 * widget works the same way).
 */
const FORM_ENDPOINT = "https://formspree.io/f/mvkpjooa";

type Status = "idle" | "sending" | "sent" | "error";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorDetail, setErrorDetail] = useState("");
  const [sentName, setSentName] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim() || status === "sending") return;

    setStatus("sending");
    setErrorDetail("");

    const body = new FormData();
    body.set("name", name.trim());
    body.set("email", email.trim());
    if (phone.trim()) body.set("phone", phone.trim());
    body.set("message", message.trim());
    body.set("_subject", `Portfolio message from ${name.trim()}`);

    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body,
      });

      if (res.ok) {
        setStatus("sent");
        setSentName(name.trim());
        setName("");
        setEmail("");
        setPhone("");
        setMessage("");
        return;
      }

      // Formspree returns 4xx with a JSON { errors: [{ message }] } body on
      // things like a malformed address — surface that instead of a bare
      // "something went wrong" when it's available.
      const data = await res.json().catch(() => null);
      setErrorDetail(data?.errors?.map((e: { message: string }) => e.message).join(" ") ?? "");
      setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div className="cform cform--sent">
        <p className="cform__sent">
          Message sent — thanks, {sentName || "I"}&rsquo;ll get back to you soon.
        </p>
      </div>
    );
  }

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
            disabled={status === "sending"}
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
            disabled={status === "sending"}
          />
        </label>
        <label className="cform__field">
          <span>Phone (optional)</span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
            autoComplete="tel"
            disabled={status === "sending"}
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
          disabled={status === "sending"}
        />
      </label>

      <div className="cform__foot">
        <button type="submit" className="cform__submit" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Send message"}
          {status !== "sending" && <span>&#8599;</span>}
        </button>
        <p className={`cform__note${status === "error" ? " cform__note--error" : ""}`}>
          {status === "error"
            ? errorDetail || `Something went wrong — email him directly at ${profile.email} instead.`
            : `Goes straight to ${profile.shortName}.`}
        </p>
      </div>
    </form>
  );
}
