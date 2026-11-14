import { redirect } from "next/navigation";

/** The public news feed was replaced by the daily briefing product.
 * Existing news records remain available in the editorial database.
 */
export default function LegacyNewsPage() {
  redirect("/briefings");
}
