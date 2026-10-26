import { clerkMiddleware } from "@clerk/nextjs/server";
import {
  NextResponse,
  type NextRequest,
  type NextFetchEvent,
} from "next/server";
import { identityConfig } from "./lib/identity-config";
export default function proxy(request: NextRequest, event: NextFetchEvent) {
  const config = identityConfig(process.env);
  if (!config.enabled) return NextResponse.next();
  return clerkMiddleware({ authorizedParties: config.authorizedParties })(
    request,
    event,
  );
}
export const config = { matcher: ["/account(.*)"] };
