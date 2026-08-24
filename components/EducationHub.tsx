import { certificates, qualifications } from "@/lib/content";
import HubTile from "./HubTile";
import Reveal from "./Reveal";

const CAP_ICON = (
  <svg viewBox="0 0 24 24">
    <path d="M22 10 12 5 2 10l10 5 10-5Z" />
    <path d="M6 12v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5" />
  </svg>
);

const CERT_ICON = (
  <svg viewBox="0 0 24 24">
    <circle cx="12" cy="9" r="6" />
    <path d="m8.5 14-1.8 7 5.3-2.6 5.3 2.6-1.8-7" />
  </svg>
);

/** /education — hub linking out to the two standalone sub-pages. */
export default function EducationHub() {
  const latestQual = qualifications[0];
  const latestCert = certificates[0];

  return (
    <section className="section" id="education-hub">
      <div className="wrap">
        <Reveal>
          <p className="eyebrow">
            <span className="eyebrow__num">05</span> education
          </p>
        </Reveal>
        <Reveal delay={70}>
          <h2 className="h2">On paper.</h2>
        </Reveal>
        <Reveal delay={110}>
          <p className="lead">
            Two records, kept separate — what school gave him, and what
            he&rsquo;s earned since.
          </p>
        </Reveal>

        <div className="hubtiles">
          <Reveal delay={150}>
            <HubTile
              href="/education/qualification"
              icon={CAP_ICON}
              title="Qualification"
              meta={`${qualifications.length} entries`}
              teaser={`${latestQual.stage} · ${latestQual.years}`}
            />
          </Reveal>
          <Reveal delay={210}>
            <HubTile
              href="/education/certifications"
              icon={CERT_ICON}
              title="Certification"
              meta={`${certificates.length} completed`}
              teaser={`${latestCert.badge} · ${latestCert.date}`}
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
