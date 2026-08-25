import { profile } from "@/lib/content";
import ScrollHint from "./ScrollHint";

export default function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="hero__inner">
        <p className="hero__kicker">
          <span className="dot" /> {profile.status}
        </p>
        <h1 className="hero__title">
          <span className="line">
            <span>{profile.wordmark}</span>
          </span>
        </h1>
        <p className="hero__role">
          <span className="accent">&lt;</span>&nbsp;{profile.role}&nbsp;
          <span className="accent">/&gt;</span>
        </p>
      </div>
      <ScrollHint />
    </section>
  );
}
