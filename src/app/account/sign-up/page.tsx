import { AccountPage } from "@/components/account-page";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "Create an account",
  "Shared iyanju accounts are being prepared. Open Kazi to use its existing account service.",
  "/account/sign-up",
  true,
);
export default function SignUp() {
  return <AccountPage signUp />;
}
