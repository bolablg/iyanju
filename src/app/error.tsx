"use client";
import Link from "next/link";
export default function ErrorPage({ retry }: { retry: () => void }) {
  return (
    <div className="container error-panel">
      <p className="eyebrow">A SMALL INTERRUPTION</p>
      <h1>Something didn’t come together.</h1>
      <p role="alert">
        We couldn’t load this page. Please try again or return to the start.
      </p>
      <div className="button-row">
        <button className="button" onClick={retry}>
          Try again
        </button>
        <Link className="text-link" href="/">
          Back to iyanju →
        </Link>
      </div>
    </div>
  );
}
