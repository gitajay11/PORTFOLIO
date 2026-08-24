# Portfolio — Ajay K

A Next.js portfolio with a scroll-scrubbed video that plays across the **entire**
page: the top of the document is frame 0, the bottom of the footer is frame 240.

```
app/
  layout.tsx                          fonts, metadata, persistent chrome
  page.tsx                            homepage section composition
  globals.css                         tokens, layout, responsive
  api/chat/route.ts                   the assistant's server endpoint
  contact/page.tsx                    hero + direct contact + form
  education/page.tsx                  hub — links to the two pages below
  education/qualification/page.tsx    standalone page
  education/certifications/page.tsx   standalone page
components/
  ScrollVideoBackground.tsx   the fixed, whole-document video layer (every
                              route except /contact — see below)
  ContactHero.tsx             /contact's own bounded, local video hero
  ContactForm.tsx             the contact form, posts to Formspree
  ContactDirect.tsx           the direct-email block under the hero
  Reveal.tsx / Counter.tsx    scroll-triggered animations
  Nav / Hero / Interlude / About / Stack / Work / Path / Footer
  Qualification / Certifications (+ CertificateCard) / EducationHub (+ HubTile)
lib/
  content.ts        ALL site copy — edit here
  scrollProgress.ts one scroll listener shared by every component
public/AK.mp4       the hero video
legacy-static/      the original no-framework version, kept for reference
```

## Routes

| Path | Renders |
| --- | --- |
| `/` | The single-page scroll: hero → about → stack → work → path |
| `/contact` | Bounded video hero → direct email/socials → contact form |
| `/education` | Hub — two link-tiles out to the pages below |
| `/education/qualification` | The school-to-degree timeline (was inline on the homepage; moved out and renamed) |
| `/education/certifications` | The completed-certificates grid |

The persistent chrome — `ScrollVideoBackground`, `Nav`, the contact dock, the
chat assistant — lives in `app/layout.tsx`, not `page.tsx`, so it's present on
every route above, not just the homepage. The video re-measures the current
page's scroll height on every navigation (`ResizeObserver` + a plain scroll
listener), so it scrubs correctly whether the current document is the long
homepage or a short standalone page.

### /contact's video is different on purpose

Every other route gets `ScrollVideoBackground` — the video fixed behind the
*whole* document. `/contact` explicitly doesn't: `ScrollVideoBackground`
checks `usePathname()` and renders nothing there, and `ContactHero.tsx` shows
its own bounded, local scroll-scrub instead — a 240vh (190vh on mobile) track
with a sticky video that releases once you've scrolled past it, closer to how
this project's hero worked originally (see `legacy-static/`) before the
whole-page treatment. Deliberately simpler than `ScrollVideoBackground`: no
side-vs-stacked layout logic, since a short line of text doesn't need a
clear column next to the subject the way "AJAY KUMAR" did.

It shares the source video, the black-point filter, and the watermark-patch
math with `ScrollVideoBackground` (see that file's comments for how those
numbers were derived) but computes progress from the track element's own
`getBoundingClientRect()` instead of whole-document scroll — a different,
self-contained measurement, not a shared module, since only this one page
needs it.

### The hero text splits left/right on desktop

`ContactHero`'s kicker ("let's connect") and heading ("Got something worth
building?") sit at opposite edges of the screen on desktop — a plain flex row
with two children naturally pushes them apart via `justify-content:
space-between`. That only works with room to breathe; below 900px it reverts
to the original stacked, centered layout (see the `@media` override in
`globals.css`), since a wide split at phone width leaves both pieces cramped
against their own edge.

### The contact form posts to Formspree

`ContactForm.tsx` submits via `fetch` + `FormData` to
`https://formspree.io/f/mvkpjooa` — a real submission, not a `mailto:`
handoff, so it needed real status states: `sending` while in flight, `sent`
with a confirmation banner (fields clear), `error` with Formspree's own
validation message when available, falling back to "email him directly"
otherwise. Posting with `Accept: application/json` gets a JSON response
instead of Formspree's default redirect, which is what makes the inline
states possible — no navigating away to a Formspree-hosted thank-you page.
`FormData` as the body needs no manual `Content-Type` header; the browser
sets the correct multipart boundary itself.

To point this at a different Formspree form (or swap providers entirely),
edit `FORM_ENDPOINT` at the top of `ContactForm.tsx` — everything else about
the component is provider-agnostic aside from that one URL and the response
shape it expects.

Internal navigation is plain `<a>` tags throughout — this project doesn't use
`next/link` anywhere, on purpose, to keep it framework-light. That means
moving between routes is a real page load, not a client-side transition:
simple and totally reliable, at the cost of a full navigation instead of an
instant swap. `Nav.tsx` reads the current path with `usePathname()` so the
homepage's `#about`-style anchors become `/#about` when linked to from a
different route.

## Running it

```bash
npm run dev
```

Then open http://localhost:3000. `npm run build` produces a fully static
prerender — deployable to Vercel, Netlify, or any static host.

## How the scroll animation works

