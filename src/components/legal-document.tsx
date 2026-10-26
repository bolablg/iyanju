import { PageIntro } from "./ui";
import type { LegalSection } from "@/content/privacy";
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
          <div className="draft-notice">
            <strong>Draft for review · No effective date</strong>
            <p>
              This text reflects the implementation and matters still to be
              confirmed. It has not been adopted as a final legal notice.
            </p>
          </div>
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
