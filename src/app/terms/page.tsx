import Link from "next/link";
import { LegalDocument } from "@/components/legal-document";
import { operatorClause, type LegalSection } from "@/content/privacy";
import { site, emailLink } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "Website terms",
  "Terms for using the iYANJU website, its application catalogue, and contact information.",
  "/terms",
);
const sections: LegalSection[] = [
  {
    id: "operator",
    title: "1. The website and operator",
    content: (
      <>
        {operatorClause}
        <p>
          These terms apply to the public catalogue and information at{" "}
          {site.url}. iYANJU is a personal project: a home for applications
          built out of curiosity and a wish to make useful tools.
        </p>
      </>
    ),
  },
  {
    id: "use",
    title: "2. Using the public website",
    content: (
      <p>
        You can read the public pages without an account. Please use the website
        lawfully and avoid attempts to disrupt it, bypass security, impersonate
        others, or misuse contact details. No account, purchase, subscription,
        or eligibility decision is required to read this catalogue.
      </p>
    ),
  },
  {
    id: "tools",
    title: "3. Separate tools and access",
    content: (
      <>
        <p>
          Links take you to independently operated product experiences within
          the iYANJU collection. Each tool’s actual terms, privacy notice,
          access rules, and features should be reviewed there. This catalogue
          does not grant workspace membership, product entitlements, or
          permission to access another person’s data.
        </p>
        <p>
          Descriptions reflect the current projects and may change. Sign-in and
          workspace access are managed by each application. No pricing,
          availability guarantee, service-level commitment, or release timetable
          is created by the catalogue.
        </p>
      </>
    ),
  },
  {
    id: "content",
    title: "4. Content and links",
    content: (
      <>
        <p>
          The iYANJU identity and website content identify this independent
          initiative. Product names and assets belong to their respective
          owners. Linking to a tool or provider does not replace its own
          information or terms.
        </p>
        <p>
          Contact the operator if you believe information is inaccurate or
          material should be corrected. These terms do not limit any mandatory
          rights or protections you have under applicable law.
        </p>
      </>
    ),
  },
  {
    id: "privacy",
    title: "5. Privacy and accounts",
    content: (
      <p>
        Read the <Link href="/privacy">privacy notice</Link> to understand how
        this website handles information and the current availability of account
        features. Each application manages its own data and permissions.
        Deleting an identity profile is different from deleting information held
        by an application.
      </p>
    ),
  },
  {
    id: "changes",
    title: "6. Changes and contact",
    content: (
      <>
        <p>
          I may update these terms as the website changes. The date above shows
          the latest version. Material changes will be communicated as required.
          Any change of operator will be identified in the website’s
          information.
        </p>
        <p>
          For website questions, email{" "}
          <a href={emailLink("iYANJU website enquiry")}>
            {site.operator.email}
          </a>
          .
        </p>
      </>
    ),
  },
];
export default function Terms() {
  return (
    <LegalDocument
      title="Website terms."
      intro="Information about using this website and how its catalogue relates to the applications it introduces."
      sections={sections}
    />
  );
}
