"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { subscribeToScroll } from "@/lib/scrollProgress";

type Props = {
  children: ReactNode;
  className?: string;
  /** Stagger in ms, for siblings that should cascade. */
  delay?: number;
};

/**
 * Fades content up as it enters the viewport.
 *
 * The bottom rootMargin means anything sitting inside that band when the page
 * bottoms out would never cross the threshold, so a scroll subscription
 * force-reveals everything once the document is fully scrolled.
 */
export default function Reveal({ children, className = "", delay = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setShown(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          window.setTimeout(() => setShown(true), delay);
          observer.disconnect();
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);

    const unsubscribe = subscribeToScroll((p) => {
      if (p > 0.995) setShown(true);
    });

    return () => {
      observer.disconnect();
      unsubscribe();
    };
  }, [delay]);

  return (
    <div ref={ref} className={`reveal${shown ? " is-in" : ""} ${className}`.trim()}>
      {children}
    </div>
  );
}
