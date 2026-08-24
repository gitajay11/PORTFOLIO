/**
 * All site copy lives here so the components stay presentational.
 * Edit this file to update the portfolio — no JSX changes needed.
 *
 * NOTE: projects, stats and timeline entries are placeholders.
 */

/**
 * Contact endpoints, shared by the floating dock and the contact section.
 *
 * GITHUB_URL is real. LINKEDIN_URL and WHATSAPP_NUMBER are placeholders —
 * replace them with your own. WHATSAPP_NUMBER must be in full international
 * format with no +, spaces or dashes (e.g. "919876543210" for India).
 */
export const GITHUB_URL = "https://github.com/gitajay11";
export const LINKEDIN_URL = "https://www.linkedin.com/in/your-handle";
export const WHATSAPP_NUMBER = "910000000000";
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

export const profile = {
  firstName: "AJAY",
  lastName: "KUMAR",
  shortName: "Ajay K",
  initials: "AK",
  wordmark: "AJAYKUMAR",
  role: "developer",
  email: "ajayak15012004@gmail.com",
  status: "available for work",
};

/** Captions that swap as the background video scrubs. */
export const heroStages = [
  { lead: "I build things", emphasis: "ship", tail: "that" },
  { lead: "Frontend craft.", emphasis: "discipline", tail: "Backend" },
] as const;

export const marqueeItems = [
  "TypeScript", "React", "Node.js", "Next.js", "PostgreSQL", "Docker",
  "Python", "AWS", "Tailwind", "Redis", "GraphQL", "Go",
];

export const aboutParagraphs = [
  "I'm a developer who cares about the parts users never see — the query that got 40× faster, the bundle that lost 300 kB, the deploy that stopped waking people up at 3 a.m. I like turning fuzzy problems into small, boring, reliable systems.",
  "Comfortable across the stack: React and TypeScript on the front, Node and Postgres behind it, containers and CI holding it all together.",
];

export const stats = [
  { value: 4, label: "years building" },
  { value: 30, label: "projects shipped" },
  { value: 12, label: "OSS contributions" },
];

export const stackCards = [
  {
    icon: "{ }",
    title: "Frontend",
    body: "Interfaces that stay fast on a mid-range phone, not just on my laptop.",
    tags: ["React", "Next.js", "TypeScript", "Tailwind", "Vite", "GSAP"],
  },
  {
    icon: "</>",
    title: "Backend",
    body: "APIs with clear contracts, sane errors, and boring, predictable behaviour.",
    tags: ["Node.js", "Express", "Python", "PostgreSQL", "Redis", "GraphQL"],
  },
  {
    icon: "▲",
    title: "Infra & Tooling",
    body: "Repeatable builds, short feedback loops, deploys that are non-events.",
    tags: ["Docker", "GitHub Actions", "AWS", "Vercel", "Nginx", "Linux"],
  },
];

export const projects = [
  {
    title: "Nebula Analytics",
    body: "Real-time event dashboard handling ~2M events/day. Streaming ingest, rollup tables, and a UI that renders 50k points without dropping frames.",
    tags: ["Next.js", "Node", "Postgres", "Redis"],
    live: "#",
    code: "#",
  },
  {
    title: "Forge CLI",
    body: "A zero-config scaffolding tool for TypeScript services. Generates the repo, CI, Docker setup and health checks in one command.",
    tags: ["TypeScript", "Go", "Docker"],
    live: "#",
    code: "#",
  },
  {
    title: "Driftwood",
    body: "Collaborative markdown editor with CRDT sync and offline-first storage. Conflict-free edits across tabs, devices and flaky connections.",
    tags: ["React", "WebSockets", "IndexedDB"],
    live: "#",
    code: "#",
  },
  {
    title: "Pulse Monitor",
    body: "Self-hosted uptime monitoring with alert routing. Sub-second checks, incident timelines, and a status page you can hand to customers.",
    tags: ["Python", "FastAPI", "AWS"],
    live: "#",
    code: "#",
  },
];

export const timeline = [
  {
    year: "2024 — now",
    title: "Full-stack Developer",
    body: "Owning features end to end: schema, API, UI, and the dashboards that prove it works.",
  },
  {
    year: "2023",
    title: "Frontend Developer",
    body: "Rebuilt a legacy dashboard in React; cut time-to-interactive from 6.2s to 1.4s.",
  },
  {
    year: "2022",
    title: "Freelance & Open Source",
    body: "Shipped client sites and started contributing patches to tools I use daily.",
  },
  {
    year: "2021",
    title: "First lines of code",
    body: "Started with Python scripts, got hooked on making the browser do things it shouldn't.",
  },
];

export const socials = [
  { label: "GitHub", href: GITHUB_URL },
  { label: "LinkedIn", href: LINKEDIN_URL },
  { label: "WhatsApp", href: WHATSAPP_URL },
  { label: "Résumé", href: "#" },
];

export const navSections = [
  { num: "01", id: "about", label: "about" },
  { num: "02", id: "stack", label: "stack" },
  { num: "03", id: "work", label: "work" },
  { num: "04", id: "path", label: "path" },
];
