import Link from "next/link";
import { Arrow } from "@/components/brand";
import { PageIntro, Eyebrow } from "@/components/ui";
import { CopyEmail } from "@/components/copy-email";
import { site, emailLink } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "Get in touch",
  "Questions, feedback, or a problem worth solving? Get in touch.",
  "/contact",
);
export default function Contact() {
  return (
    <>
      <PageIntro eyebrow="A DIRECT LINE" title="Let’s talk.">
        <p>
          A question about a tool, a thoughtful bit of feedback, or a problem
          worth solving. I’d like to hear it.
        </p>
      </PageIntro>
      <section className="container contact-grid">
        <div className="contact-email">
          <Eyebrow>GET IN TOUCH</Eyebrow>
          <a className="email-address" href={emailLink("Hello iyanju")}>
            {site.operator.email}
            <Arrow diagonal />
          </a>
          <p>
            Opens your email app. You can also copy the address
            <br className="desktop-break" /> and write from wherever you prefer.
          </p>
          <CopyEmail />
        </div>
        <div className="contact-details">
          <div>
            <h2>A person on the other end.</h2>
            <p>
              {site.operator.name}
              <br />
              {site.operator.address}
            </p>
          </div>
          <div>
            <h2>Privacy or account questions?</h2>
            <p>
              Use the same email address and mention the tool involved. Please
              leave out passwords, access tokens, and private workspace content.
            </p>
            <Link href="/privacy" className="text-link">
              Read the privacy notice <Arrow />
            </Link>
          </div>
        </div>
      </section>
      <div className="container contact-note">
        <span aria-hidden="true">✳</span>
        <p>
          Your message goes through your email provider. Only include
          information needed to help with your question.
        </p>
      </div>
    </>
  );
}
