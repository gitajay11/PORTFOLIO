import About from "@/components/About";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Interlude from "@/components/Interlude";
import Marquee from "@/components/Marquee";
import Path from "@/components/Path";
import Stack from "@/components/Stack";
import Work from "@/components/Work";
import { heroStages } from "@/lib/content";

export default function Home() {
  return (
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
  );
}
