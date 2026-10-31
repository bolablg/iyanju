import Image from "next/image";
import { site } from "@/content/site";

export function Symbol({ className = "" }: { className?: string }) {
  return (
    <Image
      className={className}
      src="/brand/iyanju-symbol.svg"
      alt=""
      aria-hidden="true"
      width={64}
      height={64}
      unoptimized
    />
  );
}
export function Wordmark() {
  return (
    <span className="wordmark" translate="no">
      <Image
        src="/brand/iyanju-wordmark.svg"
        alt={site.name}
        width={142}
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
