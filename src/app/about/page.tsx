import { PageIntro, Eyebrow, ButtonLink } from "@/components/ui";
import Link from "next/link";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "The story",
  "A note from Bolaji BALOGOUN on effort, encouragement, and building practical software with AI.",
  "/about",
);
export default function About() {
  return (
    <>
      <PageIntro eyebrow="THE PERSON BEHIND iyanju" title="Hi, I’m Bolaji.">
        <p>
          I build software for things I want to make useful. iyanju is a home
          for these projects and the people who use them.
        </p>
      </PageIntro>
      <section className="container about-grid">
        <div className="about-letter">
          <Eyebrow>WHY iyanju?</Eyebrow>
          <h2>An idea, then the effort.</h2>
          <p>
            I created iyanju as a home for practical tools I build with the help
            of AI. It’s an independent project, and I’m the person who creates
            and operates it.
          </p>
          <p>
            For me, the Yoruba name carries a personal sense of encouragement
            and effort. It’s a reminder to try, learn, and keep moving an idea
            toward something useful.
          </p>
          <p>
            AI helps me explore possibilities, work through design decisions,
            and write code. I still choose what to build, review the result, and
            take responsibility for the software I share.
          </p>
          <p>
            The collection includes Kazi for organizing work, PlayKin for
            playlists and shared listening, and iyanju Agentory for portable AI
            assistant skills. Each has its own purpose and develops at its own
            pace.
          </p>
          <p className="signature">{site.operator.name}</p>
          <span className="small">
            Creator & operator · {site.operator.location}
          </span>
        </div>
        <aside className="maker-card" aria-labelledby="maker-projects-heading">
          <Eyebrow>THE COLLECTION</Eyebrow>
          <h2 id="maker-projects-heading">Work. Music. What comes next.</h2>
          <p>
            Kazi, PlayKin, and iyanju Agentory come from different ideas. They
            share a place here.
          </p>
          <Link href="/tools" className="text-link">
            Explore the applications →
          </Link>
        </aside>
      </section>
      <section className="container about-principles">
        <Eyebrow>WHAT GUIDES THE WORK</Eyebrow>
        <div>
          <h2>Useful before impressive.</h2>
          <p>
            Clear tools. Honest explanations. Deliberate connections. Software
            should earn its place in your day by helping you do something that
            matters.
          </p>
          <ButtonLink href="/tools">See what’s being built</ButtonLink>
        </div>
      </section>
    </>
  );
}
