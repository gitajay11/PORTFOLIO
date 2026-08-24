"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Full-screen typewriter splash, played once whenever you land on the
 * homepage — same mechanism as the equivalent intro on forgebyte.online
 * (IntroOverlay.tsx there), adapted: colors map to this site's own tokens,
 * and the words are Ajay's own line from About ("small, boring, reliable
 * systems") rather than Forgebyte's tagline. Suppressed on every other
 * route, the same way ScrollVideoBackground suppresses itself on /contact.
 */
const WORDS = [
  { first: "S", rest: "mall" },
  { first: "B", rest: "oring" },
  { first: "R", rest: "eliable" },
] as const;

const TYPE_SPEED = 34;

export default function IntroOverlay() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const [typed, setTyped] = useState(["", "", ""]);
  const [cursorDone, setCursorDone] = useState(false);
  const [hidden, setHidden] = useState(false);

  function closeIntro() {
    setHidden(true);
    document.body.classList.remove("intro-lock");
  }

  useEffect(() => {
    if (!isHome) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.body.classList.remove("intro-lock");
      setHidden(true);
      return;
    }

    document.body.classList.add("intro-lock");

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const sleep = (ms: number) =>
      new Promise<void>((resolve) => timers.push(setTimeout(resolve, ms)));

    (async () => {
      await sleep(500);
      for (let w = 0; w < WORDS.length; w++) {
        const { rest } = WORDS[w];
        for (let i = 1; i <= rest.length; i++) {
          await sleep(TYPE_SPEED);
          if (cancelled) return;
          setTyped((prev) => {
            const next = [...prev];
            next[w] = rest.slice(0, i);
            return next;
          });
        }
      }
      setCursorDone(true);
      await sleep(900);
      if (cancelled) return;
      closeIntro();
    })();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      document.body.classList.remove("intro-lock");
    };
  }, [isHome]);

  if (!isHome) return null;

  return (
    <div id="introOverlay" className={hidden ? "hide" : undefined} aria-hidden="true">
      <button className="intro-skip" type="button" onClick={closeIntro}>
        Skip →
      </button>
      <div className="intro-letters">
        {WORDS.map((word, i) => (
          <span className="intro-word" key={word.first}>
            <span className="intro-first">{word.first}</span>
            <span className="intro-rest">{typed[i]}</span>
            {i === WORDS.length - 1 && (
              <span className={`intro-cursor${cursorDone ? " done" : ""}`} />
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
