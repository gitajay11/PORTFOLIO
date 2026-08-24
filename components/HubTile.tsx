"use client";

import type { MouseEvent, ReactNode } from "react";

type Props = {
  href: string;
  icon: ReactNode;
  title: string;
  meta: string;
  teaser: string;
};

/** A clickable card on the /education hub, linking to a standalone sub-page. */
export default function HubTile({ href, icon, title, meta, teaser }: Props) {
  const onMove = (e: MouseEvent<HTMLAnchorElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <a className="hubtile" href={href} onMouseMove={onMove}>
      <div className="hubtile__top">
        <span className="hubtile__ico" aria-hidden="true">
          {icon}
        </span>
        <span className="hubtile__meta">{meta}</span>
      </div>
      <h3>{title}</h3>
      <p className="hubtile__teaser">{teaser}</p>
      <span className="ilink">
        view <span>&#8599;</span>
      </span>
    </a>
  );
}
