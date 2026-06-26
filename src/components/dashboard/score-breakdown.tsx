// Score breakdown — all 9 rules rendered as cards.
// Redesigned: uses shared StatusBadge + ProgressBar components.

import type { RuleResult } from "@/lib/rules/types";
import { StatusBadge } from "@/components/shared/status-badge";
import { ProgressBar } from "@/components/shared/progress-bar";

export function ScoreBreakdown({ rules }: { rules: RuleResult[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {rules.map((r) => (
        <article
          key={r.id}
          className="group rounded-lg border border-border bg-card p-5 transition-all hover:border-foreground/15 hover:shadow-sm"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-foreground">{r.name}</div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">
                Target: {r.target}
              </div>
            </div>
            <StatusBadge status={r.status} />
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <div className="text-2xl font-semibold tracking-tight tabular-nums">{r.current}</div>
            <div className="text-xs text-muted-foreground tabular-nums">
              {r.points}/{r.maxPoints} pts
            </div>
          </div>

          <ProgressBar value={r.progressPct} className="mt-3" />

          {r.points < r.maxPoints && (
            <div className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
              {r.action}
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
