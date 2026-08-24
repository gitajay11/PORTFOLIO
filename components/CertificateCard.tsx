"use client";

import type { MouseEvent } from "react";

type Props = {
  badge: string;
  accent: "green" | "blue";
  date: string;
  title: string;
  issuer: string;
  id: string;
  href: string;
};

export default function CertificateCard({
  badge,
  accent,
  date,
  title,
  issuer,
  id,
  href,
}: Props) {
  const onMove = (e: MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <article
      className={`cert cert--${accent}`}
      onMouseMove={onMove}
    >
      <div className="cert__top">
        <span className="cert__badge">{badge}</span>
        <span className="cert__date">{date}</span>
      </div>
      <h3>{title}</h3>
      <p className="cert__issuer">{issuer}</p>
      <div className="cert__foot">
        <span className="cert__id">ID: {id}</span>
        <a className="ilink" href={href}>
          verify <span>&#8599;</span>
        </a>
      </div>
    </article>
  );
}
