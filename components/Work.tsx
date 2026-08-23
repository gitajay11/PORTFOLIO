import { projects } from "@/lib/content";
import Reveal from "./Reveal";

export default function Work() {
  return (
    <section className="section" id="work">
      <div className="wrap">
        <Reveal>
          <p className="eyebrow">
            <span className="eyebrow__num">03</span> work
          </p>
        </Reveal>
        <Reveal delay={70}>
          <h2 className="h2">Selected projects.</h2>
        </Reveal>

        <div className="projects">
          {projects.map((p, i) => (
            <Reveal key={p.title} delay={i * 60}>
              <article className="project">
                <div className="project__idx">{String(i + 1).padStart(2, "0")}</div>
                <div className="project__body">
                  <h3 className="project__title">{p.title}</h3>
                  <p className="project__desc">{p.body}</p>
                  <ul className="tags tags--sm">
                    {p.tags.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
                <div className="project__links">
                  <a href={p.live} className="ilink">
                    live <span>&#8599;</span>
                  </a>
                  <a href={p.code} className="ilink">
                    code <span>&#8599;</span>
                  </a>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
