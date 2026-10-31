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
          its contact address, and shared account features when available. It
          also explains how application data and optional external connections
          relate to this website. Each application’s notice gives the details of
          its own processing, storage, providers, and removal process.
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
          Applications handle information needed for the features you use. For
          example:
        </p>
        <ul>
          <li>
            <strong>Kazi:</strong> workspace information such as tasks,
            projects, comments, plans, preferences, and membership permissions.
            Its optional Google availability connection uses calendar names and
            identifiers and busy intervals to help avoid scheduling conflicts.
            That availability connection does not request event descriptions,
            attendees, or permission to write Google Calendar events. See{" "}
            <a href={kazi.privacyUrl}>Kazi’s privacy notice</a>.
          </li>
          <li>
            <strong>PlayKin:</strong> Google account and YouTube channel
            identifiers, playlist and video metadata, and subscriptions for
            library management. A secondary source account provides read-only
            information for copying. The Google account linked to your iYANJU
            identity is the main destination for authorized playlist changes and
            subscription transfers. See{" "}
            <a href="https://playkin.iyanju.com/privacy">
              PlayKin’s privacy notice
            </a>
            .
          </li>
        </ul>
        <p>
          Connections also involve authorization credentials and connection
          status, handled by the relevant application and its providers. An
          organization that controls a workspace may have its own
          responsibilities for the information used there.
        </p>
        <p>
          Shared sign-in does not by itself combine application databases, grant
          workspace access, share calendar information, or authorize
          cross-application use of your content. Google sign-in supplies account
          identity information; YouTube and calendar access require their own
          feature-specific authorization.
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
          implemented features and has no built-in AI model that evaluates your
          content. PlayKin’s YouTube features and Kazi’s calendar and planning
          features do not call a built-in AI model. Software can still process
          information to provide those features, such as calculating available
          planning time. Optional external AI clients are a separate data path,
          explained below. Other applications describe their own features and
          data use in their notices.
        </p>
      </>
    ),
  },
  {
    id: "mcp",
    title: "8. Optional MCP clients and AI providers",
    content: (
      <>
        <p>
          Where an application such as Kazi supports the Model Context Protocol
          (MCP), you can authorize an external client of your choice. That
          client may be an AI assistant connected to a third-party model
          provider. Connecting it is optional; visiting this website or creating
          an iYANJU account does not by itself authorize an MCP client.
        </p>
        <p>
          An authorized client can request information or perform actions within
          its credential scopes and your application permissions. Depending on
          that access, it may retrieve workspace content, create or edit work,
          or receive calendar names and busy intervals. Read access can include
          information from connected services; a read-only client can still
          transmit what it receives to its AI provider. Permission to act does
          not mean that you approve each individual action in the application.
        </p>
        <p>
          Information returned to the client leaves the application and may be
          processed or retained by that client, its AI provider, and any model
          gateway or other provider it uses. Their terms, plan, settings, and
          privacy practices determine that further processing, subject to
          applicable law and source-service restrictions. iYANJU does not choose
          a built-in AI provider for these connections or guarantee every
          external provider’s retention or model-training settings.
        </p>
        <p>
          Before connecting, review the client and provider, the data it may
          receive, its permissions, retention, and model-training controls.
          Grant only the access you need and have authority to share. In Kazi,
          credentials can be revoked in Connections → MCP &amp; agents.
          Revocation prevents future use of that credential; it does not
          retrieve copies already received by a client, delete provider records,
          or reverse completed actions. Contact the external provider about its
          copies and your rights there.
        </p>
        <p>
          User choice does not remove the operator’s responsibilities for the
          application’s access controls, security, disclosures, and lawful
          handling of information. The{" "}
          <a href="/terms#mcp">
            terms explain users’ connection responsibilities
          </a>
          .
        </p>
      </>
    ),
  },
  {
    id: "google-data",
    title: "9. Google data and Limited Use",
    content: (
      <>
        <p>
          Use and transfer of information received from Google APIs is subject
          to the{" "}
          <a href="https://developers.google.com/terms/api-services-user-data-policy">
            Google API Services User Data Policy
          </a>
          , including its Limited Use requirements, and the applicable{" "}
          <a href="https://developers.google.com/workspace/workspace-api-user-data-developer-policy">
            Google Workspace user data policy
          </a>
          . These restrictions also apply to data derived from Google
          information, such as calendar availability returned to an MCP client.
        </p>
        <p>
          Google information is for the authorized application features and
          permitted transfers. It must not be sold, used for advertising, or
          used to create, train, or improve general-purpose AI models. Choosing
          an external client or consenting to a connection does not waive these
          restrictions. Do not connect a client to Google-derived information
          when its processing would violate them. A provider’s statement that
          training is disabled does not by itself establish that every use or
          transfer is permitted.
        </p>
      </>
    ),
  },
  {
    id: "retention",
    title: "10. Retention and removal",
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
    title: "11. Security and international processing",
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
    title: "12. Your privacy choices",
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
    title: "13. Children",
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
    title: "14. Changes and contact",
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
