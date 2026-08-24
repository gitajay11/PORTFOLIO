"use client";

import { useEffect } from "react";

type Qual = {
  school: string;
  field: string;
  years: string;
  score: string;
  image: string;
};

type Props = {
  qual: Qual;
  onClose: () => void;
};

/** Full-screen preview of a qualification certificate, opened from Qualification.tsx. */
export default function QualificationLightbox({ qual, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={qual.school}
      onClick={onClose}
    >
      <button className="lightbox__close" onClick={onClose} aria-label="Close">
        &#10005;
      </button>

      <figure className="lightbox__frame" onClick={(e) => e.stopPropagation()}>
        {/* eslint-disable-next-line @next/next/no-img-element -- fixed local
            assets in public/, not worth the Image component's overhead here */}
        <img className="lightbox__img" src={qual.image} alt={qual.school} />
        <figcaption className="lightbox__caption">
          <div>
            <strong>{qual.school}</strong>
            <span>
              {qual.field} &middot; {qual.years} &middot; {qual.score}
            </span>
          </div>
        </figcaption>
      </figure>
    </div>
  );
}
