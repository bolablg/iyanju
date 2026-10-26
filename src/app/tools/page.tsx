import { PageIntro, ProductFeature } from "@/components/ui";
import { pageMetadata } from "@/lib/metadata";
import { products, relatedProjects } from "@/content/products";
export const metadata = pageMetadata(
  "The tools",
  "Explore Kazi, PlayKin, and iyanju Agentory: independent applications for work, music, and everyday projects.",
  "/tools",
);
export default function Tools() {
  return (
    <>
      <PageIntro
        eyebrow="THE COLLECTION"
        title={
          <>
            A practical kind
            <br />
            of <em>possibility.</em>
          </>
        }
      >
        <p>
          Independent applications for work, music, and everyday projects. Each
          has its own purpose, data, and permissions.
        </p>
      </PageIntro>
      <section className="container catalogue">
        <div className="catalogue-index">
          <span>
            {String(products.length + relatedProjects.length).padStart(2, "0")}{" "}
            APPLICATIONS & PROJECTS
          </span>
          <span>INDEPENDENTLY BUILT</span>
        </div>
        {products.map((p) => (
          <ProductFeature key={p.slug} product={p} full />
        ))}
        {relatedProjects.map((project) => (
          <div className="catalogue-note" key={project.name}>
            <span aria-hidden="true">↗</span>
            <div>
              <h2>{project.name}</h2>
              <p>{project.description}</p>
              {project.url ? (
                <a href={project.url} className="text-link">
                  Browse on GitHub ↗
                </a>
              ) : (
                <p className="small">{project.status}</p>
              )}
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
