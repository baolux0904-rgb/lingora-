"use client";

/**
 * Grammar route — wraps GrammarTab. The tab internally manages an overlay
 * state for individual lessons; the (app) shell stays visible regardless
 * (PR5 may reassess if lessons should hide the nav).
 */

import dynamic from "next/dynamic";

const GrammarTab = dynamic(
  () => import("@/components/Grammar").then((m) => ({ default: m.GrammarTab })),
  { ssr: false },
);

export default function LearnGrammarPage() {
  return <GrammarTab />;
}
