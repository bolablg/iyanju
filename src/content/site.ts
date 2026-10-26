export const site = {
  name: "iyanju",
  url: "https://iyanju.com",
  description:
    "Independent applications created and operated by Bolaji BALOGOUN with curiosity, care, and assistance from AI.",
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
  { href: "/tools", label: "Applications" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;
