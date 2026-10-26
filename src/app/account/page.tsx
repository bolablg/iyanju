import { AccountPage } from "@/components/account-page";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "Your account",
  "The path to a shared iYanJu identity, with separate access and permissions for every tool.",
  "/account",
  true,
);
export default function Account() {
  return <AccountPage />;
}
