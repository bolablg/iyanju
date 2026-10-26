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
              Independent applications for work, music, and everyday projects,
              created by {site.operator.name}.
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
        <p>
          I’m Bolaji BALOGOUN. I build practical software with the help of AI.
          iyanju is where these applications come together.
        </p>
        <p>
          Each application has its own purpose, permissions, and data. The
          collection grows from real projects and everyday needs.
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
