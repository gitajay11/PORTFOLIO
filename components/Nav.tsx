"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { navSections, profile } from "@/lib/content";
import { subscribeToScroll } from "@/lib/scrollProgress";

export default function Nav() {
  const pathname = usePathname();
  const isHome = pathname === "/";

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

  // Same-page section highlighting only makes sense on the homepage — the
  // other nav entries are `#id` anchors that only exist there. On any other
  // route, "education" is the only entry that can be active, by path.
  useEffect(() => {
    if (!isHome || typeof IntersectionObserver === "undefined") return;

    const targets = navSections
      .filter((s) => !("href" in s))
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!targets.length) return;

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
  }, [isHome]);

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

  // Every other nav entry is a same-page `#id` anchor. That only works
  // directly while already on the homepage; from any other route it has to
  // route home first, so it becomes a real "/#id" link there instead.
  const homeHref = (id: string) => (isHome ? `#${id}` : `/#${id}`);

  return (
    <>
      <div className="scroll-progress" aria-hidden="true">
        <span ref={barRef} />
      </div>

      <header className={`nav${stuck ? " is-stuck" : ""}`}>
        <a className="nav__brand" href={isHome ? "#top" : "/"}>
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
          {navSections.map((s) => {
            const hasOwnRoute = "href" in s;
            const href = hasOwnRoute ? s.href : homeHref(s.id);
            const isActive = hasOwnRoute
              ? pathname.startsWith(s.href)
              : isHome && active === s.id;
            return (
              <a key={s.id} href={href} className={isActive ? "is-active" : undefined}>
                <span className="nav__num">{s.num}</span> {s.label}
              </a>
            );
          })}
          <a
            className={`nav__cta${pathname.startsWith("/contact") ? " is-active" : ""}`}
            href="/contact"
          >
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
