// Top 3 action items — the prescription panel.
// Product review: "This is worth more than the entire dashboard combined."

import type { ActionItem } from "@/lib/rules/types";
import { TrendingUp } from "lucide-react";

function PriorityPill({ priority }: { priority: ActionItem["priority"] }) {
  const map = {
    High: "border-destructive/30 text-destructive",
    Medium: "border-warning/30 text-warning",
    Low: "border-border text-muted-foreground",
  } as const;
  return (
    <span
      className={`rounded-full border bg-background/40 px-2 py-0.5 text-[10px] font-medium ${map[priority]}`}
    >
      {priority}
    </span>
  );
}

export function TopActions({ actions }: { actions: ActionItem[] }) {
  if (actions.length === 0) {
    return (
      <div className="rounded-lg border border-success/20 bg-success/5 p-5 text-sm text-success">
        You're following the system. Maintain your current plan.
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {actions.map((a, i) => (
        <article
          key={i}
          className="group relative overflow-hidden rounded-lg border border-border bg-card p-5 transition-all hover:border-foreground/20 hover:shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              {a.rule}
            </span>
            <PriorityPill priority={a.priority} />
          </div>
          <p className="mt-3 text-sm leading-relaxed text-foreground">{a.title}</p>
          <div className="mt-5 flex items-end justify-between border-t border-border pt-4">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Impact
              </div>
              <div className="text-lg font-semibold tracking-tight text-success tabular-nums">
                +{a.impact} pts
              </div>
            </div>
            <div className="grid h-9 w-9 place-items-center rounded-md bg-muted/40 text-muted-foreground transition-colors group-hover:bg-success/10 group-hover:text-success">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
