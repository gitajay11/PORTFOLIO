"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { subscribeToScroll } from "@/lib/scrollProgress";

/**
 * Routes that render their own local, bounded video hero (see ContactHero)
 * instead of this whole-document background. Kept as a route allowlist-of-
 * exclusions rather than inverting the check, since every other current and
 * future route should get the global treatment by default.
 */
const ROUTES_WITHOUT_GLOBAL_VIDEO = ["/contact"];

/**
 * Full-page scroll-scrubbed video background on desktop; a bounded 4:5
 * block at the top of the document on mobile (see the `isMobile` branch
 * near the bottom) — full-bleed fixed footage reads as too heavy on a
 * phone, so below WIDE_QUERY it becomes a normal in-flow block instead,
 * using the same sticky-track scrub technique as ContactHero, just
 * shorter and narrower. Either way the video's currentTime is driven by
 * scroll progress: the whole document on desktop, just its own track on
 * mobile.
 *
 * The source clip sits on a near-black backdrop (RGB 13–21). The filter is a
 * linear black-point lift that maps everything below ~9% to 0 while leaving
 * white at 255, so the backdrop renders as true #000 and blends seamlessly
 * into the page. Derived as: out = x*b*c + 0.5*(1-c), solved for a slope of
 * 1.104 and an intercept of -0.104.
 */
const BLACK_POINT_FILTER = "brightness(0.914) contrast(1.208)";

const TOTAL_FRAMES = 240;
const EASE = 0.11; // lerp toward the scroll target; lower = smoother, laggier
const SEEK_EPS = 1 / 48; // ignore sub-half-frame deltas

/** Intrinsic size of AK.mp4. */
const NAT_W = 1280;
const NAT_H = 720;

/**
 * The source clip carries a static generator watermark — a 48x48 sparkle whose
 * bounding box was measured at [1136,576]–[1183,623] and is byte-identical in
 * every frame. A 24px ring around it is luminance 0 at every timestamp, so
 * covering it with a solid #000 patch is an exact removal, not an approximation.
 *
 * The patch has to be positioned in JS: the video is object-fit: cover, so its
 * rendered box is not the element box and CSS percentages would not track it.
 */
const WATERMARK = { x: 1136, y: 576, w: 48, h: 48 };
const PATCH_BLEED = 6; // safe — surroundings are pure black for 24px

/**
 * Subject geometry, measured from the union silhouette across all frames.
 *  - SUBJ_CX      horizontal centre of the head.
 *  - SUBJ_EDGE_X  a conservative left edge of the body: the silhouette stays
 *                 right of this down to roughly collar level, so it is what
 *                 the hero text column is allowed to butt up against.
 * The frame's leftmost columns are black at every row (the silhouette never
 * reaches x < 162), which is what makes sliding the video sideways seamless:
 * the strip it uncovers is page-black meeting video-black.
 */
const SUBJ_CX = 645;
const SUBJ_EDGE_X = 300;
/** Bottom of the head in source px — the line the stacked hero must clear. */
const FACE_BOTTOM_Y = 420;

/**
 * Where the subject's centre should sit, as a fraction of viewport width.
 * On desktop he is pushed right so the name has a clear column beside him;
 * on narrow screens (including the mobile block) he stays centred.
 */
const SUBJ_TARGET_WIDE = 0.7;
const SUBJ_TARGET_NARROW = 0.5;
const WIDE_QUERY = "(min-width: 900px)";
/** Exact complement of WIDE_QUERY — the two must partition cleanly. */
const MOBILE_QUERY = "(max-width: 899px)";

/**
 * The side-by-side hero is only used when the column beside the subject can
 * actually hold the name. A fixed breakpoint is not enough: the subject is
 * scaled to cover, so a tall or near-square viewport enlarges him and squeezes
 * the column even at a generous width. These mirror the CSS so the viability
 * test matches what will really be rendered.
 */
const heroPadFor = (cw: number) => Math.min(56, Math.max(20, cw * 0.05));
const titlePxFor = (cw: number) => Math.min(118.4, Math.max(48, cw * 0.074));
const COLUMN_GAP = 32;
/** "KUMAR" measures ~3.3em at the hero's weight and tracking. */
const TITLE_EM_WIDTH = 3.35;

