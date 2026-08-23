"use client";

import type { MouseEvent } from "react";

type Props = {
  icon: string;
  title: string;
  body: string;
  tags: string[];
};

export default function StackCard({ icon, title, body, tags }: Props) {
  const onMove = (e: MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <article className="card" onMouseMove={onMove}>
      <div className="card__ico">{icon}</div>
      <h3>{title}</h3>
      <p>{body}</p>
      <ul className="tags">
        {tags.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </article>
  );
}
