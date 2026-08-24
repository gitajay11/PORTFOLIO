import About from "@/components/About";
import ChatBot from "@/components/ChatBot";
import Contact from "@/components/Contact";
import CursorGlow from "@/components/CursorGlow";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Interlude from "@/components/Interlude";
import Marquee from "@/components/Marquee";
import Nav from "@/components/Nav";
import Path from "@/components/Path";
import ScrollVideoBackground from "@/components/ScrollVideoBackground";
import SocialDock from "@/components/SocialDock";
import Stack from "@/components/Stack";
import Work from "@/components/Work";
import { heroStages } from "@/lib/content";

export default function Home() {
  return (
    <>
      {/* Fixed behind everything; scrubbed by whole-document scroll. */}
      <ScrollVideoBackground />
      <CursorGlow />
      <Nav />

      {/* Fixed on every screen of the site */}
      <SocialDock />
      <ChatBot />

      <main id="top" className="page">
        <Hero />
        <Marquee />
        <About />
        <Interlude {...heroStages[0]} />
        <Stack />
        <Work />
        <Interlude {...heroStages[1]} />
        <Path />
        <Contact />
        <Footer />
      </main>
    </>
  );
}
