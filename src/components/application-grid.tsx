import Link from "next/link";
import { Arrow } from "./brand";
import { collection } from "@/content/products";

export function ApplicationGrid() {
  return (
    <div className="application-grid">
      {collection.map((application, index) => (
        <article
          className={`application-card tone-${application.tone}`}
          key={application.slug}
          aria-labelledby={`${application.slug}-title`}
        >
          <div className="card-main">
            <div className="card-meta">
              <span className="project-tag">{application.category}</span>
              <span className="project-number">APP-0{index + 1}</span>
            </div>
            <h3 id={`${application.slug}-title`}>{application.name}</h3>
            <p>{application.description}</p>
            {application.detailsUrl && (
              <Link
                className="text-link card-detail"
                href={application.detailsUrl}
              >
                Meet {application.name} <Arrow />
              </Link>
            )}
          </div>
          <div className="card-actions">
            {application.url ? (
              <a
                className={`button${application.slug === "agentory" ? " button-secondary" : ""}`}
                href={application.url}
              >
                {application.action}
                <Arrow diagonal={application.slug === "agentory"} />
              </a>
            ) : (
              <p className="project-pending">{application.action}</p>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
