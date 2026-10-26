import { PageIntro, Eyebrow, ButtonLink } from "@/components/ui";
import Link from "next/link";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "The story",
  "Why iYANJU exists: personal projects, a love of technology, and learning by building with assistance from AI.",
  "/about",
);
export default function About() {
  return (
    <>
      <PageIntro
        eyebrow="THE IDEA BEHIND iYANJU"
        title="Curiosity, put to work."
      >
        <p>
          A home for personal projects, built for the pleasure of learning and
          making something useful.
        </p>
      </PageIntro>
      <section className="container about-grid">
        <div className="about-letter">
          <Eyebrow>WHY iYANJU?</Eyebrow>
          <h2>An idea, then the effort.</h2>
          <p>
            My professional work is in data engineering, data analysis, and
            statistics. iYANJU is a separate home for a personal interest:
            exploring technology and building applications I want to use.
          </p>
          <p>
            For me, the Yoruba name carries a personal sense of encouragement
            and effort. It’s a reminder to try, learn, and keep moving an idea
            toward something useful.
          </p>
          <p>
            Sometimes I want a tool that works my way. Before adding another
            subscription, I explore whether I can build it. I enjoy learning how
            software works, shaping a tool around a real need, and sharing it
            for other people to try.
          </p>
          <p>
            I build with assistance from AI. I direct the work, challenge its
            proposals on decisions, architecture, security, and design, and ask
            for improvements. I take responsibility for what I share.
          </p>
          <p>
            For now, iYANJU is a passion project. I’m here to learn, make useful
            things, and let other people try them. Each application can find its
            own direction as it matures.
          </p>
          <p className="signature">{site.operator.name}</p>
          <span className="small">{site.operator.location}</span>
        </div>
        <aside className="maker-card" aria-labelledby="maker-projects-heading">
          <Eyebrow>THE COLLECTION</Eyebrow>
          <h2 id="maker-projects-heading">Room for the next idea.</h2>
          <p>
            I don’t limit iYANJU to one field. I build applications around ideas
            worth working on.
          </p>
          <Link href="/tools" className="text-link">
            Explore the applications →
          </Link>
        </aside>
      </section>
      <section className="container about-principles">
        <Eyebrow>WHAT GUIDES THE WORK</Eyebrow>
        <div>
          <h2>Learn by building.</h2>
          <p>
            Building an application is a way to understand how software works,
            explore what AI can help me achieve, and turn curiosity into
            something I can use and share.
          </p>
          <ButtonLink href="/tools">See what’s being built</ButtonLink>
        </div>
      </section>
    </>
  );
}
