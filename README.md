# iyanju

**Independent applications, created with curiosity, care, and assistance from AI.**

iyanju is a collection of practical software created and operated by **Bolaji BALOGOUN**. It brings applications with different purposes together under one home, with a shared emphasis on useful features, clear choices, and thoughtful design.

For Bolaji, the name carries a personal sense of encouragement and effort: taking an idea, putting in the effort, and making something useful. He builds with assistance from AI and challenges its proposals on decisions, architecture, security, and design. The collection is not limited to a particular field. Each application's own features and privacy information explain whether and how it uses AI at runtime.

## The collection

| Application                                          | Purpose                                                                                                                |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| [Kazi](https://kazi.iyanju.com)                      | Work management for people, teams, and connected agents: tasks, projects, sprints, timelines, calendars, and planning. |
| PlayKin                                              | A YouTube companion for playlist management and shared listening. Currently in development.                            |
| [iyanju Agentory](https://github.com/bolablg/skills) | A collection of portable skills and integrations for AI assistants.                                                    |

The collection grows around real applications rather than a fixed product category. Each application owns its service-specific data and permissions.

## Architecture

The platform uses **Next.js, React, and TypeScript** for the public website and application catalogue. Product content and operator information are structured separately from reusable interface components. Public pages are server rendered and remain readable without an account.

**Clerk** is the identity integration. The intended model is one iyanju identity across participating applications, with onboarding, memberships, authorization, and product data enforced by each service. Existing application accounts require a deliberate integration path; a shared login does not merge their data.

**Vercel** is the production hosting platform, with **Cloudflare** managing the domain's DNS. The public catalogue has no application database or third-party analytics SDK.

## About

Created and operated independently by **Bolaji BALOGOUN**.

[Website](https://iyanju.com) · [Contact](mailto:bolajibalogoun@gmail.com)
