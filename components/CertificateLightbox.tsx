"use client";

import { useEffect } from "react";

type Cert = {
  title: string;
  issuer: string;
  date: string;
  href: string;
  image: string;
};

type Props = {
  cert: Cert;
  onClose: () => void;
};

/** Full-screen preview of a certificate image, opened from CertificateCard. */
export default function CertificateLightbox({ cert, onClose }: Props) {
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
      aria-label={cert.title}
      onClick={onClose}
    >
      <button className="lightbox__close" onClick={onClose} aria-label="Close">
        &#10005;
      </button>

      <figure className="lightbox__frame" onClick={(e) => e.stopPropagation()}>
        {/* eslint-disable-next-line @next/next/no-img-element -- fixed local
            assets in public/, not worth the Image component's overhead here */}
        <img className="lightbox__img" src={cert.image} alt={cert.title} />
        <figcaption className="lightbox__caption">
          <div>
            <strong>{cert.title}</strong>
            <span>
              {cert.issuer} &middot; {cert.date}
            </span>
          </div>
          <a className="ilink" href={cert.href} target="_blank" rel="noopener noreferrer">
            verify <span>&#8599;</span>
          </a>
        </figcaption>
      </figure>
    </div>
  );
}
