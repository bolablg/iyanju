import type { ReactNode } from "react";
import { site, emailLink } from "./site";
import { kazi } from "./products";
import { identityConfig } from "@/lib/identity-config";
const accountsEnabled = identityConfig(process.env).enabled;
export type LegalSection = { id: string; title: string; content: ReactNode };

// Common operator/support clauses are reusable; product-specific processing belongs in each tool's complete notice.
export const operatorClause = (
  <p>
    {site.name} is a brand used by{" "}
    <strong>{site.operator.name}, an individual</strong>, who creates and
    operates this website. No separate company or LLC has been registered. Where
    applicable, {site.operator.name} is the controller of personal information
    used for the independent website and support purposes described here.
    Supplied contact location: {site.operator.location}. A full business mailing
    address has not yet been confirmed.
  </p>
);
export const contactClause = (
  <p>
    Email{" "}
    <a href={emailLink("iyanju privacy request")}>{site.operator.email}</a> with
    the subject “iyanju privacy request.” Mention the relevant tool and request,
    and share only what is needed. Do not send passwords, access tokens, or
    private calendar links. You can make a request without an account.
    Proportionate verification may be needed to protect information and confirm
    authority to act.
  </p>
);

export const privacySections: LegalSection[] = [
  {
    id: "scope",
    title: "1. Who operates this site",
    content: (
      <>
        {operatorClause}
        <p>
          This draft covers <strong>{site.url}</strong>, related enquiries, and
          account features. The website uses Vercel hosting and Cloudflare DNS.
          This remains a draft without an effective date while the operator
          completes the wider policy and provider review.
        </p>
      </>
    ),
  },
  {
    id: "tools",
    title: "2. The website and the tools",
    content: (
      <>
        <p>
          This website introduces independently built software. It does not load
          your Kazi tasks, projects, calendar, agent credentials, or workspace
          membership. Following a product link takes you to that product’s
          service.
        </p>
        <p>
          <a href={kazi.privacyUrl}>Kazi’s own privacy notice</a> explains its
          accounts, workspace content, optional calendar and agent connections,
          retention, and choices. For an organization-controlled workspace, that
          organization may determine how work information is used; its
          instructions and responsibilities differ from the operator’s
          independent account, security, and support purposes.
        </p>
        <p>
          Shared sign-in would not combine product databases, grant
          cross-product access, authorize AI training, share calendar
          information, or permit undisclosed analytics.
        </p>
      </>
    ),
  },
  {
    id: "information",
    title: "3. Information, sources, and purposes",
    content: (
      <>
        <ul>
          <li>
            <strong>Browsing:</strong> the application has no visitor database,
            contact form, analytics collection endpoint, or advertising system.
            A local or deployed web server necessarily handles requests, which
            can include an IP address, requested path, time, and
            browser/connection information. Hosting and security providers may
            keep operational records under their own schedules.
          </li>
          <li>
            <strong>Contact:</strong> if you email the operator, your email
            address, message, and any information you choose to include are
            received through email services. They are used to respond, resolve
            the issue, and keep relevant correspondence. Information may also
            come from a representative acting for you or a tool administrator
            helping explain a request.
          </li>
          <li>
            <strong>Requests and security:</strong> limited information may be
            needed to verify a privacy request, investigate a reported problem,
            prevent misuse, or meet a legal obligation. Do not include
            unnecessary sensitive information.
          </li>
        </ul>
        <p>
          Providing an email is voluntary. Without enough information, the
          operator may be unable to answer or verify a specific request. This
          public site does not make decisions with legal or similarly
          significant effects through automated profiling.
        </p>
      </>
    ),
  },
  {
    id: "grounds",
    title: "4. Grounds for processing",
    content: (
      <>
        <p>
          Where GDPR, UK GDPR, or similar rules apply, proposed grounds for the
          independent purposes above are legitimate interests in operating a
          reliable website and answering enquiries, taking requested steps
          toward a service or performing an applicable contract, and compliance
          with a specific legal obligation when one applies. Legitimate
          interests require considering your interests and rights.
        </p>
        <p>
          Consent would be sought for optional processing when required, and
          could be withdrawn. Mere browsing is not blanket consent. Final
          grounds and any balancing assessment must be recorded against the
          actual deployed practices before this draft becomes effective.
        </p>
      </>
    ),
  },
  {
    id: "accounts",
    title: "5. Account information and shared identity",
    content: (
      <>
        <p>
          {accountsEnabled
            ? "Clerk provides iyanju account registration and sign-in at /account."
            : "Account registration and sign-in are not enabled in this environment."}{" "}
          Public pages do not initialize Clerk or fetch a user profile. Existing
          Kazi accounts continue to be managed by Kazi until that application
          adopts the shared identity.
        </p>
        <p>
          When you use an account, Clerk processes your email address, username,
          password credentials, optional profile name, verification information,
          account ID, session cookies, device and connection details, and
          security records to create the account, authenticate you, and help
          prevent misuse. Production sign-in uses email or username and
          password, with email verification; supported email-code flows may also
          be offered. Google and GitHub sign-in are not configured for
          production.
        </p>
        <p>
          Participating applications can recognize the same identity while
          managing their own onboarding, memberships, roles, and data. Creating
          an iyanju account does not migrate an existing application account or
          grant workspace access. Account profiles remain with Clerk until
          removed, subject to security, legal, and provider retention needs.
        </p>
        <p>
          Removing access or data for one tool is different from deleting the
          whole shared identity. Deleting a Clerk profile alone does not prove
          that product records, shared contributions, support mail, or backups
          have been erased. Contact the operator to clarify the scope before
          requesting removal.
        </p>
      </>
    ),
  },
  {
    id: "recipients",
    title: "6. Providers and disclosures",
    content: (
      <>
        <p>
          Vercel hosts the website and Cloudflare manages its DNS. Local
          development uses a local server. The contact address uses Gmail;
          sending mail also involves your own email provider. Clerk provides the
          account service when enabled.
        </p>
        <p>
          This public site does not use Convex, Resend, a calendar API, or an AI
          model API. Those services must not be inferred from Kazi’s separate
          implementation. Fonts and brand artwork are served from this site.
        </p>
        <p>
          Necessary service providers may process information to deliver
          hosting, email, identity when enabled, and security. Information may
          be disclosed when legally required, to protect rights and security, or
          in a properly arranged future change of operator with applicable
          notices and safeguards. No such transfer or new LLC is claimed here.
        </p>
        <p>
          Review{" "}
          <a href="https://policies.google.com/privacy">
            Google’s privacy information
          </a>
          ,{" "}
          <a href="https://vercel.com/legal/privacy-policy">
            Vercel’s privacy information
          </a>{" "}
          and{" "}
          <a href="https://clerk.com/legal/privacy">
            Clerk’s privacy information
          </a>{" "}
          for the account service. Provider contracts and region settings remain
          part of the operator’s policy review.
        </p>
      </>
    ),
  },
  {
    id: "storage",
    title: "7. Cookies, storage, and analytics",
    content: (
      <>
        <p>
          The public pages do not initialize account storage. Signing in uses
          Clerk’s necessary authentication and session cookies, which may be
          present on subsequent visits to the website. The mobile menu and
          copy-email feedback use temporary in-memory state. Your browser may
          cache pages, fonts, and assets. Copying the email address writes to
          your clipboard only after you select that action.
        </p>
        <p>
          No third-party analytics SDK, advertising trackers, session replay,
          fingerprinting, or content capture is included. There is no dedicated
          adoption-event collector or server-side visitor counting system. The
          site does not sell personal information or share it for cross-context
          behavioral advertising through its implemented features.
        </p>
        <p>
          Host/security records are separate from optional analytics and must be
          assessed with the deployed service. Clerk’s functional storage
          supports sign-in and session security. Any future optional analytics
          requires purpose limits, applicable consent and opt-outs, objection
          handling, and required preference-signal handling before collection
          starts.
        </p>
        <p>
          AI assistance in writing this software does not mean your browsing or
          email content is automatically sent to an AI service by this website.
        </p>
      </>
    ),
  },
  {
    id: "retention",
    title: "8. Retention and deletion",
    content: (
      <>
        <p>
          There is no application visitor database to erase here. Support
          correspondence is retained according to the need to resolve and
          document the enquiry, security concerns, legal duties, and any
          relevant dispute. Mail and hosting provider schedules may also affect
          records and backups. A documented category-by-category schedule and
          actual removal process remain to be confirmed; no fixed deletion
          deadline or verified backup-erasure period is promised.
        </p>
        <p>
          There is no optional analytics pipeline. Account and support records
          are personal information and are handled separately from any future
          anonymous statistics.
        </p>
        <p>
          Tool records follow each product’s own notice and the applicable
          controller’s responsibilities. Archiving content, removing membership,
          revoking a connection, and deleting an account have different effects.
          Verified requests will need to be scoped and evaluated with applicable
          legal limits and provider capabilities.
        </p>
      </>
    ),
  },
  {
    id: "security-transfers",
    title: "9. Security and international processing",
    content: (
      <>
        <p>
          The implementation minimizes collected data, keeps administrative
          credentials out of browser code, and isolates optional account
          features. Hosting should use encrypted transport and proportionate
          access controls. No service can guarantee absolute security; report
          concerns through the contact address without including secrets.
        </p>
        <p>
          The operator is in the United States. Email, hosting when deployed,
          and identity when enabled may involve processing in the United States
          and other provider locations, where laws differ. Actual regions,
          subprocessors, agreements, and any required transfer mechanism must be
          verified before this notice is made effective. No EU-only hosting,
          adequacy certification, appointed representative, or established
          transfer safeguard is asserted.
        </p>
        <p>
          Where law requires a transfer arrangement or incident notification,
          the applicable requirements need to be met. Using the site is not
          blanket consent to an international transfer.
        </p>
      </>
    ),
  },
  {
    id: "rights",
    title: "10. Your choices and requests",
    content: (
      <>
        <p>
          Depending on your location, applicable law, and its conditions, rights
          may include access, correction, deletion, restriction, portability,
          objection to legitimate-interest processing, withdrawal of consent,
          and applicable opt-outs or appeals. You may also complain to a
          competent regulator. No claim is made that every regional law applies
          regardless of thresholds.
        </p>
        {contactClause}
        <p>
          Requests should be handled within applicable legal deadlines, with an
          explanation of lawful limits or extensions and available appeal or
          complaint routes. An organization may need to handle requests about
          its controlled workspace content with the operator’s assistance.
        </p>
        <p>
          Where applicable, EEA/UK/Swiss rights and US state rights can be
          exercised through the same contact. Find your{" "}
          <a href="https://www.edpb.europa.eu/about-edpb/our-members_en">
            EEA authority
          </a>
          , the <a href="https://ico.org.uk/make-a-complaint/">UK ICO</a>, or
          the <a href="https://www.edoeb.admin.ch/en">Swiss FDPIC</a>.
          Applicable US state rights may include opting out of sale, targeted
          advertising, or certain profiling; the public site implements none of
          those activities. Required opt-out signals must be honored if
          applicable collection is introduced.
        </p>
      </>
    ),
  },
  {
    id: "children",
    title: "11. Children and eligibility",
    content: (
      <>
        <p>
          The marketing website is publicly readable and does not ask for a date
          of birth or identity document. An 18+ eligibility rule has been
          recommended for tool accounts but is not established or enforced
          across the products by this website. Check the individual tool’s
          actual access rules.
        </p>
        <p>
          The site is not designed to solicit children’s information. If you
          believe a child has supplied information, contact the operator to
          investigate and take appropriate steps under applicable law. Any
          future age confirmation should minimize data collection; an age policy
          is not a substitute for children’s privacy obligations.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "12. Changes and contact",
    content: (
      <>
        <p>
          This draft was prepared {site.legalReviewDate}. It is not an effective
          finalized policy. Practices, provider arrangements, and legal
          requirements must be reviewed before publication as an effective
          notice. Material changes should be communicated appropriately and
          consent sought separately where required.
        </p>
        {contactClause}
        <p>
          {site.operator.name}
          <br />
          {site.operator.location}
          <br />
          Operating independently under the {site.name} brand.
        </p>
      </>
    ),
  },
];
