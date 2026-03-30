import { PublicBrowseShell } from "@/components/layout/public-browse-shell";
import { ContactFeedbackPage } from "@/features/contact-feedback/components/contact-feedback-page";

export default function PublicContactFeedbackRoute() {
  return (
    <PublicBrowseShell>
      <ContactFeedbackPage />
    </PublicBrowseShell>
  );
}
