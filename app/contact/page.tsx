import type { Metadata } from "next";
import ContactDirect from "@/components/ContactDirect";
import ContactForm from "@/components/ContactForm";
import ContactHero from "@/components/ContactHero";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch — email, socials, or send a message directly.",
};

export default function ContactPage() {
  return (
    <main id="top" className="page">
      <ContactHero />
      <ContactDirect />

      <section className="section section--alt" id="message">
        <div className="wrap wrap--center">
          <Reveal>
            <p className="eyebrow">message</p>
          </Reveal>
          <Reveal delay={70}>
            <h2 className="h2">Or write it out.</h2>
          </Reveal>
          <Reveal delay={110}>
            <p className="lead lead--center">
              Prefer typing over talking? Send it straight from here.
            </p>
          </Reveal>
          <Reveal delay={150}>
            <ContactForm />
          </Reveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
