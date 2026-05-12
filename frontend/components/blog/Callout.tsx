import type { ReactNode } from "react";

type CalloutType = "info" | "warning" | "tip";

const MARK: Record<CalloutType, string> = {
  info: "ℹ",
  warning: "⚠",
  tip: "★",
};

const LABEL: Record<CalloutType, string> = {
  info: "Lưu ý",
  warning: "Cẩn thận",
  tip: "Mẹo",
};

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children: ReactNode;
}

export default function Callout({
  type = "info",
  title,
  children,
}: CalloutProps) {
  return (
    <aside
      role="note"
      aria-label={title ?? LABEL[type]}
      className="my-6 rounded-lg border border-navy/10 bg-cream-warm p-5 lg:p-6"
    >
      <p className="m-0 font-sans text-[13px] uppercase tracking-[0.08em] text-teal-dark font-semibold flex items-center gap-2">
        <span aria-hidden="true">{MARK[type]}</span>
        <span>{title ?? LABEL[type]}</span>
      </p>
      <div className="mt-3 font-sans text-[16px] lg:text-[17px] leading-[1.65] text-navy/85 [&>p]:m-0 [&>p+p]:mt-3">
        {children}
      </div>
    </aside>
  );
}
