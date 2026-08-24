"use client";

import type { MouseEvent } from "react";

type Props = {
  badge: string;
  accent: "green" | "blue";
  date: string;
  title: string;
  issuer: string;
  id: string;
  onOpen: () => void;
};

export default function CertificateCard({
  badge,
  accent,
  date,
  title,
  issuer,
  id,
  onOpen,
}: Props) {
  const onMove = (e: MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <article className={`cert cert--${accent}`} onMouseMove={onMove}>
      <div className="cert__top">
        <span className="cert__badge">{badge}</span>
        <span className="cert__date">{date}</span>
      </div>
      <h3>{title}</h3>
      <p className="cert__issuer">{issuer}</p>
      <div className="cert__foot">
        <span className="cert__id">ID: {id}</span>
        <button
          type="button"
          className="cert__view"
          onClick={onOpen}
          aria-label={`View the ${title} certificate`}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3" y="4.5" width="18" height="15" rx="2" />
            <circle cx="8.5" cy="10" r="1.6" />
            <path d="m4 16.5 5-4.5 3.5 3 4-4L20 15" />
          </svg>
        </button>
      </div>
    </article>
  );
}
