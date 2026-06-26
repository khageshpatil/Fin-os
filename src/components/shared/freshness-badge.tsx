// Data freshness badge — shows how stale the profile data is.
// Key feature from the product review: "Your data is 47 days old."

import { getDaysSinceUpdate, getStaleFields, fieldLabel } from "@/lib/profile/freshness";
import type { FinancialProfile } from "@/lib/profile/types";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";

export function FreshnessBadge({ profile }: { profile: FinancialProfile }) {
  const days = getDaysSinceUpdate(profile);

  if (days === Infinity || !profile.profileLastUpdated) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/40 px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground">
        <Clock className="h-3 w-3" />
        No update recorded
      </span>
    );
  }

  if (days > 30) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-destructive/30 bg-background/40 px-2.5 py-0.5 text-[10px] font-medium text-destructive">
        <AlertTriangle className="h-3 w-3" />
        Updated {days}d ago — may be stale
      </span>
    );
  }

  if (days > 14) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-warning/30 bg-background/40 px-2.5 py-0.5 text-[10px] font-medium text-warning">
        <Clock className="h-3 w-3" />
        Updated {days}d ago
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-background/40 px-2.5 py-0.5 text-[10px] font-medium text-success">
      <CheckCircle className="h-3 w-3" />
      Updated {days === 0 ? "today" : days === 1 ? "yesterday" : `${days}d ago`}
    </span>
  );
}

/** Inline stale field list — shows which fields need refreshing. */
export function StaleFieldsList({ profile }: { profile: FinancialProfile }) {
  const staleFields = getStaleFields(profile);
  if (staleFields.length === 0) return null;

  return (
    <div className="rounded-lg border border-warning/20 bg-warning/5 p-4">
      <div className="flex items-center gap-2 text-xs font-medium text-warning">
        <AlertTriangle className="h-3.5 w-3.5" />
        {staleFields.length} field{staleFields.length > 1 ? "s" : ""} may be outdated
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {staleFields.slice(0, 6).map((f) => (
          <span
            key={f}
            className="rounded-md border border-border/60 bg-background/60 px-2 py-0.5 text-[10px] text-muted-foreground"
          >
            {fieldLabel(f)}
          </span>
        ))}
        {staleFields.length > 6 && (
          <span className="rounded-md border border-border/60 bg-background/60 px-2 py-0.5 text-[10px] text-muted-foreground">
            +{staleFields.length - 6} more
          </span>
        )}
      </div>
    </div>
  );
}
