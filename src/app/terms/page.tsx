import Link from "next/link";
import { LegalDocument } from "@/components/legal-document";
import { operatorClause, type LegalSection } from "@/content/privacy";
import { site, emailLink } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "Website terms",
  "Terms for using the iYANJU website and responsibilities for optional MCP and AI-provider connections.",
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
          These terms cover the public catalogue and information at {site.url}{" "}
          and the common responsibilities below when you use an optional MCP
          connection provided by an iYANJU application. Application-specific
          terms govern the other features of each tool. iYANJU is a personal
          project: a home for applications built out of curiosity and a wish to
          make useful tools.
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
          Links take you to separate product experiences within the iYANJU
          collection. Each tool’s actual terms, privacy notice, access rules,
          and features should be reviewed there. This catalogue does not grant
          workspace membership, product entitlements, or permission to access
          another person’s data.
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
    id: "mcp",
    title: "4. MCP connections and your chosen AI provider",
    content: (
      <>
        <p>
          Some applications, including Kazi, support optional external clients
          through the Model Context Protocol (MCP). A client may use an AI
          provider you choose. Assistance from AI during software development
          does not itself give an AI provider access to your account or
          application content. An MCP connection can provide that access within
          its credential scopes and your application permissions.
        </p>
        <p>When you authorize a client, you are responsible for:</p>
        <ul>
          <li>
            Choosing a client and provider appropriate for the information
            involved, including reviewing their terms, privacy practices,
            retention, and model-training settings for your plan and any
            gateways or downstream model providers.
          </li>
          <li>
            Having authority to share the information and permit the actions,
            including complying with your organization’s rules and other
            people’s rights in shared workspace information.
          </li>
          <li>
            Protecting credentials, granting only necessary permissions, and
            revoking access when it is no longer needed or you suspect misuse.
          </li>
          <li>
            Understanding that a client may act within its granted permissions
            without a separate confirmation for every action. Use the client’s
            available approval controls and review consequential outputs and
            changes; AI-generated information may be inaccurate.
          </li>
        </ul>
        <p>
          Read-only access can still disclose information to the client and its
          providers. Revoking a credential stops future use of that credential;
          it does not undo completed actions or remove copies already held by an
          external provider. Their processing is also governed by their own
          terms and privacy practices, as explained in the{" "}
          <Link href="/privacy#mcp">privacy notice</Link>.
        </p>
        <p>
          Do not use a connection to bypass application permissions, access
          information you are not authorized to use, or violate a source
          service’s restrictions. Google-derived information remains subject to
          the{" "}
          <Link href="/privacy#google-data">
            Google Limited Use restrictions
          </Link>
          , including the prohibition on using it to train general-purpose AI
          models. User authorization does not override those restrictions.
        </p>
        <p>
          These user responsibilities do not remove the operator’s obligations
          for the application’s security, access controls, disclosures, or
          applicable data-protection requirements. They do not waive any
          mandatory rights or protections you have under applicable law.
        </p>
      </>
    ),
  },
  {
    id: "content",
    title: "5. Content and links",
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
    title: "6. Privacy and accounts",
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
    title: "7. Changes and contact",
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
      intro="Using this website, understanding application boundaries, and authorizing optional MCP clients and AI providers."
      sections={sections}
    />
  );
}
