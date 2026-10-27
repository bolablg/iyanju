import { accountRequestHandler } from "@/lib/account-request";

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  return accountRequestHandler("services")(request);
}
