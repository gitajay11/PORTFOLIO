"use client";

import { useState } from "react";
import { certificates } from "@/lib/content";
import CertificateCard from "./CertificateCard";
import CertificateLightbox from "./CertificateLightbox";
import Reveal from "./Reveal";

/** Owns which certificate (if any) is open in the lightbox, shared by all cards. */
export default function CertificateGrid() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <div className="certs">
        {certificates.map((cert, i) => (
          <Reveal key={cert.id} delay={i * 60}>
            <CertificateCard {...cert} onOpen={() => setOpenIndex(i)} />
          </Reveal>
        ))}
      </div>

      {openIndex !== null && (
        <CertificateLightbox
          cert={certificates[openIndex]}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </>
  );
}
