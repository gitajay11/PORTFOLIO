/**
 * Everything the assistant knows about Ajay, derived from the same content
 * that renders the page — so the bot can't drift from the site.
 *
 * Two consumers:
 *  - the API route, which sends `systemPrompt()` to Claude;
 *  - the browser, which falls back to `localAnswer()` when the route is
 *    unavailable (no API key configured, or a static host with no server).
 */

import {
  GITHUB_URL,
  LINKEDIN_URL,
  WHATSAPP_URL,
  aboutParagraphs,
  profile,
  projects,
  stackCards,
  stats,
  timeline,
} from "./content";

export const MAX_QUESTION_LENGTH = 800;

export function systemPrompt(): string {
  return [
    `You are the assistant on ${profile.shortName}'s developer portfolio site.`,
    `You answer visitors' questions about him — recruiters, clients and other developers.`,
    "",
    "## About him",
    `Name: ${profile.firstName} ${profile.lastName}. Role: ${profile.role}. Status: ${profile.status}.`,
    `Email: ${profile.email}`,
    `GitHub: ${GITHUB_URL}`,
    `LinkedIn: ${LINKEDIN_URL}`,
    `WhatsApp: ${WHATSAPP_URL}`,
    "",
    aboutParagraphs.join("\n\n"),
    "",
    "## Numbers",
    stats.map((s) => `- ${s.value}+ ${s.label}`).join("\n"),
    "",
    "## Stack",
    stackCards
      .map((c) => `- ${c.title}: ${c.tags.join(", ")}. ${c.body}`)
      .join("\n"),
    "",
    "## Projects",
    projects.map((p) => `- ${p.title} (${p.tags.join(", ")}): ${p.body}`).join("\n"),
    "",
    "## Timeline",
    timeline.map((t) => `- ${t.year} — ${t.title}: ${t.body}`).join("\n"),
    "",
    "## How to answer",
    "- Keep it short: two or three sentences, no preamble. This is a chat bubble, not a document.",
    "- Speak about Ajay in the third person. You are his site assistant, not him.",
    "- Only use the facts above. If you are asked something they don't cover — his rates, his availability on a specific date, personal details — say you don't have that and point the visitor at his email.",
    "- Never invent projects, employers, dates or technologies.",
    "- If someone wants to hire or contact him, give them the email and offer the WhatsApp link.",
    "- Plain text only. No markdown headings, no bullet lists, no code fences.",
  ].join("\n");
}

/* ------------------------------------------------------------------ *
 * Offline fallback
 * ------------------------------------------------------------------ */

type Rule = { match: RegExp; reply: () => string };

const RULES: Rule[] = [
  {
    match: /\b(hi|hey|hello|yo|greetings)\b/i,
    reply: () =>
      `Hi. I can tell you about ${profile.shortName}'s work, stack, projects or how to reach him. What do you need?`,
  },
  {
    // "work with" is deliberately absent — "what does he work with?" is a
    // stack question, and the rule below should win it.
    match: /\b(contacts?|e-?mails?|reach|hire|hiring|availab\w*|freelance|rates?)\b/i,
    reply: () =>
      `He's ${profile.status}. Email is the fastest route — ${profile.email} — or message him on WhatsApp via the dock at the bottom of the page.`,
  },
  {
    match: /\b(stacks?|tech\w*|skills?|languages?|frameworks?|tools?|works? with|uses?|using|writes?)\b/i,
    reply: () =>
      stackCards
        .map((c) => `${c.title}: ${c.tags.join(", ")}`)
        .join(". ") + ".",
  },
  {
    match: /\b(projects?|builds?|built|portfolio|shipped|apps?)\b/i,
    reply: () =>
      `A few: ${projects
        .map((p) => `${p.title} (${p.tags.slice(0, 2).join(", ")})`)
        .join(", ")}. Ask about any one of them for detail.`,
  },
  {
    match: /\b(experience|years?|background|history|career|timeline|worked)\b/i,
    reply: () =>
      `${timeline[0].year} — ${timeline[0].title}. ${
        stats[0].value
      }+ ${stats[0].label}, ${stats[1].value}+ ${stats[1].label}.`,
  },
  {
    match: /\b(github|code|repos?|repositor\w*|source|open ?source)\b/i,
    reply: () => `His GitHub is ${GITHUB_URL} — the dock at the bottom links straight to it.`,
  },
  {
    match: /\b(linked ?in|cv|resum\w*|résum\w*)\b/i,
    reply: () => `LinkedIn is linked in the dock at the bottom of the page, and his email is ${profile.email}.`,
  },
  {
    match: /\b(who|about|introduce|yourself|bio|tell me)\b/i,
    reply: () =>
      `${profile.firstName} ${profile.lastName} is a ${profile.role}. ${aboutParagraphs[1]}`,
  },
];

/** Keyword-matched reply used when the live model isn't reachable. */
export function localAnswer(question: string): string {
  const q = question.trim();
  if (!q) return "Ask me anything about Ajay's work or how to reach him.";

  for (const rule of RULES) {
    if (rule.match.test(q)) return rule.reply();
  }

  return `I can only answer from what's on this page — his stack, projects, experience and contact details. For anything else, email him at ${profile.email}.`;
}
