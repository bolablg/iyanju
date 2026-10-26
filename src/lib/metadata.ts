import type { Metadata } from "next";
import { site } from "@/content/site";
export function pageMetadata(
  title: string,
  description: string,
  path: string,
  draft = false,
): Metadata {
  return {
    title,
    description,
    alternates: { canonical: `${site.url}${path}` },
    openGraph: {
      title: `${title} · ${site.name}`,
      description,
      url: `${site.url}${path}`,
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: "iYanJu — Good ideas. Put to work.",
        },
      ],
    },
    ...(draft ? { robots: { index: false, follow: true } } : {}),
  };
}
