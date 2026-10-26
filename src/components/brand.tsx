import Image from "next/image";
import { site } from "@/content/site";

export function Symbol({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="1"
        y="1"
        width="14"
        height="14"
        fill="currentColor"
        stroke="#18181b"
      />
    </svg>
  );
}
export function Wordmark() {
  return (
    <span className="wordmark" translate="no">
      <Image
        src="/brand/iyanju-wordmark.svg"
        alt={site.name}
        width={134}
        height={28}
        unoptimized
        loading="eager"
      />
    </span>
  );
}
export function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      {diagonal ? (
        <path d="M6 18 18 6M6 6h12v12" />
      ) : (
        <path d="M4 12h15m-6-6 6 6-6 6" />
      )}
    </svg>
  );
}
