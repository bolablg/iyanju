import Link from "next/link";
import { Wordmark } from "./brand";
import { site } from "@/content/site";
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-main">
          <div className="footer-brand">
            <Link href="/" aria-label="iyanju home">
              <Wordmark />
            </Link>
            <p>
              A little effort.
              <br />
              Something useful.
            </p>
          </div>
          <nav aria-label="Footer navigation">
            <Link href="/tools">Applications</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/privacy">
              Privacy <span className="draft-label">Draft</span>
            </Link>
            <Link href="/terms">
              Terms <span className="draft-label">Draft</span>
            </Link>
          </nav>
        </div>
        <div className="footer-meta">
          <p>
            Created and operated by {site.operator.name}. Built with assistance
            from AI.
          </p>
          <span className="copyright">© 2026 {site.name}</span>
        </div>
      </div>
    </footer>
  );
}
