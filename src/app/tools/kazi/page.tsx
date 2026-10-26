import Image from "next/image";
import Link from "next/link";
import { Arrow } from "@/components/brand";
import { ButtonLink, Eyebrow } from "@/components/ui";
import { kazi } from "@/content/products";
import { site } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "Kazi — work, in view",
  kazi.description,
  "/tools/kazi",
);
export default function Kazi() {
  return (
    <>
      <section className="container product-hero">
        <Link className="back-link" href="/tools">
          ← The tools
        </Link>
        <div className="product-hero-grid">
          <div>
            <Image
              src={kazi.logo}
              width={185}
              height={48}
              alt="Kazi"
              priority
            />
            <Eyebrow>WORK MANAGEMENT / AN iYanJu TOOL</Eyebrow>
            <h1>
              Less scattered.
              <br />
              <em>More together.</em>
            </h1>
            <p className="lead">
              Work has a lot of moving parts. Give tasks, people, and plans a
              shared place to come together.
            </p>
            <ButtonLink href={kazi.url} external>
              Open Kazi
            </ButtonLink>
            <p className="small access-note">{kazi.access.note}</p>
          </div>
          <div className="product-side-note">
            <span className="label">MADE FOR</span>
            <div>
              <span>People.</span>
              <span>Teams.</span>
              <span>
                Connected
                <br />
                <em>agents.</em>
              </span>
            </div>
            <p>
              From your next task
              <br />
              to the bigger picture.
            </p>
            <Arrow diagonal />
          </div>
        </div>
      </section>
      <section
        className="container section capabilities"
        aria-labelledby="capabilities-heading"
      >
        <div className="section-heading">
          <div>
            <Eyebrow>WHAT YOU CAN DO</Eyebrow>
            <h2 id="capabilities-heading">
              A clearer view.
              <br />A next step.
            </h2>
          </div>
          <p>
            For individual work, shared projects,
            <br />
            and the plans that connect them.
          </p>
        </div>
        <div className="capability-list">
          {kazi.capabilities.map((c, i) => (
            <div key={c.title}>
              <span className="note-number">0{i + 1}</span>
              <h3>{c.title}</h3>
              <p>{c.description}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="container product-boundary">
        <div>
          <Eyebrow>YOUR CONNECTIONS. YOUR CHOICE.</Eyebrow>
          <h2>
            Built with AI.
            <br />
            <em>Connected by you.</em>
          </h2>
        </div>
        <div>
          <p>
            Kazi was developed with AI assistance. That describes how it was
            built, rather than a promise that every feature runs on a model.
          </p>
          <p>
            Agent access is optional. MCP connections give a chosen client
            scoped access to authorized work. That client may use AI and has its
            own data practices. Review what you grant before connecting.
          </p>
          <p>
            Optional Google calendar availability is a separate connection from
            Google sign-in. Permissions and workspace access stay specific to
            Kazi.
          </p>
          <a href={kazi.privacyUrl} className="text-link">
            Read Kazi’s privacy notice <Arrow diagonal />
          </a>
        </div>
      </section>
      <section className="container product-final">
        <p>
          Kazi is part of iYanJu, an independent software initiative operated by{" "}
          {site.operator.name}.
        </p>
        <div className="button-row">
          <ButtonLink href={kazi.url} external>
            Open Kazi
          </ButtonLink>
          <Link href="/privacy" className="text-link">
            iYanJu privacy draft <Arrow />
          </Link>
        </div>
      </section>
    </>
  );
}
