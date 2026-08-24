# Portfolio — Ajay K

A Next.js portfolio with a scroll-scrubbed video that plays across the **entire**
page: the top of the document is frame 0, the bottom of the footer is frame 240.

```
app/
  layout.tsx        fonts, metadata
  page.tsx          section composition
  globals.css       tokens, layout, responsive
components/
  ScrollVideoBackground.tsx   the fixed, scroll-scrubbed video layer
  Reveal.tsx / Counter.tsx    scroll-triggered animations
  Nav / Hero / Interlude / About / Stack / Work / Path / Contact / Footer
lib/
  content.ts        ALL site copy — edit here
  scrollProgress.ts one scroll listener shared by every component
public/AK.mp4       the hero video
legacy-static/      the original no-framework version, kept for reference
```

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
| Header | top | Solid from the first pixel, not only once stuck |
| Contact dock | bottom centre | LinkedIn, GitHub, WhatsApp, Email |
| AI assistant | bottom left | Launcher plus chat panel |

The frame-counter HUD sits above the dock row and hides below 720px; under
720px the dock shifts off centre so it cannot land under the chat launcher.
Verified for zero overlap between the three at desktop and mobile widths.

### The AI assistant

The widget works with or without an API key, which keeps it useful on a
static host:

- **With a key** — `app/api/chat/route.ts` calls Claude Opus 5 with a system
  prompt built from `lib/content.ts`, so the bot can never drift from what the
  page actually says. Low effort, 512 max tokens, cached system prompt.
- **Without one** — the route returns 503 and the browser answers from the
  keyword rules in `lib/chatKnowledge.ts`. The client remembers that answer
  and stops re-requesting.

To enable the live model, copy `.env.local.example` to `.env.local` and add
your key. `.env.local` is gitignored; never commit a real key.

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
- LINKEDIN_URL and WHATSAPP_NUMBER in lib/content.ts are placeholders
- Every `href: "#"` in `projects` and `socials`

The email is real: `ajayak15012004@gmail.com`.

## Notes

- Respects `prefers-reduced-motion`: the scrub snaps instead of easing, and reveals are disabled.
- If the video fails to load, the layer drops out and the page renders on plain black.
- The HUD (frame counter) is hidden below 560px.
