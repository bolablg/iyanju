import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { site } from "@/content/site";
import "./globals.css";
const sans = localFont({
  src: "../../public/fonts/dm-sans.woff2",
  variable: "--font-sans",
  display: "swap",
  weight: "100 900",
  fallback: ["Arial"],
});
const serif = localFont({
  src: "../../public/fonts/instrument-serif-italic.woff2",
  variable: "--font-serif",
  display: "swap",
  weight: "400",
  style: "italic",
  fallback: ["Georgia"],
});
export const viewport: Viewport = {
  themeColor: "#f7f5ee",
  colorScheme: "light",
};
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "iYanJu — Good ideas. Put to work.",
    template: "%s · iYanJu",
  },
  description: site.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_US",
    title: "iYanJu — Good ideas. Put to work.",
    description: site.description,
    url: site.url,
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Header />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
