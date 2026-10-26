import { ApplicationGrid } from "./application-grid";
import { PageIntro } from "./ui";
import { collection } from "@/content/products";

export function StudioCatalogue() {
  return (
    <>
      <PageIntro eyebrow="The collection" title="Different projects. One home.">
        <p>
          Applications that grew from an idea or a personal need. Each has its
          own purpose, data, and permissions.
        </p>
      </PageIntro>
      <section
        className="container catalogue"
        aria-labelledby="catalogue-heading"
      >
        <div className="catalogue-index">
          <div>
            <h2 id="catalogue-heading">Applications & projects</h2>
            <span className="count-label">
              {String(collection.length).padStart(2, "0")}
            </span>
          </div>
          <span>Built from curiosity</span>
        </div>
        <ApplicationGrid />
      </section>
    </>
  );
}
