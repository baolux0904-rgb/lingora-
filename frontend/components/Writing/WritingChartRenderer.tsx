"use client";

/**
 * WritingChartRenderer — renders the `chart_data` JSONB from a
 * writing_questions row into the Task 1 prompt panel.
 *
 * Supports four chart types seeded in writing-prompts-bank.json:
 *   - line   → multi-series LineChart (series[].points[].x/.y)
 *   - bar    → grouped BarChart over categories (series[].values[])
 *   - pie    → single PieChart (slices[].label/.value)
 *   - table  → plain HTML table (headers + rows[][])
 *
 * Rendering is defensive: malformed or missing data falls back to a
 * neutral "Không thể hiển thị biểu đồ" card rather than crashing the
 * writing screen.
 */

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { WritingChartType } from "@/lib/types";

const PALETTE = ["#00A896", "#1B2B4B", "#F07167", "#F9A826", "#7E4EC1", "#2E86AB"];

interface WritingChartRendererProps {
  chartType: WritingChartType;
  data: unknown;
  title?: string | null;
}

// ---------------------------------------------------------------------------
// Shape helpers (soft-typed: data is parsed JSONB, never fully trusted)
// ---------------------------------------------------------------------------

interface LinePoint { x: number | string; y: number }
interface LineSeries { name: string; points: LinePoint[] }
interface LineData { x_axis_label?: string; y_axis_label?: string; series?: LineSeries[] }

interface BarSeries { name: string; values: number[] }
interface BarData { x_axis_label?: string; y_axis_label?: string; categories?: string[]; series?: BarSeries[] }

interface PieSlice { label: string; value: number }
interface PieData { slices?: PieSlice[] }

interface TableData { headers?: string[]; rows?: (string | number)[][] }

function isLineData(v: unknown): v is LineData {
  return typeof v === "object" && v !== null && Array.isArray((v as LineData).series);
}
function isBarData(v: unknown): v is BarData {
  return (
    typeof v === "object" &&
    v !== null &&
    Array.isArray((v as BarData).categories) &&
    Array.isArray((v as BarData).series)
  );
}
function isPieData(v: unknown): v is PieData {
  return typeof v === "object" && v !== null && Array.isArray((v as PieData).slices);
}
function isTableData(v: unknown): v is TableData {
  return (
    typeof v === "object" &&
    v !== null &&
    Array.isArray((v as TableData).headers) &&
    Array.isArray((v as TableData).rows)
  );
}

// ---------------------------------------------------------------------------
// Fallback
// ---------------------------------------------------------------------------

