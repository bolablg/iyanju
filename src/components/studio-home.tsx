import Link from "next/link";
import { ApplicationGrid } from "./application-grid";
import { Arrow } from "./brand";
import { ButtonLink, Eyebrow } from "./ui";
import { collection } from "@/content/products";
import { site } from "@/content/site";

export function StudioHome() {
  return (
    <>
      <section className="container studio-hero" aria-labelledby="home-heading">
        <Eyebrow>Independent software</Eyebrow>
        <div className="studio-hero-layout">
          <div>
            <h1 id="home-heading">Make good things happen.</h1>
            <p>
              Practical software for the things you want to get done. Created by{" "}
              {site.operator.name} with curiosity, care, and assistance from AI.
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
          <span>Independently built</span>
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
          I build with assistance from AI. I challenge its proposals on
          decisions, architecture, security, and design, and ask it to improve
          the work. iyanju is a home for the applications that come from that
          process.
        </p>
        <Link className="maker-signature text-link" href="/about">
          {site.operator.name} <Arrow />
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
