// Weakest rule callout — prominently highlights the single biggest weakness.
// Product review: "Your weakest area is Emergency Fund. You're 2.1 months short."

import type { RuleResult } from "@/lib/rules/types";
import { StatusBadge } from "@/components/shared/status-badge";
import { ProgressBar } from "@/components/shared/progress-bar";
import { AlertTriangle } from "lucide-react";

export function WeakestRuleCallout({ rules }: { rules: RuleResult[] }) {
  // Find the weakest non-perfect rule (lowest points/maxPoints ratio)
  const weakest = [...rules]
    .filter((r) => r.points < r.maxPoints)
    .sort((a, b) => a.points / a.maxPoints - b.points / b.maxPoints)[0];

  if (!weakest) {
    return (
      <div className="rounded-xl border border-success/20 bg-success/5 p-5">
        <div className="text-sm font-medium text-success">
          All 9 rules at full score. Outstanding discipline.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-foreground/10">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-destructive/10 text-destructive">
            <AlertTriangle className="h-3.5 w-3.5" />
          </div>
          <div>
            <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Weakest area
            </div>
            <div className="text-sm font-semibold">{weakest.name}</div>
          </div>
        </div>
        <StatusBadge status={weakest.status} />
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <div className="text-xl font-semibold tracking-tight tabular-nums">{weakest.current}</div>
        <div className="text-xs text-muted-foreground">
          Target: {weakest.target}
        </div>
      </div>

      <ProgressBar value={weakest.progressPct} className="mt-3" />

      <div className="mt-4 rounded-md border border-border/60 bg-background/40 p-3 text-xs leading-relaxed text-muted-foreground">
        <span className="font-medium text-foreground">Next step:</span> {weakest.action}
      </div>
    </div>
  );
}
