// Reusable status badge — shows a colored dot + label.
// Used across rule cards, dashboard, and planner results.

import type { RuleStatus } from "@/lib/rules/types";
import { statusTone } from "@/lib/rules/engine";

export function StatusBadge({ status }: { status: RuleStatus }) {
  const t = statusTone(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${t.ring} bg-background/40 px-2 py-0.5 text-[10px] font-medium ${t.color}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${t.dot}`} />
      {t.label}
    </span>
  );
}

export function ScoreCategoryBadge({
  category,
}: {
  category: "Critical" | "Needs Attention" | "Good" | "Strong" | "Excellent";
}) {
  const colorMap = {
    Critical: "border-destructive/30 text-destructive",
    "Needs Attention": "border-warning/30 text-warning",
    Good: "border-success/30 text-success",
    Strong: "border-success/30 text-success",
    Excellent: "border-success/30 text-success",
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border bg-background/40 px-2.5 py-0.5 text-[10px] font-medium ${colorMap[category]}`}
    >
      {category}
    </span>
  );
}
