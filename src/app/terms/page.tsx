import Link from "next/link";
import { LegalDocument } from "@/components/legal-document";
import { operatorClause, type LegalSection } from "@/content/privacy";
import { site, emailLink } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "Website terms draft",
  "Draft information about using the iyanju website, its independent operator, and separate tool terms.",
  "/terms",
  true,
);
const sections: LegalSection[] = [
  {
    id: "operator",
    title: "1. The website and operator",
    content: (
      <>
        {operatorClause}
        <p>
          This draft concerns the public catalogue and information at {site.url}
          . It is prepared for review, has no effective date, and is not
          presented as a finalized contract.
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
          the iyanju collection. Each tool’s actual terms, privacy notice,
          access rules, and features should be reviewed there. This catalogue
          does not grant workspace membership, product entitlements, or
          permission to access another person’s data.
        </p>
        <p>
          Descriptions reflect the available product source and may change.
          Sign-in and workspace access are managed in Kazi. No pricing,
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
          The iyanju identity and website content identify this independent
          initiative. Product names and assets belong to their respective
          owners. Linking to a tool or provider does not replace its own
          information or terms.
        </p>
        <p>
          Contact the operator if you believe information is inaccurate or
          material should be corrected. The final terms need appropriate review
          of content permissions and applicable consumer protections; this draft
          does not attempt to exclude mandatory rights or impose an unreviewed
          dispute clause.
        </p>
      </>
    ),
  },
  {
    id: "privacy",
    title: "5. Privacy and accounts",
    content: (
      <p>
        Read the <Link href="/privacy">website privacy draft</Link> for current
        behavior and planned shared-identity boundaries. Shared account features
        are disabled by default. A later identity service requires its own
        confirmed practices and notice; deleting an identity profile is
        different from deleting data held by each tool.
      </p>
    ),
  },
  {
    id: "changes",
    title: "6. Changes and contact",
    content: (
      <>
        <p>
          Prepared {site.legalReviewDate}. A final version will identify its
          effective date and communicate material changes where required. If the
          operator later changes, actual ownership, service, data, and legal
          arrangements need to be made and disclosed.
        </p>
        <p>
          For website questions, email{" "}
          <a href={emailLink("iyanju website enquiry")}>
            {site.operator.email}
          </a>
          . Operator: {site.operator.name}, {site.operator.location}.
        </p>
      </>
    ),
  },
];
export default function Terms() {
  return (
    <LegalDocument
      title="Website terms."
      intro="Draft information about the website, its independent operator, and how the catalogue relates to the tools it introduces."
      sections={sections}
    />
  );
}
