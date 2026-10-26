import { PageIntro, ProductFeature } from "@/components/ui";
import { pageMetadata } from "@/lib/metadata";
import { products } from "@/content/products";
export const metadata = pageMetadata(
  "The tools",
  "An independent collection of useful software. Start with Kazi, work management for people, teams, and connected agents.",
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
          A collection that starts with a real need, then grows with care. Meet
          the first tool from iYanJu.
        </p>
      </PageIntro>
      <section className="container catalogue">
        <div className="catalogue-index">
          <span>
            {String(products.length).padStart(2, "0")} TOOL IN THE COLLECTION
          </span>
          <span>INDEPENDENTLY BUILT</span>
        </div>
        {products.map((p) => (
          <ProductFeature key={p.slug} product={p} full />
        ))}
        <div className="catalogue-note">
          <span aria-hidden="true">↗</span>
          <p>
            One useful tool is a good beginning.
            <br />
            <span>
              More will belong here when there’s something real to share.
            </span>
          </p>
        </div>
      </section>
    </>
  );
}
