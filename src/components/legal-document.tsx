import { PageIntro } from "./ui";
import type { LegalSection } from "@/content/privacy";
import { site } from "@/content/site";
export function LegalDocument({
  title,
  intro,
  sections,
}: {
  title: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <>
      <PageIntro eyebrow="CLEAR INFORMATION, OPENLY SHARED" title={title}>
        <p>{intro}</p>
      </PageIntro>
      <div className="container legal-layout">
        <aside className="legal-toc" aria-label="On this page">
          <h2>On this page</h2>
          <ol>
            {sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>{s.title}</a>
              </li>
            ))}
          </ol>
        </aside>
        <article className="legal-content" aria-label={title}>
          <p className="legal-updated">Last updated {site.legalUpdatedDate}</p>
          {sections.map((s) => (
            <section key={s.id} id={s.id}>
              <h2>{s.title}</h2>
              {s.content}
            </section>
          ))}
        </article>
      </div>
    </>
  );
}
