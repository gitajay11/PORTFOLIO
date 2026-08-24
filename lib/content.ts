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

/**
 * Qualifications (school → degree), newest first — same convention as
 * `timeline`. `icon` picks the timeline-node glyph in Qualification.tsx:
 * "cap" for degrees, "book" for school stages. Lives at
 * /education/qualification.
 */
export const qualifications = [
  {
    icon: "cap" as const,
    stage: "Bachelor's",
    years: "2021 – 2025",
    school: "B.Tech, Computer Science & Engineering",
    field: "Vellore Institute of Technology — specialization in web & distributed systems.",
    score: "CGPA 8.7 / 10",
    location: "Vellore, Tamil Nadu",
  },
  {
    icon: "book" as const,
    stage: "Higher Secondary",
    years: "2019 – 2021",
    school: "Class XI – XII, PCM with Computer Science",
    field: "Delhi Public School, R.K. Puram — CBSE board.",
    score: "92.4% aggregate",
    location: "New Delhi",
  },
  {
    icon: "book" as const,
    stage: "Secondary",
    years: "2018 – 2019",
    school: "Class X",
    field: "Delhi Public School, R.K. Puram — CBSE board.",
    score: "94.2% aggregate",
    location: "New Delhi",
  },
];

/**
 * Completed certifications, newest first. `accent` picks the card's badge
 * color ("green" | "blue") purely for visual rhythm across the grid —
 * it carries no other meaning. Lives at /education/certifications.
 */
export const certificates = [
  {
    badge: "AWS",
    accent: "blue" as const,
    date: "Jan 2025",
    title: "AWS Certified Cloud Practitioner",
    issuer: "Amazon Web Services",
    id: "AWS-CCP-88213",
    href: "#",
  },
  {
    badge: "META",
    accent: "green" as const,
    date: "Nov 2024",
    title: "Meta Front-End Developer",
    issuer: "Meta · Coursera",
    id: "COURSERA-9F31C7",
    href: "#",
  },
  {
    badge: "API",
    accent: "green" as const,
    date: "Jul 2024",
    title: "API Fundamentals Student Expert",
    issuer: "Postman",
    id: "PM-SE-004471",
    href: "#",
  },
  {
    badge: "GA",
    accent: "blue" as const,
    date: "Mar 2024",
    title: "Google Data Analytics Professional Certificate",
    issuer: "Google · Coursera",
    id: "COURSERA-2A88E1",
    href: "#",
  },
  {
    badge: "</>",
    accent: "green" as const,
    date: "Sep 2023",
    title: "Responsive Web Design",
    issuer: "freeCodeCamp",
    id: "FCC-RWD-71A9",
    href: "#",
  },
  {
    badge: "JS",
    accent: "green" as const,
    date: "Feb 2023",
    title: "JavaScript Algorithms & Data Structures",
    issuer: "freeCodeCamp",
    id: "FCC-JSADS-5C02",
    href: "#",
  },
];

export const socials = [
  { label: "GitHub", href: GITHUB_URL },
  { label: "LinkedIn", href: LINKEDIN_URL },
  { label: "WhatsApp", href: WHATSAPP_URL },
  { label: "Résumé", href: "#" },
];

/**
 * Sections rendered as anchors on the homepage. `education` is a real
 * route instead: /education is a hub linking out to the standalone
 * /education/qualification and /education/certifications pages, so it
 * carries an explicit `href` and Nav.tsx treats it differently — a plain
 * link rather than a same-page `#id` anchor.
 */
export const navSections = [
  { num: "01", id: "about", label: "about" },
  { num: "02", id: "stack", label: "stack" },
  { num: "03", id: "work", label: "work" },
  { num: "04", id: "path", label: "path" },
  { num: "05", id: "education", label: "education", href: "/education" },
] as const;
