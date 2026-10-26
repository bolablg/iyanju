import { AccountPage } from "@/components/account-page";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "Your account",
  "Sign in to iyanju. Each application manages its own data and permissions.",
  "/account",
  true,
);
export default function Account() {
  return <AccountPage />;
}
