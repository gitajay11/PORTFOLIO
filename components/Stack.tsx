import { stackCards } from "@/lib/content";
import Reveal from "./Reveal";
import StackCard from "./StackCard";

export default function Stack() {
  return (
    <section className="section section--alt" id="stack">
      <div className="wrap">
        <Reveal>
          <p className="eyebrow">
            <span className="eyebrow__num">02</span> stack
          </p>
        </Reveal>
        <Reveal delay={70}>
          <h2 className="h2">Tools I reach for.</h2>
        </Reveal>
        <div className="stack-grid">
          {stackCards.map((card, i) => (
            <Reveal key={card.title} delay={i * 90}>
              <StackCard {...card} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
