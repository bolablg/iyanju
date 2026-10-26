import Link from "next/link";
import { Wordmark, Arrow } from "./brand";
import { site, emailLink } from "@/content/site";
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div>
            <Link href="/" aria-label="iYanJu home">
              <Wordmark />
            </Link>
            <p>
              A little effort.
              <br />
              Something useful.
            </p>
          </div>
          <div className="footer-invite">
            <p>Have a problem worth solving?</p>
            <Link href="/contact">
              Let’s talk <Arrow diagonal />
            </Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>
            Created & operated by {site.operator.name}.<br />
            <span>An independent software initiative.</span>
          </p>
          <nav aria-label="Footer navigation">
            <Link href="/privacy">
              Privacy <span className="draft-label">Draft</span>
            </Link>
            <Link href="/terms">
              Website terms <span className="draft-label">Draft</span>
            </Link>
            <a href={emailLink()}>
              Email <Arrow diagonal />
            </a>
          </nav>
          <span className="copyright">© 2026 {site.name}</span>
        </div>
      </div>
    </footer>
  );
}
