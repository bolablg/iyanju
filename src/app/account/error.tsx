"use client";
import Link from "next/link";
export default function AccountError({ retry }: { retry: () => void }) {
  return (
    <div className="container error-panel">
      <p className="eyebrow">ACCOUNT CONNECTION</p>
      <h1>We couldn’t open the account service.</h1>
      <p role="alert">
        Please try again. You can still explore the tools and read every public
        page.
      </p>
      <div className="button-row">
        <button className="button" onClick={retry}>
          Try again
        </button>
        <Link href="/tools" className="text-link">
          Explore the tools →
        </Link>
      </div>
    </div>
  );
}
