/**
 * A single source of truth for "how far down the whole document are we".
 *
 * One scroll listener, one rAF tick, many subscribers. Subscribers get a
 * plain number and are expected to touch the DOM imperatively rather than
 * calling setState — at 60fps a React re-render per frame would drop the
 * video scrub to a slideshow.
 */

type Listener = (progress: number) => void;

const listeners = new Set<Listener>();
let progress = 0;
let started = false;
let ticking = false;

function measure(): number {
  const doc = document.documentElement;
  const scrollable = doc.scrollHeight - window.innerHeight;
  if (scrollable <= 0) return 0;
  const p = window.scrollY / scrollable;
  return p < 0 ? 0 : p > 1 ? 1 : p;
}

function emit() {
  progress = measure();
  listeners.forEach((fn) => fn(progress));
}

function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    emit();
    ticking = false;
  });
}

/** Idempotent — safe to call from every component that needs progress. */
export function startScrollTracking() {
  if (started || typeof window === "undefined") return;
  started = true;
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", emit);
  // Fonts and images settle after hydration and change document height.
  window.addEventListener("load", emit);
  emit();
}

export function subscribeToScroll(fn: Listener): () => void {
  startScrollTracking();
  listeners.add(fn);
  fn(progress);
  return () => {
    listeners.delete(fn);
  };
}

export function getScrollProgress(): number {
  return progress;
}