function Fallback({ message }: { message: string }) {
  return (
    <div
      className="rounded-lg flex flex-col items-center justify-center gap-2 py-8 px-4"
      style={{
        background: "var(--color-bg-secondary)",
        border: "1px dashed var(--color-border)",
        minHeight: "160px",
      }}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-text-tertiary)" }}>
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
      <p className="text-xs text-center" style={{ color: "var(--color-text-tertiary)" }}>
        {message}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Chart subrenders
// ---------------------------------------------------------------------------

function renderLine(data: LineData) {
  const series = data.series ?? [];
  if (series.length === 0 || series.some((s) => !Array.isArray(s.points) || s.points.length === 0)) {
    return <Fallback message="Dữ liệu biểu đồ đường thiếu điểm dữ liệu" />;
  }

  // Recharts expects rows keyed by the x value, one row per x. Union x across series.
  const xValues = Array.from(
    new Set(series.flatMap((s) => s.points.map((p) => p.x)))
  ).sort((a, b) => (typeof a === "number" && typeof b === "number" ? a - b : String(a).localeCompare(String(b))));

  const rows = xValues.map((x) => {
    const row: Record<string, number | string> = { x };
    for (const s of series) {
      const match = s.points.find((p) => p.x === x);
      if (match) row[s.name] = match.y;
    }
    return row;
  });

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={rows} margin={{ top: 12, right: 16, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
        <XAxis dataKey="x" label={data.x_axis_label ? { value: data.x_axis_label, position: "insideBottom", offset: -4 } : undefined} tick={{ fontSize: 11 }} />
        <YAxis label={data.y_axis_label ? { value: data.y_axis_label, angle: -90, position: "insideLeft", style: { fontSize: 11 } } : undefined} tick={{ fontSize: 11 }} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {series.map((s, i) => (
          <Line
            key={s.name}
            type="monotone"
            dataKey={s.name}
            stroke={PALETTE[i % PALETTE.length]}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
            isAnimationActive={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

function renderBar(data: BarData) {
  const categories = data.categories ?? [];
  const series = data.series ?? [];
  if (categories.length === 0 || series.length === 0) {
    return <Fallback message="Dữ liệu biểu đồ cột thiếu categories hoặc series" />;
  }
  if (series.some((s) => !Array.isArray(s.values) || s.values.length !== categories.length)) {
    return <Fallback message="Biểu đồ cột: series có độ dài khác categories" />;
  }

  const rows = categories.map((category, idx) => {
    const row: Record<string, number | string> = { category };
    for (const s of series) row[s.name] = s.values[idx];
    return row;
  });

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={rows} margin={{ top: 12, right: 16, left: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
        <XAxis dataKey="category" label={data.x_axis_label ? { value: data.x_axis_label, position: "insideBottom", offset: -4 } : undefined} tick={{ fontSize: 11 }} />
        <YAxis label={data.y_axis_label ? { value: data.y_axis_label, angle: -90, position: "insideLeft", style: { fontSize: 11 } } : undefined} tick={{ fontSize: 11 }} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {series.map((s, i) => (
          <Bar key={s.name} dataKey={s.name} fill={PALETTE[i % PALETTE.length]} isAnimationActive={false} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

function renderPie(data: PieData) {
  const slices = data.slices ?? [];
  if (slices.length === 0) return <Fallback message="Biểu đồ tròn thiếu dữ liệu slices" />;

  return (
    <ResponsiveContainer width="100%" height={320}>
      <PieChart>
        <Tooltip />
        <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 12 }} />
        <Pie
          data={slices}
          dataKey="value"
          nameKey="label"
          cx="50%"
          cy="45%"
          outerRadius={100}
          label={({ percent }) => `${Math.round((percent ?? 0) * 100)}%`}
          labelLine={false}
          isAnimationActive={false}
        >
          {slices.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}

function renderTable(data: TableData) {
  const headers = data.headers ?? [];
  const rows = data.rows ?? [];
  if (headers.length === 0 || rows.length === 0) {
    return <Fallback message="Bảng dữ liệu trống" />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                className="text-left px-3 py-2 text-xs font-bold"
                style={{
                  background: "#1B2B4B",
                  color: "#fff",
                  borderBottom: "1px solid var(--color-border)",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr
              key={r}
              style={{
                background: r % 2 === 0 ? "var(--color-bg-secondary)" : "transparent",
              }}
            >
              {row.map((cell, c) => (
                <td
                  key={c}
                  className="px-3 py-2"
                  style={{
                    color: "var(--color-text)",
                    borderBottom: "1px solid var(--color-border)",
                  }}
                >
                  {String(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------

export default function WritingChartRenderer({ chartType, data, title }: WritingChartRendererProps) {
  if (data === null || data === undefined) {
    return <Fallback message="Không có dữ liệu biểu đồ" />;
  }

  let body: React.ReactNode;
  switch (chartType) {
    case "line":
      body = isLineData(data) ? renderLine(data) : <Fallback message="Sai định dạng dữ liệu đường" />;
      break;
    case "bar":
      body = isBarData(data) ? renderBar(data) : <Fallback message="Sai định dạng dữ liệu cột" />;
      break;
    case "pie":
      body = isPieData(data) ? renderPie(data) : <Fallback message="Sai định dạng dữ liệu tròn" />;
      break;
    case "table":
      body = isTableData(data) ? renderTable(data) : <Fallback message="Sai định dạng bảng" />;
      break;
    default:
      body = <Fallback message="Không thể hiển thị biểu đồ" />;
  }

  return (
    <div className="flex flex-col gap-2">
      {title && (
        <h3 className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
          {title}
        </h3>
      )}
      {body}
    </div>
  );
}
