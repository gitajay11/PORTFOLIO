import Reveal from "./Reveal";

type Props = {
  /** Text before the emphasised word. */
  lead: string;
  /** Second line prefix. */
  tail: string;
  /** The italic accent word. */
  emphasis: string;
};

/**
 * A full-height break between sections where the background video is the
 * whole point — no panel, no card, just a statement over the footage.
 */
export default function Interlude({ lead, tail, emphasis }: Props) {
  return (
    <section className="interlude">
      <Reveal>
        <p className="interlude__text">
          {lead}
          <br />
          {tail} <em>{emphasis}</em>.
        </p>
      </Reveal>
    </section>
  );
}
