"use client";

import { useEffect, useState } from "react";
import { profile } from "@/lib/content";

/** Shows the floating back-to-top button only once there's somewhere to
    scroll back from — otherwise it'd float over the hero for no reason. */
const SHOW_AFTER_PX = 480;

export default function Footer() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER_PX);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <footer className="footer">
      <span>
        &copy; {new Date().getFullYear()} {profile.wordmark}
      </span>

      <a
        href="#top"
        className={`footer__top${visible ? " is-visible" : ""}`}
        aria-label="Back to top"
      >
        &#8593;
      </a>
    </footer>
  );
}
