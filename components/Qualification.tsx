import { qualifications } from "@/lib/content";
import Reveal from "./Reveal";

const ICONS = {
  cap: (
    <svg viewBox="0 0 24 24">
      <path d="M22 10 12 5 2 10l10 5 10-5Z" />
      <path d="M6 12v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5" />
    </svg>
  ),
  book: (
    <svg viewBox="0 0 24 24">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
    </svg>
  ),
} as const;

/** /education/qualification — the school-to-degree timeline. */
export default function Qualification() {
  return (
    <section className="section" id="qualification">
      <div className="wrap">
        <Reveal>
          <p className="eyebrow">
            <span className="eyebrow__num">05</span>
            <a href="/education" className="eyebrow__crumb">
              education
            </a>
            <span className="eyebrow__sep">/</span> qualification
          </p>
        </Reveal>
        <Reveal delay={70}>
          <h2 className="h2">Where it began.</h2>
        </Reveal>
        <Reveal delay={110}>
          <p className="lead">
            The classrooms and campuses before the codebases — newest first.
          </p>
        </Reveal>

        <ol className="qual">
          {qualifications.map((item, i) => (
            <li key={item.years}>
              <Reveal delay={i * 60}>
                <div className="qual__item">
                  <span className="qual__node" aria-hidden="true">
                    {ICONS[item.icon]}
                  </span>
                  <div className="qual__head">
                    <span className="qual__stage">{item.stage}</span>
                    <span className="qual__years">{item.years}</span>
                  </div>
                  <h3 className="qual__school">{item.school}</h3>
                  <p className="qual__field">{item.field}</p>
                  <div className="qual__meta">
                    <span className="qual__score">
                      <b>{item.score.split(" ")[0]}</b>{" "}
                      {item.score.split(" ").slice(1).join(" ")}
                    </span>
                    <span className="qual__loc">{item.location}</span>
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
