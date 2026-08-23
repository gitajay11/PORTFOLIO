"use client";

import { useEffect, useRef, useState } from "react";
import { subscribeToScroll } from "@/lib/scrollProgress";

/**
 * Full-page scroll-scrubbed video background.
 *
 * The video is fixed behind every section and its currentTime is driven by
 * progress through the ENTIRE document — top of the page is frame 0, bottom
 * of the footer is the last frame.
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
 * object-position of the video, as fractions. Y is pinned to the TOP so that
 * when the viewport is wider than 16:9 the overflow is cropped off the bottom
 * of the frame instead of the top — the subject's head has only ~26px of
 * headroom in the source, so a centred crop decapitates him on wide screens.
 */
const OBJECT_POS_X = 0.5;
const OBJECT_POS_Y = 0;

export default function ScrollVideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
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

    const unsubscribe = subscribeToScroll((p) => {
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
      unsubscribe();
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
  }, []);

  /**
   * Keep the watermark patch aligned with the video's rendered content box.
   * Only runs on mount and resize — never per frame.
   */
  useEffect(() => {
    const layout = () => {
      const layer = layerRef.current;
      const video = videoRef.current;
      const patch = patchRef.current;
      if (!layer || !video || !patch) return;

      // Measure the video's own box, not the layer's — the video is inset from
      // the top, so the two differ and the cover maths must use the real box.
      const layerBox = layer.getBoundingClientRect();
      const videoBox = video.getBoundingClientRect();
      const cw = videoBox.width;
      const ch = videoBox.height;
      if (!cw || !ch) return;

      // object-fit: cover, within the video box
      const scale = Math.max(cw / NAT_W, ch / NAT_H);
      const offsetX = videoBox.left - layerBox.left + (cw - NAT_W * scale) * OBJECT_POS_X;
      const offsetY = videoBox.top - layerBox.top + (ch - NAT_H * scale) * OBJECT_POS_Y;

      patch.style.left = `${offsetX + (WATERMARK.x - PATCH_BLEED) * scale}px`;
      patch.style.top = `${offsetY + (WATERMARK.y - PATCH_BLEED) * scale}px`;
      patch.style.width = `${(WATERMARK.w + PATCH_BLEED * 2) * scale}px`;
      patch.style.height = `${(WATERMARK.h + PATCH_BLEED * 2) * scale}px`;
    };

    layout();
    window.addEventListener("resize", layout);
    window.addEventListener("orientationchange", layout);
    return () => {
      window.removeEventListener("resize", layout);
      window.removeEventListener("orientationchange", layout);
    };
  }, []);

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
