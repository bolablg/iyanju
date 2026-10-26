export type Product = {
  slug: string;
  name: string;
  url: string;
  privacyUrl: string;
  category: string;
  headline: string;
  description: string;
  logo: string;
  highlights: string[];
  capabilities: { title: string; description: string }[];
  access: { status: "unverified" | "website-reachable"; note: string };
};

export const products: Product[] = [
  {
    slug: "kazi",
    name: "Kazi",
    url: "https://kazi.iyanju.com",
    privacyUrl: "https://kazi.iyanju.com/privacy",
    category: "Work management",
    logo: "/brand/kazi-logo.svg",
    highlights: [
      "Tasks & projects",
      "Sprints & timelines",
      "Calendars & planning",
      "Optional agent connections",
    ],
    headline: "A place for the work ahead.",
    description:
      "Bring tasks, projects, and plans together. Kazi helps people, teams, and connected agents move work forward with a shared view of what matters.",
    access: {
      status: "website-reachable",
      note: "Opens Kazi’s own website. Sign-in and workspace access are managed there, with Kazi’s own privacy notice.",
    },
    capabilities: [
      {
        title: "Make the work clear",
        description:
          "Organize tasks and projects, plan sprints, and keep the next step in view.",
      },
      {
        title: "See the bigger picture",
        description:
          "Use Gantt timelines, calendars, scheduling, and reports to connect daily work to the plan.",
      },
      {
        title: "Move together",
        description:
          "Collaborate with your team around shared projects and the work that belongs to them.",
      },
      {
        title: "Connect on your terms",
        description:
          "Optional MCP connections let authorized agents work within the access you grant.",
      },
    ],
  },
];
export const kazi = products[0];
