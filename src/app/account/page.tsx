import {
  AccountPage,
  type AccountSearchParams,
} from "@/components/account-page";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "Your account",
  "Sign in to iYANJU. Each application manages its own data and permissions.",
  "/account",
  true,
);
export default function Account({
  searchParams,
}: {
  searchParams: AccountSearchParams;
}) {
  return <AccountPage searchParams={searchParams} />;
}
