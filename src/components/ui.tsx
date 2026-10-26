import Link from "next/link";
import type { ReactNode } from "react";
import { Arrow } from "./brand";
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
      <span>
        <BrandCopy>{children}</BrandCopy>
      </span>
      <Arrow diagonal />
    </a>
  ) : (
    <Link href={href} className={cls}>
      <span>
        <BrandCopy>{children}</BrandCopy>
      </span>
      <Arrow />
    </Link>
  );
}
function BrandCopy({ children }: { children: ReactNode }) {
  return typeof children === "string"
    ? children.split(/(iYANJU)/).map((part, index) =>
        part === "iYANJU" ? (
          <span className="brand-case" key={index}>
            {part}
          </span>
        ) : (
          part
        ),
      )
    : children;
}
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="eyebrow">
      <span aria-hidden="true" />
      <span>
        <BrandCopy>{children}</BrandCopy>
      </span>
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
