import Link from "next/link";
import { Wordmark } from "./brand";
import { site } from "@/content/site";
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-main">
          <div className="footer-brand">
            <Link href="/" aria-label="iYANJU home">
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
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </nav>
        </div>
        <div className="footer-meta">
          <p>Built with curiosity, care, and assistance from AI.</p>
          <span className="copyright">© 2026 {site.name}</span>
        </div>
      </div>
    </footer>
  );
}
