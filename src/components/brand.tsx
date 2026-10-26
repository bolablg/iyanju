export function Symbol({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
    >
      <path d="M8 53V36h17V19h17V7h14v29H39v17H8Z" fill="currentColor" />
      <path d="M8 7h17v12H8z" fill="currentColor" />
    </svg>
  );
}
export function Wordmark() {
  return (
    <span className="wordmark" translate="no">
      <Symbol />
      <span>
        iyanju<span className="wordmark-dot">.</span>
      </span>
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
