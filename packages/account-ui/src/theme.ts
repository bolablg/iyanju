/** Serializable appearance settings, also importable from a React server component. */
export const accountTheme = {
  variables: {
    colorPrimary: "#18181b",
    colorBackground: "#ffffff",
    colorText: "#18181b",
    colorTextSecondary: "#59565d",
    fontFamily: '"iYANJU Account", sans-serif',
    borderRadius: "0",
  },
  elements: {
    card: { boxShadow: "none", border: "2px solid #18181b" },
    cardBox: { boxShadow: "none", maxWidth: "100%" },
    formButtonPrimary: { boxShadow: "none" },
  },
} as const;
