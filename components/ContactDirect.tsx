import { profile, socials } from "@/lib/content";
import Reveal from "./Reveal";

/**
 * The direct-contact block on /contact, under the hero. No headline of its
 * own — ContactHero already made the statement — just the fastest way to
 * actually reach him: email and socials.
 */
export default function ContactDirect() {
  return (
    <section className="section section--contact">
      <div className="wrap wrap--center">
        <Reveal>
          <p className="lead lead--center">
            Open to full-time roles, freelance work, and interesting
            problems. Fastest way to reach me is email — or use the form
            below.
          </p>
        </Reveal>
        <Reveal delay={40}>
          <a className="bigmail" href={`mailto:${profile.email}`}>
            {profile.email}
          </a>
        </Reveal>
        <Reveal delay={80}>
          <div className="socials">
            {socials.map((s) => (
              <a key={s.label} href={s.href} className="ilink">
                {s.label} <span>&#8599;</span>
              </a>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
