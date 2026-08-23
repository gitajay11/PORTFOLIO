import { timeline } from "@/lib/content";
import Reveal from "./Reveal";

export default function Path() {
  return (
    <section className="section section--alt" id="path">
      <div className="wrap">
        <Reveal>
          <p className="eyebrow">
            <span className="eyebrow__num">04</span> path
          </p>
        </Reveal>
        <Reveal delay={70}>
          <h2 className="h2">How I got here.</h2>
        </Reveal>
        <ol className="timeline">
          {timeline.map((item, i) => (
            <li key={item.year}>
              <Reveal delay={i * 60}>
                <div className="tl">
                  <span className="tl__year">{item.year}</span>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
