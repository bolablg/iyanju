# iYANJU

**Personal projects and practical tools, built with curiosity, care, and assistance from AI.**

iYANJU is a home for personal software projects created and operated by **Bolaji BALOGOUN**. It grows out of a love of technology, a wish to learn how software works, and the possibility of building a tool that does what you need.

Bolaji’s professional focus is data engineering, data analysis, and statistics. iYANJU gives his application side projects a separate home: a place to explore an idea, build something he wants to use, and share it for others to try. For now, it is a passion project; each application can evolve as it matures.

The Yoruba name carries a personal sense of encouragement and effort: taking an idea, putting in the effort, and making something useful. The projects are built with assistance from AI, with Bolaji directing and challenging its work on decisions, architecture, security, and design. The collection is open to any field. Each application explains whether and how it uses AI at runtime in its own features and privacy information.

## The collection

| Application                                          | Purpose                                                                                                                |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| [Kazi](https://kazi.iyanju.com)                      | Work management for people, teams, and connected agents: tasks, projects, sprints, timelines, calendars, and planning. |
| PlayKin                                              | A YouTube companion for playlist management and shared listening. Currently in development.                            |
| [iYANJU Agentory](https://github.com/bolablg/skills) | A collection of portable skills and integrations for AI assistants.                                                    |
| [Wlan](https://wlan.iyanju.com)                      | A collaborative writing studio for articles, writing styles, and drafts. Access by invitation.                         |

The collection grows around real applications rather than a fixed product category. Each application owns its service-specific data and permissions.

## Architecture

The platform uses **Next.js, React, and TypeScript** for the public website and application catalogue. Product content and operator information are structured separately from reusable interface components. Public pages are server rendered and remain readable without an account.

**Clerk** is the identity integration. The intended model is one iYANJU identity across participating applications, with onboarding, memberships, authorization, and product data enforced by each service. Existing application accounts require a deliberate integration path; a shared login does not merge their data.

**Vercel** is the production hosting platform, with **Cloudflare** managing the domain's DNS. The public catalogue has no application database or third-party analytics SDK.

[Website](https://iyanju.com) · [Contact](mailto:bolajibalogoun@gmail.com)
