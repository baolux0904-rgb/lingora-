export function PathLoadingSkeleton() {
  return (
    <div className="flex flex-col items-center gap-6 py-10">
      <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: "rgba(46,211,198,0.3)", borderTopColor: "var(--color-success)" }} />
      <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>Loading learning path…</p>
    </div>
  );
}
