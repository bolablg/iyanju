import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { products } from "@/content/products";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "",
    "/tools",
    ...products.map((p) => `/tools/${p.slug}`),
    "/about",
    "/contact",
  ].map((path) => ({ url: `${site.url}${path}` }));
}
