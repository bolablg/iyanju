import { PageIntro, Eyebrow, ButtonLink, EffortArt } from "@/components/ui";
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
      <PageIntro
        eyebrow="THE STORY BEHIND iYanJu"
        title={
          <>
            A little encouragement.
            <br />
            <em>A lot of possibility.</em>
          </>
        }
      >
        <p>
          Software starts with an idea. Making it useful takes curiosity, care,
          and the willingness to keep trying.
        </p>
      </PageIntro>
      <section className="container about-grid">
        <div className="about-letter">
          <Eyebrow>FROM BOLAJI</Eyebrow>
          <h2>Hi, I’m Bolaji.</h2>
          <p>
            I created iYanJu as a home for practical tools I build with the help
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
            Kazi is the first tool in the collection: a place to organize work
            for people, teams, and connected agents. I want the collection to
            grow from real needs, one useful product at a time.
          </p>
          <p className="signature">{site.operator.name}</p>
          <span className="small">
            Creator & operator · {site.operator.location}
          </span>
        </div>
        <EffortArt compact />
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
