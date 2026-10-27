import type { ReactNode } from "react";
import { site, emailLink } from "./site";
import { kazi } from "./products";
import { identityConfig } from "@/lib/identity-config";
import { MINIMUM_ACCOUNT_AGE } from "@/lib/account-eligibility";

const accountsEnabled = identityConfig(process.env).enabled;
export type LegalSection = { id: string; title: string; content: ReactNode };

export const operatorClause = (
  <p>
    I’m <strong>{site.operator.name}</strong>, the individual creator and
    operator of {site.name}. I’m responsible for the personal information used
    to operate this website and respond to enquiries, and act as its controller
    where applicable. My contact address is {site.operator.address}.
  </p>
);

export const contactClause = (
  <p>
    Email{" "}
    <a href={emailLink("iYANJU privacy request")}>{site.operator.email}</a> with
    the subject “iYANJU privacy request.” Mention the relevant tool and what you
    need, and share only the information necessary to handle your request.
    Please leave out passwords, access tokens, and private calendar links. You
    can make a request without an account. I may need to verify your identity or
    authority to protect the information involved.
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
          This notice covers <strong>{site.url}</strong>, enquiries sent through
          its contact address, and account features when available. It explains
          what this website handles and how to contact me about your privacy.
        </p>
      </>
    ),
  },
  {
    id: "tools",
    title: "2. The website and the applications",
    content: (
      <>
        <p>
          iYANJU introduces personal projects and applications. This website
          does not load your Kazi tasks, projects, calendar, agent credentials,
          or workspace membership. Following an application link takes you to
          that application’s service, which has its own data and permissions.
        </p>
        <p>
          <a href={kazi.privacyUrl}>Kazi’s privacy notice</a> explains its
          accounts, workspace content, optional calendar and agent connections,
          retention, and choices. An organization that controls a workspace may
          have its own responsibilities for the information used there.
        </p>
        <p>
          Shared sign-in does not by itself combine application databases, grant
          workspace access, share calendar information, or authorize
          cross-application use of your content.
        </p>
      </>
    ),
  },
  {
    id: "information",
    title: "3. Information and how it is used",
    content: (
      <>
        <ul>
          <li>
            <strong>Website requests:</strong> the web server and its hosting
            and security providers handle information such as your IP address,
            requested page, request time, and browser or connection details to
            deliver the site, maintain reliability, and investigate problems.
            There is no application visitor database, contact form, or
            advertising system on this website.
          </li>
          <li>
            <strong>Correspondence:</strong> when you email me, I receive your
            email address, message, and any information you include. I use it to
            respond, resolve the enquiry, and keep relevant correspondence. A
            representative or application administrator may also provide
            information when helping with a request.
          </li>
          <li>
            <strong>Privacy and security requests:</strong> I may use limited
            additional information to verify a request, investigate a reported
            problem, prevent misuse, or meet a legal obligation.
          </li>
        </ul>
        <p>
          Sending an email is voluntary. Without enough information, I may be
          unable to answer or verify a specific request. This website does not
          use automated profiling to make decisions with legal or similarly
          significant effects about you.
        </p>
      </>
    ),
  },
  {
    id: "grounds",
    title: "4. Reasons for processing",
    content: (
      <>
        <p>
          I use information for the purposes described above. Where a legal
          basis is required, this may be legitimate interests in operating a
          reliable and secure website and answering enquiries, steps you ask me
          to take in relation to a service, an applicable contract, or a legal
          obligation. The basis depends on the activity and the law that
          applies.
        </p>
        <p>
          Where consent is required for optional processing, I will ask for it
          separately and you can withdraw it. Visiting the website is not
          blanket consent to other uses of your information.
        </p>
      </>
    ),
  },
  {
    id: "accounts",
    title: "5. Accounts and application access",
    content: (
      <>
        <p>
          {accountsEnabled
            ? "Clerk provides account registration and sign-in for iYANJU."
            : "Account registration and sign-in are not currently available on this website."}{" "}
          Public pages are readable without an account. Existing Kazi accounts
          remain managed by Kazi; this website does not migrate them.
        </p>
        {accountsEnabled && (
          <>
            <p>
              Clerk processes your email address, username, password
              credentials, optional profile name, verification information,
              account ID, session cookies, device and connection details, and
              security records to register and authenticate you and help prevent
              misuse.
            </p>
            <p>
              You must be {MINIMUM_ACCOUNT_AGE} or older to create an iYANJU
              account. During signup, we record your minimum-age confirmation
              and its timestamp with your account. This is a self-declaration;
              we do not request your date of birth or verify your age.
            </p>
            <p>
              If you choose Google or GitHub sign-in, that provider shares the
              identity and basic profile information needed to authenticate you,
              such as your account identifier and email address. This does not
              connect your calendars, repositories, or YouTube data to an
              application. Those optional integrations require separate
              authorization. Clerk records when your shared account was created.
            </p>
            <p>
              When you open Account, this website requests an owner-only service
              activation summary from participating applications. It contains
              service status and available first-use dates, not your tasks or
              other application content. The summary is used to show your
              services without keeping a separate activation database here.
              Checking Account does not activate an application or grant access.
              Unavailable checks and unknown historical dates are shown as such.
            </p>
            <p>
              Each participating application manages its own onboarding,
              memberships, permissions, and records. An iYANJU account does not
              automatically grant access to another person’s workspace. Removing
              an account profile is different from removing information held by
              an application. Contact me to clarify which account or application
              information you want removed.
            </p>
          </>
        )}
      </>
    ),
  },
  {
    id: "providers",
    title: "6. Providers and disclosures",
    content: (
      <>
        <p>
          Vercel hosts the website, Cloudflare manages its DNS, and the contact
          address uses Gmail. Sending an email also involves your email
          provider.
          {accountsEnabled && " Clerk provides the account service."} These
          providers handle information needed to deliver their services,
          including operational and security records.
        </p>
        <p>
          I may disclose information when required by law or when necessary to
          protect rights, investigate misuse, or address a security issue.
          Information is not sold or shared for cross-context behavioral
          advertising through this website.
        </p>
        <p>
          You can read the privacy information from{" "}
          <a href="https://vercel.com/legal/privacy-notice">Vercel</a>,{" "}
          <a href="https://www.cloudflare.com/privacypolicy/">Cloudflare</a>,
          and <a href="https://policies.google.com/privacy">Google</a>
          {accountsEnabled && (
            <>
              , and <a href="https://clerk.com/legal/privacy">Clerk</a>
            </>
          )}{" "}
          for more about their services.
        </p>
      </>
    ),
  },
  {
    id: "storage-ai",
    title: "7. Cookies, analytics, and AI",
    content: (
      <>
        <p>
          Public pages do not set advertising or analytics cookies. The website
          does not include third-party analytics, session replay,
          fingerprinting, or an adoption-event collector. Your browser may cache
          pages, fonts, and assets, which are served from this website. The menu
          and copy-email feedback use temporary in-memory state. Copying the
          email address writes to your clipboard only when you select that
          action.
        </p>
        {accountsEnabled && (
          <p>
            Clerk uses authentication and session cookies when you use an
            account. Those cookies may remain present on later visits and
            support account and session security.
          </p>
        )}
        <p>
          This website was built with assistance from AI. It does not send your
          browsing activity or email content to an AI model through its
          implemented features. An application that uses AI at runtime explains
          that separately in its own information and privacy notice.
        </p>
      </>
    ),
  },
  {
    id: "retention",
    title: "8. Retention and removal",
    content: (
      <>
        <p>
          I keep correspondence for as long as needed to handle and document the
          enquiry, address security concerns, meet legal obligations, or resolve
          a relevant dispute. Hosting, email, and other providers also maintain
          records and backups under their own retention practices. There is no
          application visitor database or optional analytics database on this
          website.
        </p>
        <p>
          You can ask me to remove information you have provided. I will
          consider the request and explain any applicable limits, including
          legal requirements, shared records, or provider capabilities.
          Application content and accounts follow the relevant application’s
          notice and removal process.
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
          The website uses HTTPS and keeps administrative credentials out of
          browser code. I limit the information collected and keep account
          features separate from public pages. No service can guarantee absolute
          security. Please report concerns through the contact address without
          including passwords or other secrets.
        </p>
        <p>
          My contact location is Benin. Hosting, email, and account providers
          may process information in other countries, where privacy laws may
          differ from those where you live. Any applicable requirements for
          international processing remain relevant; using this website is not
          blanket consent to an international transfer.
        </p>
      </>
    ),
  },
  {
    id: "rights",
    title: "10. Your privacy choices",
    content: (
      <>
        <p>
          Depending on the applicable law and its conditions, you may have
          rights to access, correct, delete, restrict, or receive a copy of your
          information, object to processing, or withdraw consent. You can
          contact me to exercise a right or ask how your information is handled.
          I will respond within the applicable legal time limits and explain any
          lawful limits or extensions.
        </p>
        {contactClause}
        <p>
          You may also complain to the relevant data protection authority,
          including Benin’s{" "}
          <a href="https://service.apdp.bj/">
            Autorité de Protection des Données Personnelles (APDP)
          </a>
          , or the competent authority where you live. An organization may need
          to handle a request concerning information in its own workspace.
        </p>
      </>
    ),
  },
  {
    id: "children",
    title: "11. Children",
    content: (
      <p>
        This public website does not ask for a date of birth or identity
        document and is not designed to solicit children’s information.
        Applications have their own access and eligibility rules. If you believe
        a child has provided personal information, contact me so I can
        investigate and take appropriate steps under applicable law.
      </p>
    ),
  },
  {
    id: "changes",
    title: "12. Changes and contact",
    content: (
      <p>
        I may update this notice as the website and its practices change. The
        date above identifies the latest version. Material changes will be
        communicated as required, and consent will be requested separately where
        needed. For questions, contact{" "}
        <a href={emailLink("iYANJU privacy enquiry")}>{site.operator.email}</a>.
      </p>
    ),
  },
];
