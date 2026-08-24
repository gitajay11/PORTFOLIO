import { certificates } from "@/lib/content";
import CertificateCard from "./CertificateCard";
import Reveal from "./Reveal";

export default function Certifications() {
  return (
    <section className="section section--alt" id="certifications">
      <div className="wrap">
        <Reveal>
          <p className="eyebrow">
            <span className="eyebrow__num">06</span> certifications
          </p>
        </Reveal>
        <Reveal delay={70}>
          <h2 className="h2">The paper trail.</h2>
        </Reveal>
        <Reveal delay={110}>
          <p className="lead">
            Courses and exams finished end to end — not just started.
          </p>
        </Reveal>

        <div className="certs">
          {certificates.map((cert, i) => (
            <Reveal key={cert.id} delay={i * 60}>
              <CertificateCard {...cert} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
