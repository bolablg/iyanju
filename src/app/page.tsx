import Link from "next/link";
import { Arrow } from "@/components/brand";
import {
  ButtonLink,
  EffortArt,
  Eyebrow,
  ProductFeature,
} from "@/components/ui";
import { site } from "@/content/site";
export default function Home() {
  return (
    <>
      <section className="home-hero container">
        <div className="hero-copy">
          <Eyebrow>INDEPENDENT TOOLS. EVERYDAY POSSIBILITIES.</Eyebrow>
          <h1>
            Good ideas.
            <br />
            Put <em>to work.</em>
          </h1>
          <p>
            Practical software for the things you want to get done. Created by{" "}
            {site.operator.name}, with curiosity, care, and a little help from
            AI.
          </p>
          <ButtonLink href="/tools">Explore the tools</ButtonLink>
          <div className="hero-signoff">
            <span className="tiny-cross" aria-hidden="true">
              ✳
            </span>
            <span>
              Independently made.
              <br />
              Thoughtfully put together.
            </span>
          </div>
        </div>
        <EffortArt />
      </section>
      <div className="manifesto-strip">
        <div className="container">
          <span>AN IDEA IS A START.</span>
          <span>THE EFFORT MAKES IT USEFUL.</span>
          <Arrow diagonal />
        </div>
      </div>
      <section className="section container" aria-labelledby="selected-heading">
        <div className="section-heading">
          <div>
            <Eyebrow>THE COLLECTION</Eyebrow>
            <h2 id="selected-heading">Useful starts here.</h2>
          </div>
          <Link className="text-link" href="/tools">
            All tools <Arrow />
          </Link>
        </div>
        <ProductFeature />
      </section>
      <section
        className="approach-section container"
        aria-labelledby="approach-heading"
      >
        <div className="approach-title">
          <Eyebrow>THE WAY I BUILD</Eyebrow>
          <h2 id="approach-heading">
            Human intention.
            <br />
            <em>AI-assisted effort.</em>
          </h2>
          <Link href="/about" className="text-link">
            The story behind iyanju <Arrow />
          </Link>
        </div>
        <div className="approach-notes">
          <div>
            <span className="note-number">01</span>
            <h3>Start with a real need.</h3>
            <p>
              A clearer plan. A better way to organize work. Useful software
              starts with something people actually need to do.
            </p>
          </div>
          <div>
            <span className="note-number">02</span>
            <h3>Build with a helping hand.</h3>
            <p>
              I use AI to explore, design, and write software. The decisions,
              care, and responsibility remain mine.
            </p>
          </div>
          <div>
            <span className="note-number">03</span>
            <h3>Be clear about what’s inside.</h3>
            <p>
              Built with AI doesn’t mean your data goes to AI. Each tool
              explains its own features, connections, and privacy practices.
            </p>
          </div>
        </div>
      </section>
      <section className="founder-band">
        <div className="container">
          <span className="eyebrow">A NOTE FROM THE MAKER</span>
          <blockquote>
            “For me, iyanju is a reminder to keep trying. To take an idea, put
            in the effort, and make something useful.”
          </blockquote>
          <div className="founder-attribution">
            <span className="founder-initials" aria-hidden="true">
              BB
            </span>
            <p>
              {site.operator.name}
              <span>Creator & operator of iyanju</span>
            </p>
            <Link href="/about" className="text-link">
              A little more about the story <Arrow />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
