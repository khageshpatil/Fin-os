// Score trend chart — using recharts (already installed).
// Product review: "The single most impactful addition."

import type { FinancialSnapshot } from "@/lib/profile/types";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { formatDate } from "@/lib/format";

interface TrendPoint {
  date: string;
  score: number;
  label: string;
}

export function ScoreTrendChart({ history }: { history: FinancialSnapshot[] }) {
  if (history.length < 2) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
        {history.length === 0
          ? "Log your first check-in to start tracking trends."
          : "Log one more check-in to see the trend line."}
      </div>
    );
  }

  // Reverse so oldest is first (history is newest-first)
  const data: TrendPoint[] = [...history]
    .reverse()
    .slice(-12) // Last 12 data points
    .map((s) => ({
      date: s.createdAt,
      score: s.score,
      label: formatDate(s.createdAt, "short"),
    }));

  const best = Math.max(...data.map((d) => d.score));
  const latest = data[data.length - 1]?.score ?? 0;
  const first = data[0]?.score ?? 0;
  const delta = latest - first;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Score Trend
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-semibold tracking-tight tabular-nums">{latest}</span>
            <span
              className={`text-xs font-medium ${delta >= 0 ? "text-success" : "text-destructive"}`}
            >
              {delta >= 0 ? "+" : ""}
              {delta} overall
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Personal best
          </div>
          <div className="text-lg font-semibold tracking-tight tabular-nums">{best}</div>
        </div>
      </div>

      <div className="mt-4 h-44">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="oklch(0.7 0.14 165)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="oklch(0.7 0.14 165)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.5 0 0 / 0.08)" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "oklch(0.5 0.015 270)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: "oklch(0.5 0.015 270)" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value: number) => [`${value}`, "Score"]}
              labelFormatter={(label: string) => label}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="oklch(0.7 0.14 165)"
              strokeWidth={2}
              fill="url(#scoreGradient)"
              dot={{ r: 3, fill: "oklch(0.7 0.14 165)", stroke: "var(--card)", strokeWidth: 2 }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
