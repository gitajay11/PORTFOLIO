"use client";

import { useEffect, useRef, useState } from "react";
import { navSections, profile } from "@/lib/content";
import { subscribeToScroll } from "@/lib/scrollProgress";

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [stuck, setStuck] = useState(false);
  const [active, setActive] = useState<string>("");
  const barRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const unsubscribe = subscribeToScroll((p) => {
      if (barRef.current) barRef.current.style.width = `${p * 100}%`;
      setStuck(window.scrollY > 40);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const targets = navSections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!targets.length || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { threshold: 0.35 }
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <div className="scroll-progress" aria-hidden="true">
        <span ref={barRef} />
      </div>

      <header className={`nav${stuck ? " is-stuck" : ""}`}>
        <a className="nav__brand" href="#top">
          <span className="nav__logo">{profile.initials}</span>
          <span className="nav__brandtext">{profile.wordmark}</span>
        </a>

        <nav
          className={`nav__links${open ? " is-open" : ""}`}
          aria-label="Primary"
          onClick={(e) => {
            if ((e.target as HTMLElement).closest("a")) setOpen(false);
          }}
        >
          {navSections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={active === s.id ? "is-active" : undefined}
            >
              <span className="nav__num">{s.num}</span> {s.label}
            </a>
          ))}
          <a className="nav__cta" href="#contact">
            contact
          </a>
        </nav>

        <button
          className="nav__burger"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
        </button>
      </header>
    </>
  );
}
