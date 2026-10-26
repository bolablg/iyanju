import { AccountPage } from "@/components/account-page";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "Create an account",
  "Create an iyanju account for participating applications.",
  "/account/sign-up",
  true,
);
export default function SignUp() {
  return <AccountPage signUp />;
}
