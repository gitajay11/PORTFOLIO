"use client";

import { useEffect, useRef, useState } from "react";
import ScrollHint from "./ScrollHint";

/**
 * Bounded, scroll-scrubbed video intro for the Contact page only — not the
 * whole-document background ScrollVideoBackground uses everywhere else.
 * The track below is a fixed height (not the full page); once you scroll
 * past it the sticky video releases and normal page content continues.
 *
 * Deliberately simpler than ScrollVideoBackground: no side-vs-stacked
 * layout logic, since there's no long name that needs a clear column next
 * to the subject here — just a short line of text, centred.
 */
const BLACK_POINT_FILTER = "brightness(0.914) contrast(1.208)";
const NAT_W = 1280;
const NAT_H = 720;
/** Same watermark box as ScrollVideoBackground — see that file for how it was measured. */
const WATERMARK = { x: 1136, y: 576, w: 48, h: 48 };
const PATCH_BLEED = 6;
const TOTAL_FRAMES = 240;
const EASE = 0.11;
const SEEK_EPS = 1 / 48;

export default function ContactHero() {
  const trackRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const patchRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLSpanElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);

  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [bufferPct, setBufferPct] = useState(0);

  const target = useRef(0);
  const current = useRef(0);
  const duration = useRef(0);
  const readyRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    const track = trackRef.current;
    if (!video || !track) return;

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

    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) onMeta();
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) markReady();
    if (video.error) onError();

    const unlock = () => {
      video.play().then(() => video.pause()).catch(() => {});
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("click", unlock);
    };
    window.addEventListener("touchstart", unlock, { passive: true });
    window.addEventListener("click", unlock);

    safetyTimer = window.setTimeout(markReady, 6000);

    // Local progress: how far the TRACK has scrolled past the top of the
    // viewport, not whole-document progress. 0 while the track's top is at
    // or below the viewport top; 1 once its bottom has cleared the bottom.
    let ticking = false;
    const measure = () => {
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
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
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
   * Simpler than ScrollVideoBackground's version: the video here is sized
   * by CSS alone (width:100%, object-fit:cover), not repositioned in JS, so
   * this only has to read the box back, never write to it.
   */
  useEffect(() => {
    const layout = () => {
      const video = videoRef.current;
      const sticky = stickyRef.current;
      const patch = patchRef.current;
      if (!video || !sticky || !patch) return;

      const vb = video.getBoundingClientRect();
      const sb = sticky.getBoundingClientRect();
      if (!vb.width || !vb.height) return;

      // object-fit: cover, object-position: 50% 0%
      const scale = Math.max(vb.width / NAT_W, vb.height / NAT_H);
      const offsetX = vb.left - sb.left + (vb.width - NAT_W * scale) * 0.5;
      const offsetY = vb.top - sb.top;

      patch.style.left = `${offsetX + (WATERMARK.x - PATCH_BLEED) * scale}px`;
      patch.style.top = `${offsetY + (WATERMARK.y - PATCH_BLEED) * scale}px`;
      patch.style.width = `${(WATERMARK.w + PATCH_BLEED * 2) * scale}px`;
      patch.style.height = `${(WATERMARK.h + PATCH_BLEED * 2) * scale}px`;
    };

    layout();
    let observer: ResizeObserver | undefined;
    if (typeof ResizeObserver !== "undefined" && videoRef.current) {
      observer = new ResizeObserver(layout);
      observer.observe(videoRef.current);
    }
    window.addEventListener("resize", layout);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", layout);
    };
  }, []);

  return (
    <section className="chero" ref={trackRef} aria-label="Contact intro">
      <div className="chero__sticky" ref={stickyRef}>
        {!failed && (
          <video
            ref={videoRef}
            className={`chero__video${ready ? " is-ready" : ""}`}
            src="/AK.mp4"
            style={{ filter: BLACK_POINT_FILTER }}
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
          />
        )}
        {!failed && <div ref={patchRef} className="chero__patch" />}
        <div className="chero__vignette" aria-hidden="true" />

        {!ready && (
          <div className="chero__loader" aria-hidden="true">
            <div className="vidloader__bar">
              <span style={{ width: `${bufferPct}%` }} />
            </div>
            <p className="vidloader__text">{Math.round(bufferPct)}% — buffering frames</p>
          </div>
        )}

        <div className="chero__overlay">
          <p className="hero__kicker chero__kicker--left">
            <span className="dot" /> let&rsquo;s connect
          </p>
          <p className="interlude__text chero__heading chero__heading--right">
            Got something
            <br />
            worth <em>building</em>?
          </p>
        </div>

        <div className="chero__hud" aria-hidden="true">
          <div className="hud__group">
            <span className="hud__label">frame</span>
            <span className="hud__val" ref={frameRef}>
              000
            </span>
            <span className="hud__dim">/{TOTAL_FRAMES}</span>
          </div>
          <div className="hud__group">
            <span className="hud__label">progress</span>
            <span className="hud__val" ref={pctRef}>
              00
            </span>
            <span className="hud__dim">%</span>
          </div>
        </div>

        <ScrollHint />
      </div>
    </section>
  );
}
