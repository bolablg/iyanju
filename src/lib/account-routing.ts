export const PRODUCTION_ACCOUNT_ORIGINS = [
  "https://iyanju.com",
  "https://kazi.iyanju.com",
  "https://wlan.iyanju.com",
  "https://playkin.iyanju.com",
] as const;

// A return destination carries no identity or permission; each app verifies its session.
export function accountReturnUrl(
  value: string | string[] | undefined,
  allowedOrigins: readonly string[],
): string {
  if (
    typeof value !== "string" ||
    value !== value.trim() ||
    /[\\\u0000-\u0020\u007f]/.test(value) ||
    /%(?:0[0-9a-f]|1[0-9a-f]|5c|7f)/i.test(value)
  )
    return "/account";
  // Local navigation is deliberately limited; arbitrary public routes may redirect again.
  if (value === "/account" || value === "/tools") return value;
  try {
    const url = new URL(value);
    if (
      !allowedOrigins.includes(url.origin) ||
      url.username ||
      url.password ||
      !["https:", "http:"].includes(url.protocol)
    )
      return "/account";
    // Never use an authentication page as the completion destination.
    if (
      url.origin === "https://iyanju.com" &&
      url.pathname.startsWith("/account")
    )
      return "/account";
    return url.href;
  } catch {
    return "/account";
  }
}

export function accountEntryUrl(signUp: boolean, returnUrl = "/account") {
  const path = signUp ? "/account/sign-up" : "/account";
  return returnUrl === "/account"
    ? path
    : `${path}?${new URLSearchParams({ redirect_url: returnUrl })}`;
}
