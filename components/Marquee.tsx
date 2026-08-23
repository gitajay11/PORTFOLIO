import { marqueeItems } from "@/lib/content";

export default function Marquee() {
  const strip = marqueeItems.join(" \u2726 ");
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee__inner">
        <span>{strip} &#10022;&nbsp;</span>
        <span>{strip} &#10022;&nbsp;</span>
      </div>
    </div>
  );
}
