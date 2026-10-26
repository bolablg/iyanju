import { LegalDocument } from "@/components/legal-document";
import { privacySections } from "@/content/privacy";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "Privacy",
  "How iyanju handles website visits, enquiries, accounts, and your privacy choices.",
  "/privacy",
);
export default function Privacy() {
  return (
    <LegalDocument
      title="Privacy, in plain sight."
      intro="How this website handles your information. Each tool has its own notice for the information and connections it handles."
      sections={privacySections}
    />
  );
}