The video is a `position: fixed` layer behind every section, and its
`currentTime` is driven by progress through the whole document:

```
progress = scrollY / (scrollHeight - innerHeight)
video.currentTime = progress * duration
```

Three details make it smooth rather than janky:

1. **A lerp** between the scroll target and the current time, so a mouse wheel's
   coarse steps become fluid motion.
2. **Seeks only when the decoder is idle** (`!video.seeking`). Queuing seeks onto
   a busy element is what turns naive scrubbing into a stutter.
3. **No React re-renders per frame.** `lib/scrollProgress.ts` is a plain
   pub/sub with one scroll listener; subscribers mutate the DOM through refs.
   A `setState` at 60fps would drop the scrub to a slideshow.

Tuning knobs at the top of `ScrollVideoBackground.tsx`:

| Constant | Does |
| --- | --- |
| `EASE` | Lower = smoother but laggier. `0.11` default. |
| `SEEK_EPS` | Ignore sub-half-frame deltas. |
| `TOTAL_FRAMES` | Feeds the frame counter in the HUD. |

### Pure-black background

The source clip sits on a near-black backdrop measured at RGB **13–21**, with
highlights at 255. The video carries a linear black-point lift:

```css
filter: brightness(0.914) contrast(1.208);
```

That maps everything below ~9% luminance to exactly `0` while leaving white at
255 — so the backdrop renders as true `#000` and blends seamlessly into the
page, with no visible edge where the video ends.

The numbers are derived, not guessed. CSS applies `out = (x*b - 0.5)*c + 0.5`,
so for a slope of 1.104 and an intercept of -0.104: `c = 1.208`, `b = 1.104/c
= 0.914`. Verified by sampling decoded frames — corners land on `[0,0,0]`.

If you re-encode or replace the video, re-measure the backdrop level and redo
that math, or the corners will turn grey.

### Watermark removal

The source clip carries a static generator watermark — a 48x48 sparkle whose
bounding box was measured at **[1136,576]–[1183,623]**, byte-identical in every
frame. A 24px ring around it is luminance **0 at every timestamp**, so a solid
`#000` patch over it is an exact removal rather than a blur or a smudge.

The patch is positioned from JS (`WATERMARK` in `ScrollVideoBackground.tsx`)
because `object-fit: cover` means the video's rendered box is not its element
box — CSS percentages would not track it. It recalculates on resize only, never
per frame.

If you swap the video, re-measure that box or the patch will sit in the wrong
place. If the new clip has a watermark over moving content rather than flat
black, a patch will not work — re-encode with a crop instead.

### Framing and the top crop

The source leaves only **7–19px above the head** (1–2.6% of frame height), so
two things had to change:

1. `object-position: 50% 0%` — on viewports wider than 16:9, `cover` overflows
   vertically. Centred, that overflow is split top and bottom and clips the
   head; pinned to the top, it all comes off the bottom instead.
2. `--video-top-inset` (`clamp(20px, 5.5vh, 68px)`) insets the video from the
   top of the layer, buying real headroom so the subject clears the nav.
   Because the crushed backdrop and the page are both pure `#000`, the
   reclaimed strip is invisible.

Together these take head clearance from ~4px to ~50px on a typical desktop.

### Hero layout: keeping the face clear

A centred portrait and centred type compete for the same space, so on wide
viewports the name landed across the jaw. The hero now picks one of two
layouts, and the choice is made in JS rather than by a media query because a
fixed breakpoint is not enough — the subject is scaled to cover, so a tall or
near-square viewport enlarges him and squeezes the text column even at a
generous width.

- **side** — the video is offset so the subject sits at 70% of the width and
  the name takes the clear column beside him. Used whenever that column can
  actually hold the title.
- **stacked** — subject centred, name below him. The fallback, and what
  mobile always gets.

`ScrollVideoBackground` publishes two custom properties that the hero CSS
keys off, both recomputed on every resize:

| Property | Meaning |
| --- | --- |
| `--subject-left` | Screen x of the body silhouette; caps the text column. |
| `--face-bottom` | Screen y of the bottom of the head; floors the text. |

The stacked hero uses `margin-top: auto` on the inner block rather than
`justify-content: flex-end`. The auto margin pushes the text down when there
is room but collapses to 0 when there is not, so a squeezed hero grows
downward instead of overflowing upward across the face.

Two things this depends on:

1. The video is sized in JS, so it needs `max-width: none` — the global reset
   caps media at `max-width: 100%`, which silently re-cropped the frame and
   undid the horizontal offset.
2. Offsetting the video sideways is only seamless because the source frame is
   black down its left edge (the silhouette never reaches x < 162), so the
   strip it uncovers is page-black meeting video-black. Narrowing the video
   instead would crop mid-body and leave a visible vertical seam.

Verified by mapping the rendered text box back into source coordinates and
testing it against the head box at 375x812 through 2560x1080 — no intersection
at any size.

### Readability over footage

