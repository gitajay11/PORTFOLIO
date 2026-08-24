/**
 * All site copy lives here so the components stay presentational.
 * Edit this file to update the portfolio — no JSX changes needed.
 *
 * NOTE: projects, stats and timeline entries are placeholders.
 */

/**
 * Contact endpoints, shared by the floating dock and the contact section.
 *
 * GITHUB_URL and LINKEDIN_URL are real. WHATSAPP_NUMBER is still a
 * placeholder — replace it with your own. It must be in full international
 * format with no +, spaces or dashes (e.g. "919876543210" for India).
 */
export const GITHUB_URL = "https://github.com/gitajay11";
export const LINKEDIN_URL = "https://www.linkedin.com/in/ajayak1501";
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

export const projects: {
  title: string;
  body: string;
  tags: string[];
  live: string;
  code?: string;
}[] = [
  {
    title: "Forgebyte",
    body: "A freelance web application development studio — full-stack product builds, APIs & backend systems, MVP sprints, and ongoing support for founders and teams who need to move fast without cutting corners.",
    tags: ["Next.js", "TypeScript", "Tailwind CSS", "PostgreSQL"],
    live: "https://www.forgebyte.online/",
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
    field:
      "Vels University — specialization in Artificial Intelligence and Machine Learning.",
    score: "CGPA 8.25 / 10",
    location: "Chennai, Tamil Nadu",
    image: "/qualifications/bachelors-marksheet.jpg",
  },
  {
    icon: "book" as const,
    stage: "Higher Secondary",
    years: "2021",
    school: "Class XII",
    field: "The Velammal International School — CBSE Board.",
    score: "89.8% aggregate",
    location: "Tiruvallur, Tamil Nadu",
    image: "/qualifications/class-xii-marksheet.jpg",
  },
  {
    icon: "book" as const,
    stage: "Secondary",
    years: "2019",
    school: "Class X",
    field: "St. Joseph's Matriculation Higher Secondary School — Tamil Nadu State Board.",
    score: "92.2% aggregate",
    location: "Arani, Tamil Nadu",
    image: "/qualifications/class-x-marksheet.jpg",
  },
];

/**
 * Completed certifications, newest first — real, from PDFs supplied in
 * /certificates (not committed; source documents, not build input). `accent`
 * picks the card's badge color ("green" | "blue") purely for visual rhythm
 * across the grid, one per issuer here — it carries no other meaning.
 * Lives at /education/certifications.
 *
 * `href` links are the verify URLs printed on each certificate (Credly for
 * the Anthropic ones, Microsoft Learn for the Microsoft ones) — real, not
 * placeholders. `image` is a rendering of the certificate itself (first PDF
 * page, rasterized — see README) shown in the lightbox when its card's
 * image icon is clicked; the Microsoft ones are cropped to the card, since
 * the source PDFs are full browser print-outs with chrome and dead space.
 */
export const certificates = [
  {
    badge: "AI",
    accent: "green" as const,
    date: "Aug 2026",
    title: "Claude Certified Associate - Foundations",
    issuer: "Anthropic",
    id: "CREDLY-E4C89032",
    href: "https://www.credly.com/badges/e4c89032-c68c-4b2b-be9a-953350b97ab0",
    image: "/certificates/claude-associate-foundations.jpg",
  },
  {
    badge: "AI",
    accent: "green" as const,
    date: "Aug 2026",
    title: "Claude Certified Architect - Professional",
    issuer: "Anthropic",
    id: "CREDLY-229CA9AF",
    href: "https://www.credly.com/badges/229ca9af-e3c1-49df-96b2-e4d51cc44bb6",
    image: "/certificates/claude-architect-professional.jpg",
  },
  {
    badge: "AI",
    accent: "green" as const,
    date: "Aug 2026",
    title: "Claude Certified Developer - Foundations",
    issuer: "Anthropic",
    id: "CREDLY-02FA97FC",
    href: "https://www.credly.com/badges/02fa97fc-0a2f-4069-bf88-d041392e9e63",
    image: "/certificates/claude-developer-foundations.jpg",
  },
  {
    badge: "AI",
    accent: "green" as const,
    date: "Jul 2026",
    title: "Claude Certified Architect - Foundations",
    issuer: "Anthropic",
    id: "CREDLY-6C60AD33",
    href: "https://www.credly.com/badges/6c60ad33-9ff5-4583-b23f-9d7f6435dc19",
    image: "/certificates/claude-architect-foundations.jpg",
  },
  {
    badge: "MS",
    accent: "blue" as const,
    date: "May 2026",
    title: "Microsoft Certified: Fabric Data Engineer Associate",
    issuer: "Microsoft",
    id: "5D3E9AA3FE808AAD",
    href: "https://learn.microsoft.com/en-us/users/ajaykumara-5300/credentials/certification/fabric-data-engineer-associate?tab=credentials-tab",
    image: "/certificates/fabric-data-engineer-associate.jpg",
  },
  {
    badge: "MS",
    accent: "blue" as const,
    date: "Sep 2025",
    title: "Microsoft Certified: Azure Fundamentals",
    issuer: "Microsoft",
    id: "971B26F4C3A4256",
    href: "https://learn.microsoft.com/en-us/users/ajaykumara-5300/credentials/certification/azure-fundamentals?tab=credentials-tab",
    image: "/certificates/azure-fundamentals.jpg",
  },
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