/** Matches --video-top-inset in globals.css: clamp(20px, 5.5vh, 68px). */
const topInsetFor = (h: number) => Math.min(68, Math.max(20, h * 0.055));

export default function ScrollVideoBackground() {
  const pathname = usePathname();
  const suppressed = ROUTES_WITHOUT_GLOBAL_VIDEO.includes(pathname);

  const [isMobile, setIsMobile] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  /** Points at whichever box is currently mounted — the desktop fixed layer
      or the mobile sticky box — since only one of them ever renders. */
  const layerRef = useRef<HTMLDivElement>(null);
  /** Mobile-only: the tall scroll track .mvid__sticky pins inside. */
  const trackRef = useRef<HTMLDivElement>(null);
  const patchRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLSpanElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);

  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [bufferPct, setBufferPct] = useState(0);

  // Mutable animation state kept in refs — never triggers a re-render.
  const target = useRef(0);
  const current = useRef(0);
  const duration = useRef(0);
  const readyRef = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    setIsMobile(mq.matches);
    const onChange = () => setIsMobile(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let readyTimer: number | undefined;
    let safetyTimer: number | undefined;

    const markReady = () => {
      if (readyRef.current) return;
      readyRef.current = true;
      setBufferPct(100);
      setReady(true);
    };

    const onMeta = () => {
      duration.current = video.duration || 10;
      // Jump straight to the right frame if the browser restored a scroll position.
      current.current = target.current;
      try {
        video.currentTime = current.current;
      } catch {
        /* not seekable yet */
      }
    };

    const onProgress = () => {
      if (readyRef.current || !video.buffered.length || !duration.current) return;
      const end = video.buffered.end(video.buffered.length - 1);
      setBufferPct(Math.min(99, (end / duration.current) * 100));
    };

    const onLoadedData = () => {
      // Enough frames to start — don't wait for the whole file.
      readyTimer = window.setTimeout(markReady, 400);
    };

    const onError = () => {
      setFailed(true);
      markReady();
    };

    video.addEventListener("loadedmetadata", onMeta);
    video.addEventListener("progress", onProgress);
    video.addEventListener("loadeddata", onLoadedData);
    video.addEventListener("canplaythrough", markReady);
    video.addEventListener("error", onError);

    // A cached or fast-loading file can reach HAVE_ENOUGH_DATA before this
    // effect runs, so those events would never fire again. Sync from whatever
    // state the element is already in.
    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) onMeta();
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) markReady();
    if (video.error) onError();

    // Some mobile browsers won't decode until the element sees a gesture.
    const unlock = () => {
      video.play().then(() => video.pause()).catch(() => {});
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("click", unlock);
    };
    window.addEventListener("touchstart", unlock, { passive: true });
    window.addEventListener("click", unlock);

    // Never strand the loader on a slow connection.
    safetyTimer = window.setTimeout(markReady, 6000);

    // Desktop: target is driven by whole-document scroll progress. Mobile:
    // driven by local progress through this component's own track, exactly
    // like ContactHero — 0 while the track's top is at or below the
    // viewport top, 1 once its bottom has cleared the bottom.
    let unsubscribeScroll: () => void;
    if (isMobile) {
      const track = trackRef.current;
      let ticking = false;
      const measure = () => {
        if (!track) return;
        const rect = track.getBoundingClientRect();
        const scrollable = rect.height - window.innerHeight;
        const p = scrollable > 0 ? Math.min(1, Math.max(0, -rect.top / scrollable)) : 0;
        target.current = p * duration.current;
      };
      const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          measure();
          ticking = false;
        });
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      measure();
      unsubscribeScroll = () => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      };
    } else {
      unsubscribeScroll = subscribeToScroll((p) => {
        target.current = p * duration.current;

        // Scrim darkens once the hero is behind us so body copy stays readable
        // over the moving footage. Ramps across the first viewport of scroll.
        if (scrimRef.current) {
          const docScroll = document.documentElement.scrollHeight - window.innerHeight;
          const heroFraction = docScroll > 0 ? window.innerHeight / docScroll : 1;
          const ramp = Math.min(1, heroFraction > 0 ? p / heroFraction : 1);
          scrimRef.current.style.opacity = String(0.42 + ramp * 0.38);
        }
      });
    }

    const tick = () => {
      if (readyRef.current && duration.current) {
        if (reduceMotion) {
          current.current = target.current;
        } else {
          current.current += (target.current - current.current) * EASE;
          if (Math.abs(target.current - current.current) < 0.0008) {
            current.current = target.current;
          }
        }

        // Only seek when the decoder is idle. Queuing seeks onto a busy
        // element is what turns naive scrubbing into a stutter.
        if (!video.seeking && Math.abs(video.currentTime - current.current) > SEEK_EPS) {
          try {
            video.currentTime = current.current;
          } catch {
            /* transient */
          }
        }

        const p = current.current / (duration.current || 1);
        if (frameRef.current) {
          frameRef.current.textContent = String(Math.round(p * TOTAL_FRAMES)).padStart(3, "0");
        }
        if (pctRef.current) {
          pctRef.current.textContent = String(Math.round(p * 100)).padStart(2, "0");
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      unsubscribeScroll();
      window.clearTimeout(readyTimer);
      window.clearTimeout(safetyTimer);
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("click", unlock);
      video.removeEventListener("loadedmetadata", onMeta);
      video.removeEventListener("progress", onProgress);
      video.removeEventListener("loadeddata", onLoadedData);
      video.removeEventListener("canplaythrough", markReady);
      video.removeEventListener("error", onError);
    };
  }, [isMobile]);

  /**
   * Keep the watermark patch aligned with the video's rendered content box.
   * Only runs on mount, resize, and whenever the mobile/desktop markup
   * swaps (layerRef then points at a differently-sized box). The math is
   * container-size-agnostic — it reads layer.clientWidth/clientHeight
   * directly — so the same function positions both the small mobile box
   * and the full desktop layer without a separate branch.
   */
  useEffect(() => {
    const layout = () => {
      const layer = layerRef.current;
      const video = videoRef.current;
      const patch = patchRef.current;
      if (!layer || !video) return;

      const cw = layer.clientWidth;
      const chFull = layer.clientHeight;
      if (!cw || !chFull) return;

      const inset = topInsetFor(chFull);
      // Cover the area below the inset, preserving aspect.
      const scale = Math.max(cw / NAT_W, (chFull - inset) / NAT_H);
      const renderedW = NAT_W * scale;
      const renderedH = NAT_H * scale;

      // Would the side-by-side hero actually fit? Try it, measure the column
      // it would leave, and fall back to the stacked layout if it is too tight.
      // Never applicable on the mobile block — WIDE_QUERY can't match below
      // 900px — so this naturally collapses to the centred target there.
      const minLeft = cw - renderedW;
      const sideLeft = Math.max(SUBJ_TARGET_WIDE * cw - SUBJ_CX * scale, minLeft);
      const sideColumn =
        sideLeft + SUBJ_EDGE_X * scale - heroPadFor(cw) - COLUMN_GAP;
      const useSide =
        window.matchMedia(WIDE_QUERY).matches &&
        sideColumn >= titlePxFor(cw) * TITLE_EM_WIDTH;

      const target = (useSide ? SUBJ_TARGET_WIDE : SUBJ_TARGET_NARROW) * cw;

      // Place the subject at the target, then guarantee the right edge stays
      // covered. Uncovering the LEFT is fine — that strip is black either way.
      let left = target - SUBJ_CX * scale;
      left = Math.max(left, minLeft);
      if (!useSide) left = Math.min(left, 0);

      document.documentElement.dataset.heroLayout = useSide ? "side" : "stacked";

      // Drive the element geometry directly rather than leaning on object-fit,
      // so the horizontal offset can't turn into a mid-body crop.
      video.style.left = `${left}px`;
      video.style.top = `${inset}px`;
      video.style.width = `${renderedW}px`;
      video.style.height = `${renderedH}px`;

      // Hand the hero the two lines it needs to stay clear of: the column
      // beside the subject, and the bottom of his head. Unused on mobile —
      // .hero gets a fixed top padding there instead, since the video is no
      // longer behind it — but harmless to keep publishing.
      const root = document.documentElement.style;
      root.setProperty("--subject-left", `${Math.round(left + SUBJ_EDGE_X * scale)}px`);
      root.setProperty("--face-bottom", `${Math.round(inset + FACE_BOTTOM_Y * scale)}px`);

      if (patch) {
        patch.style.left = `${left + (WATERMARK.x - PATCH_BLEED) * scale}px`;
        patch.style.top = `${inset + (WATERMARK.y - PATCH_BLEED) * scale}px`;
        patch.style.width = `${(WATERMARK.w + PATCH_BLEED * 2) * scale}px`;
        patch.style.height = `${(WATERMARK.h + PATCH_BLEED * 2) * scale}px`;
      }
    };

    layout();

    // A ResizeObserver on the layer is the reliable trigger: it fires for any
    // change to the element's box, including ones that never raise a window
    // "resize" event (scrollbar appearing, viewport emulation, split panes).
    let observer: ResizeObserver | undefined;
    if (typeof ResizeObserver !== "undefined" && layerRef.current) {
      observer = new ResizeObserver(layout);
      observer.observe(layerRef.current);
    }
    window.addEventListener("resize", layout);
    window.addEventListener("orientationchange", layout);

    // Crossing the desktop/mobile breakpoint swaps the subject's target
    // position even when the layer's box happens not to change.
    const mq = window.matchMedia(WIDE_QUERY);
    mq.addEventListener("change", layout);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", layout);
      window.removeEventListener("orientationchange", layout);
      mq.removeEventListener("change", layout);
    };
  }, [isMobile]);

  // After all hooks, never before — this only changes what renders, not
  // how many hooks run, so it doesn't violate the rules of hooks. The
  // effects above still fire on a suppressed route; they no-op harmlessly
  // since videoRef/layerRef never attach to anything.
  if (suppressed) return null;

  if (isMobile) {
    return (
      <>
        {/* In-flow, not fixed: this pushes the rest of the page down instead
            of sitting behind it. .mvid is a tall scroll track; .mvid__sticky
            pins to the top of the viewport for the ride, same technique as
            ContactHero's .chero/.chero__sticky. */}
        <div className="mvid" ref={trackRef}>
          <div className="mvid__sticky" ref={layerRef}>
            {!failed && (
              <video
                ref={videoRef}
                className={`mvid__video${ready ? " is-ready" : ""}`}
                src="/AK.mp4"
                style={{ filter: BLACK_POINT_FILTER }}
                muted
                playsInline
                preload="auto"
                disablePictureInPicture
              />
            )}
            {!failed && <div ref={patchRef} className="mvid__patch" />}
            <div className="mvid__grain" />
          </div>
        </div>

        {!ready && (
          <div className="vidloader" aria-hidden="true">
            <div className="vidloader__bar">
              <span style={{ width: `${bufferPct}%` }} />
            </div>
            <p className="vidloader__text">{Math.round(bufferPct)}% — buffering frames</p>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      {/* Fixed layer behind the whole document. */}
      <div className="videoLayer" ref={layerRef} aria-hidden="true">
        {!failed && (
          <video
            ref={videoRef}
            className={`videoLayer__video${ready ? " is-ready" : ""}`}
            src="/AK.mp4"
            style={{ filter: BLACK_POINT_FILTER }}
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
          />
        )}
        {/* Covers the generator watermark; matches the crushed backdrop exactly. */}
        {!failed && <div ref={patchRef} className="videoLayer__patch" />}
        <div ref={scrimRef} className="videoLayer__scrim" style={{ opacity: 0.42 }} />
        <div className="videoLayer__grain" />
      </div>

      {/* Siblings, not children: a fixed element creates a stacking context,
          so anything nested inside .videoLayer would sit under the page. */}
      {!ready && (
        <div className="vidloader" aria-hidden="true">
          <div className="vidloader__bar">
            <span style={{ width: `${bufferPct}%` }} />
          </div>
          <p className="vidloader__text">{Math.round(bufferPct)}% — buffering frames</p>
        </div>
      )}

      <div className="hud" aria-hidden="true">
        <div className="hud__group">
          <span className="hud__label">frame</span>
          <span className="hud__val" ref={frameRef}>000</span>
          <span className="hud__dim">/{TOTAL_FRAMES}</span>
        </div>
        <div className="hud__group">
          <span className="hud__label">progress</span>
          <span className="hud__val" ref={pctRef}>00</span>
          <span className="hud__dim">%</span>
        </div>
      </div>
    </>
  );
}
