import { redirect } from "next/navigation";

/**
 * /legal → redirect to first legal sub-page (canonical entry).
 * Wave 6 Sprint 3.5C-3 commit 1.
 */
export default function LegalIndex() {
  redirect("/legal/terms");
}
