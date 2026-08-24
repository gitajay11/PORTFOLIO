import { profile, socials } from "@/lib/content";
import Reveal from "./Reveal";

export default function Contact() {
  return (
    <section className="section section--contact" id="contact">
      <div className="wrap wrap--center">
        <Reveal>
          <p className="eyebrow">
            <span className="eyebrow__num">07</span> contact
          </p>
        </Reveal>
        <Reveal delay={70}>
          <h2 className="h2 h2--xl">
            Let&rsquo;s build
            <br />
            something.
          </h2>
        </Reveal>
        <Reveal delay={110}>
          <p className="lead lead--center">
            Open to full-time roles, freelance work, and interesting problems.
            Fastest way to reach me is email.
          </p>
        </Reveal>
        <Reveal delay={150}>
          <a className="bigmail" href={`mailto:${profile.email}`}>
            {profile.email}
          </a>
        </Reveal>
        <Reveal delay={190}>
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
