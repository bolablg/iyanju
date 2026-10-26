export const site = {
  name: "iyanju",
  url: "https://iyanju.com",
  description:
    "Practical tools, made with care. Independent software created and operated by Bolaji BALOGOUN with the help of AI.",
  operator: {
    name: "Bolaji BALOGOUN",
    location: "Arkansas 72223, United States",
    email: "bolajibalogoun@gmail.com",
  },
  legalReviewDate: "October 25, 2026",
} as const;

export const emailLink = (subject?: string) =>
  `mailto:${site.operator.email}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`;
export const navigation = [
  { href: "/tools", label: "The tools" },
  { href: "/about", label: "The story" },
  { href: "/contact", label: "Get in touch" },
] as const;
