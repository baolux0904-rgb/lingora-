import { redirect } from "next/navigation";

/**
 * /lessons is not a standalone page — the lesson browser lives on the
 * home page's "Practice" tab.  Redirect any direct visits (bookmarks,
 * search-engine links, shared URLs) to the home page.
 */
export default function LessonsRedirect() {
  redirect("/");
}
