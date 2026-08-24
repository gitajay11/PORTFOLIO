import { education } from "@/lib/content";
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

export default function Education() {
  return (
    <section className="section" id="education">
      <div className="wrap">
        <Reveal>
          <p className="eyebrow">
            <span className="eyebrow__num">05</span> education
          </p>
        </Reveal>
        <Reveal delay={70}>
          <h2 className="h2">Where it began.</h2>
        </Reveal>
        <Reveal delay={110}>
          <p className="lead">
            The classrooms and campuses before the codebases — newest first,
            same as the path above it.
          </p>
        </Reveal>

        <ol className="edu">
          {education.map((item, i) => (
            <li key={item.years}>
              <Reveal delay={i * 60}>
                <div className="edu__item">
                  <span className="edu__node" aria-hidden="true">
                    {ICONS[item.icon]}
                  </span>
                  <div className="edu__head">
                    <span className="edu__stage">{item.stage}</span>
                    <span className="edu__years">{item.years}</span>
                  </div>
                  <h3 className="edu__school">{item.school}</h3>
                  <p className="edu__field">{item.field}</p>
                  <div className="edu__meta">
                    <span className="edu__score">
                      <b>{item.score.split(" ")[0]}</b>{" "}
                      {item.score.split(" ").slice(1).join(" ")}
                    </span>
                    <span className="edu__loc">{item.location}</span>
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
