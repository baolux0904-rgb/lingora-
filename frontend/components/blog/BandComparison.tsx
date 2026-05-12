interface BandComparisonProps {
  from: number;
  to: number;
}

function fmt(n: number): string {
  return n % 1 === 0 ? `${n}.0` : n.toFixed(1);
}

export default function BandComparison({ from, to }: BandComparisonProps) {
  return (
    <span className="inline-flex items-baseline gap-2 font-display italic text-navy whitespace-nowrap">
      <span>Band {fmt(from)}</span>
      <span aria-hidden="true" className="text-teal font-sans not-italic text-[0.9em]">
        →
      </span>
      <span>Band {fmt(to)}</span>
    </span>
  );
}
