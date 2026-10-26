import Link from "next/link";
import type { ReactNode } from "react";
import { Arrow, Symbol } from "./brand";
import { kazi, type Product } from "@/content/products";
import Image from "next/image";
export function ButtonLink({
  href,
  children,
  secondary = false,
  external = false,
}: {
  href: string;
  children: ReactNode;
  secondary?: boolean;
  external?: boolean;
}) {
  const cls = `button${secondary ? " button-secondary" : ""}`;
  return external ? (
    <a href={href} className={cls}>
      {children}
      <Arrow diagonal />
    </a>
  ) : (
    <Link href={href} className={cls}>
      {children}
      <Arrow />
    </Link>
  );
}
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="eyebrow">
      <span aria-hidden="true" />
      {children}
    </p>
  );
}
export function PageIntro({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="page-intro container">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1>{title}</h1>
      <div className="intro-copy">{children}</div>
    </div>
  );
}
export function EffortArt({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`effort-art${compact ? " compact" : ""}`}
      aria-hidden="true"
    >
      <div className="art-caption">
        <span>FROM POSSIBILITY</span>
        <span>TO SOMETHING USEFUL ↗</span>
      </div>
      <svg viewBox="0 0 500 500" fill="none">
        <defs>
          <pattern
            id="dots"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="1" cy="1" r="1" fill="currentColor" opacity=".2" />
          </pattern>
        </defs>
        <rect width="500" height="500" fill="url(#dots)" />
        <g stroke="currentColor" strokeWidth="1.5">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <path
              key={i}
              d={`M${48 + i * 18} ${430 - i * 8}V${285 - i * 8}H${190 + i * 18}V${145 - i * 8}H${335 + i * 18}V${45 - i * 2}`}
            />
          ))}
        </g>
        <path d="M335 45h108v108h-36V82h-72V45Z" fill="currentColor" />
        <circle cx="48" cy="430" r="7" fill="currentColor" />
        <path d="M27 480H473" stroke="currentColor" strokeWidth="1" />
      </svg>
      <div className="art-note">
        <Symbol />
        <span>
          Small steps.
          <br />
          Real progress.
        </span>
      </div>
    </div>
  );
}
export function ProductFeature({
  full = false,
  product = kazi,
}: {
  full?: boolean;
  product?: Product;
}) {
  return (
    <article
      className={`product-feature${full ? " product-feature-full" : ""}`}
    >
      <div className="product-visual">
        <div className="product-label">
          <span>01 / THE COLLECTION</span>
          <span>{product.category}</span>
        </div>
        <Image
          className="kazi-logo"
          src={product.logo}
          width={247}
          height={64}
          alt={product.name}
        />
        <div className="work-orbit" aria-hidden="true">
          <span className="orbit-core">
            Work,
            <br />
            <em>in view.</em>
          </span>
          <span className="orbit-label label-tasks">Tasks</span>
          <span className="orbit-label label-projects">Projects</span>
          <span className="orbit-label label-people">People</span>
          <span className="orbit-label label-plans">Plans</span>
          <span className="orbit-plus">+</span>
        </div>
        <p className="visual-footnote">A clearer way to move work forward.</p>
      </div>
      <div className="product-copy">
        <Eyebrow>{product.category}</Eyebrow>
        <h2>{product.headline}</h2>
        <p>{product.description}</p>
        <ul className="capability-tags">
          {product.highlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>
        <div className="button-row">
          <ButtonLink href={`/tools/${product.slug}`}>
            Meet {product.name}
          </ButtonLink>
          <a className="text-link" href={product.url}>
            Open {product.name} <Arrow diagonal />
          </a>
        </div>
        {full && (
          <p className="small product-access-note">{product.access.note}</p>
        )}
      </div>
    </article>
  );
}
