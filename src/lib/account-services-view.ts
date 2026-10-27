import { collection, kazi } from "../content/products.ts";

export const accountServiceIds = ["kazi", "wlan", "playkin"] as const;
export type AccountServiceId = (typeof accountServiceIds)[number];
export type ServiceActivation = {
  activatedAt: number | null;
  firstObservedAt: number;
};
export type AccountService =
  | {
      serviceId: AccountServiceId;
      state: "activated";
      activation: ServiceActivation;
    }
  | {
      serviceId: AccountServiceId;
      state: "not_activated" | "unavailable" | "restricted";
    };
export type AccountServiceSummary = { version: 1; services: AccountService[] };

const catalogueEntry = (id: string) =>
  collection.find((item) => item.slug === id)!;
export const accountServiceDisplay = {
  kazi: {
    name: kazi.name,
    category: kazi.category,
    logo: kazi.logo,
    logoWidth: 108,
    logoHeight: 34,
    url: kazi.url,
    tone: "violet",
  },
  wlan: {
    name: catalogueEntry("wlan").name,
    category: "Writing studio",
    logo: "/brand/wlan-wordmark.svg",
    logoWidth: 108,
    logoHeight: 38,
    url: catalogueEntry("wlan").url,
    tone: "orange",
  },
  playkin: {
    name: catalogueEntry("playkin").name,
    category: "Video & playlists",
    logo: "/brand/playkin-mark.png",
    logoWidth: 64,
    logoHeight: 64,
    url: catalogueEntry("playkin").url,
    tone: "mint",
  },
} as const;

export function hasConvexAudience(audience: unknown): boolean {
  return (
    audience === "convex" ||
    (Array.isArray(audience) &&
      audience.length === 1 &&
      audience[0] === "convex")
  );
}
const validTimestamp = (value: unknown): value is number =>
  typeof value === "number" &&
  Number.isSafeInteger(value) &&
  value >= 0 &&
  Number.isFinite(new Date(value).getTime());

export function parseAccountServices(
  value: unknown,
): AccountServiceSummary | null {
  if (!value || typeof value !== "object") return null;
  const data = value as { version?: unknown; services?: unknown };
  if (
    data.version !== 1 ||
    !Array.isArray(data.services) ||
    data.services.length !== accountServiceIds.length
  )
    return null;
  const services: AccountService[] = [];
  const seen = new Set<string>();
  for (const item of data.services) {
    if (!item || typeof item !== "object") return null;
    const record = item as Record<string, unknown>;
    const serviceId = record.serviceId as AccountServiceId;
    if (!accountServiceIds.includes(serviceId) || seen.has(serviceId))
      return null;
    seen.add(serviceId);
    if (
      record.state === "not_activated" ||
      record.state === "unavailable" ||
      record.state === "restricted"
    ) {
      services.push({ serviceId, state: record.state });
      continue;
    }
    if (
      record.state !== "activated" ||
      !record.activation ||
      typeof record.activation !== "object"
    )
      return null;
    const activation = record.activation as Record<string, unknown>;
    if (
      !(
        activation.activatedAt === null ||
        validTimestamp(activation.activatedAt)
      ) ||
      !validTimestamp(activation.firstObservedAt)
    )
      return null;
    services.push({
      serviceId,
      state: "activated",
      activation: {
        activatedAt: activation.activatedAt,
        firstObservedAt: activation.firstObservedAt,
      },
    });
  }
  return { version: 1, services };
}

export function activationDateLabel(activation: ServiceActivation): string {
  if (activation.activatedAt === null) return "First-use date unknown";
  return `First used ${new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(activation.activatedAt)}`;
}

export function accountServiceOpenUrl(
  serviceId: AccountServiceId,
  rootOrigin: string,
): string | null {
  if (rootOrigin === "https://iyanju.com")
    return accountServiceDisplay[serviceId].url;
  if (rootOrigin === "http://127.0.0.1:49569" && serviceId === "kazi")
    return "http://127.0.0.1:5192";
  return null;
}
