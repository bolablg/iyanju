export const site = {
  name: "iyanju",
  url: "https://iyanju.com",
  description:
    "Personal projects and practical tools, built with curiosity, care, and assistance from AI.",
  operator: {
    name: "Bolaji BALOGOUN",
    location: "Benin, West Africa",
    address: "C/SB Maison Balogoun J., Gbetagbo, Abomey-Calavi, BENIN",
    email: "bolajibalogoun@gmail.com",
  },
  legalUpdatedDate: "October 25, 2026",
} as const;

export const emailLink = (subject?: string) =>
  `mailto:${site.operator.email}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`;
export const navigation = [
  { href: "/tools", label: "Applications" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;
