import { aboutParagraphs, stats } from "@/lib/content";
import Counter from "./Counter";
import Reveal from "./Reveal";

export default function About() {
  return (
    <section className="section" id="about">
      <div className="wrap wrap--split">
        <div className="col-left">
          <Reveal>
            <p className="eyebrow">
              <span className="eyebrow__num">01</span> about
            </p>
          </Reveal>
          <Reveal delay={70}>
            <h2 className="h2">
              Engineer first,
              <br />
              pixel-pusher second.
            </h2>
          </Reveal>
        </div>

        <div className="col-right">
          <Reveal>
            <div className="terminal">
              <div className="terminal__bar">
                <i className="tdot tdot--r" />
                <i className="tdot tdot--y" />
                <i className="tdot tdot--g" />
                <span className="terminal__name">~/about/ajay.ts</span>
              </div>
              <pre className="terminal__body">
                <code>
                  <span className="c-key">const</span> <span className="c-var">ajay</span>{" "}
                  <span className="c-op">=</span> {"{"}
                  {"\n  "}
                  <span className="c-prop">role</span>:{" "}
                  <span className="c-str">&quot;Full-stack Developer&quot;</span>,
                  {"\n  "}
                  <span className="c-prop">based</span>:{" "}
                  <span className="c-str">&quot;Chennai, Tamil Nadu&quot;</span>,
                  {"\n  "}
                  <span className="c-prop">focus</span>: [
                  <span className="c-str">&quot;web performance&quot;</span>,{" "}
                  <span className="c-str">&quot;DX&quot;</span>],
                  {"\n  "}
                  <span className="c-prop">obsessions</span>: [
                  <span className="c-str">&quot;type safety&quot;</span>,{" "}
                  <span className="c-str">&quot;60fps&quot;</span>],
                  {"\n  "}
                  <span className="c-prop">currently</span>:{" "}
                  <span className="c-str">&quot;shipping side projects&quot;</span>,
                  {"\n"}
                  {"};"}
                </code>
              </pre>
            </div>
          </Reveal>

          {aboutParagraphs.map((p, i) => (
            <Reveal key={i} delay={i * 70}>
              <p className="lead">{p}</p>
            </Reveal>
          ))}

          <Reveal>
            <div className="stats">
              {stats.map((s) => (
                <div className="stat" key={s.label}>
                  <Counter value={s.value} />
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