Since content scrolls over a moving video, a fixed scrim ramps from `0.42`
opacity on the hero to `0.80` over the content, and panels (cards, terminal)
use translucent backgrounds with `backdrop-filter`. The two `<Interlude>`
sections deliberately drop the panels so the footage carries the screen alone.

### If scrubbing feels heavy

`AK.mp4` has sparse keyframes, so a fast flick can cost ~150ms to land a distant
frame. Re-encoding with a keyframe per frame makes random seeks near-instant,
at the cost of a larger file:

```bash
ffmpeg -i public/AK.mp4 -c:v libx264 -crf 22 -g 1 -keyint_min 1 -an -movflags +faststart public/AK-scrub.mp4
```

Then point the `src` in `ScrollVideoBackground.tsx` at the new file.

## Fixed UI

Three things are pinned to the viewport on every screen of the site:

| Element | Position | Notes |
| --- | --- | --- |
| Header | top, floating | Detached island, shrinks slightly on scroll |
| Contact dock | bottom centre | LinkedIn, GitHub, WhatsApp, Email |
| AI assistant | bottom left | Launcher plus chat panel |

The frame-counter HUD sits above the dock row and hides below 720px; under
720px the dock shifts off centre so it cannot land under the chat launcher.
Verified for zero overlap between the three at desktop and mobile widths.

The header is a floating island rather than an edge-to-edge bar: centred with
auto margins, capped at the content width, and shrinking slightly once you
scroll.

Two properties would each have made it a containing block for
position:fixed descendants, which would trap the full-screen mobile menu
inside the header:

- **transform** — so it centres with left:0/right:0 and auto margins instead
  of translateX(-50%).
- **backdrop-filter** — so the blur lives on a ::before pseudo-element
  rather than on .nav itself.

### The AI assistant

The widget works with or without an API key, which keeps it useful on a
static host:

- **With a key** — `app/api/chat/route.ts` calls Groq's OpenAI-compatible
  chat completions API (model: `llama-3.3-70b-versatile`) with a system
  prompt built from `lib/content.ts`, so the bot can never drift from what
  the page actually says. Groq's system prompt is just the first message in
  the array — unlike Anthropic, there's no separate top-level `system` field.
- **Without one** — the route returns 503 and the browser answers from the
  keyword rules in `lib/chatKnowledge.ts`. The client remembers that answer
  and stops re-requesting.

To enable the live model:

1. Get a key at [console.groq.com/keys](https://console.groq.com/keys).
2. Copy `.env.local.example` to `.env.local` — not just edit the example
   file, that copy step matters, since `.env.local.example` is never read by
   the app.
3. Set `GROQ_API_KEY=` to your real key inside `.env.local`.

`.env.local` is gitignored; never commit a real key.

The route caps history at 12 turns and 800 chars per message so one visitor
cannot run up a bill, and validates every payload before it reaches the API.

## Editing the content

Everything is in `lib/content.ts` — no JSX changes needed for copy edits.
Theme colors are CSS variables at the top of `globals.css`; change `--accent`
to re-skin the site.

## Placeholder content

Still needs your real details:

- Full name renders as "Ajay Kumar" (inferred from `AK.mp4`)
- All four projects, the stats (4 / 30 / 12), and the timeline entries
- `qualifications` in `lib/content.ts` — every school, field and score is still a placeholder. (`certificates` is real — see below.)
- LINKEDIN_URL and WHATSAPP_NUMBER in lib/content.ts are placeholders
- Every `href: "#"` in `projects` and `socials`

The email is real: `ajayak15012004@gmail.com`.

### Certificates are real

`certificates` in `lib/content.ts` is sourced from actual certificate PDFs
(Anthropic's Claude Certified track and two Microsoft Learn certifications) —
title, issuer, date, credential ID, and the verify link all come straight off
each document. The source PDFs live in `/certificates` locally but aren't
committed (`.gitignore`) — the site doesn't need to serve them, everything it
uses from them is already in `content.ts`, and there's no reason to publish
personal credential documents to a public repo when a link already verifies
each one.

Each card shows an image icon instead of a "verify" link — click it to open
the certificate itself in a full-screen lightbox (`CertificateGrid.tsx` /
`CertificateLightbox.tsx`); the verify link still lives inside the lightbox,
opening in a new tab. The images in `public/certificates/*.jpg` are
rasterized from the first page of each source PDF — the Microsoft ones are
additionally cropped, since those particular PDFs are full browser
print-outs (chrome, dead space) rather than a purpose-made single-page
certificate like the Anthropic ones.

To add another certificate: drop the PDF in `/certificates`, rasterize page 1
to a JPEG in `public/certificates/` (any PDF-to-image tool works — this
project doesn't keep one installed, since it's a one-time step, not something
the app needs at runtime), and add the matching entry — including `image` —
to the `certificates` array. Nothing else reads the `/certificates` folder.

## Notes

- Respects `prefers-reduced-motion`: the scrub snaps instead of easing, and reveals are disabled.
- If the video fails to load, the layer drops out and the page renders on plain black.
- The HUD (frame counter) is hidden below 560px.
