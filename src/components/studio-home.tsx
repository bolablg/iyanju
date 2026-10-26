import Link from "next/link";
import { ApplicationGrid } from "./application-grid";
import { Arrow } from "./brand";
import { ButtonLink, Eyebrow } from "./ui";
import { collection } from "@/content/products";

export function StudioHome() {
  return (
    <>
      <section className="container studio-hero" aria-labelledby="home-heading">
        <Eyebrow>Personal projects</Eyebrow>
        <div className="studio-hero-layout">
          <div>
            <h1 id="home-heading">Make good things happen.</h1>
            <p>
              Practical software for the things you want to get done. Personal
              projects, built with curiosity, care, and assistance from AI.
            </p>
          </div>
          <ButtonLink href="#applications" secondary>
            Explore applications
          </ButtonLink>
        </div>
      </section>
      <section
        className="container studio-collection"
        id="applications"
        aria-labelledby="applications-heading"
      >
        <div className="catalogue-index">
          <div>
            <h2 id="applications-heading">Catalogue</h2>
            <span className="count-label">
              {String(collection.length).padStart(2, "0")} projects
            </span>
          </div>
          <span>Built from curiosity</span>
        </div>
        <ApplicationGrid />
      </section>
      <section className="container maker-note" aria-labelledby="maker-heading">
        <h2 className="eyebrow" id="maker-heading">
          <span aria-hidden="true" />A note from the maker
        </h2>
        <blockquote>
          “For me, iyanju is a reminder to keep trying. To take an idea, put in
          the effort, and make something useful.”
        </blockquote>
        <p>
          These projects start with something I want to use, a chance to learn,
          or an idea I want to try. I build with assistance from AI, challenge
          its proposals, and share what takes shape for others to try.
        </p>
        <Link className="maker-signature text-link" href="/about">
          More about iyanju <Arrow />
        </Link>
      </section>
      <section
        className="container contact-band"
        aria-labelledby="contact-heading"
      >
        <div>
          <h2 id="contact-heading">Questions or feedback?</h2>
          <p>Ideas, bug reports, and a good conversation are welcome.</p>
        </div>
        <ButtonLink href="/contact">Get in touch</ButtonLink>
      </section>
    </>
  );
}
