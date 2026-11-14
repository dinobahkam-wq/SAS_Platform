import { redirect } from "next/navigation";

/** The former mixed-media page is now split into visual knowledge and programs. */
export default function LegacyMediaPage() {
  redirect("/programs");
}
