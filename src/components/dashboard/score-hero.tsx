// Score hero — the main score ring with category indicator.
// Redesigned: removed "Live" badge, added score ring animation, gradient accent.

import type { Score } from "@/lib/rules/types";

export function ScoreHero({
  score,
  cappedReason,
}: {
  score: Score;
  cappedReason?: string | null;
}) {
  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  const dash = (score.total / score.max) * circumference;
  const tone =
    score.total >= 75
      ? "var(--success)"
      : score.total >= 40
        ? "var(--warning)"
        : "var(--destructive)";

  const categories = ["Critical", "Needs Attention", "Good", "Strong", "Excellent"] as const;

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card p-6">
      {/* Subtle gradient accent at top */}
      <div
        className="absolute inset-x-0 top-0 h-1 opacity-60"
        style={{
          background: `linear-gradient(90deg, transparent, ${tone}, transparent)`,
        }}
      />

      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-stretch">
        {/* Score ring */}
        <div className="relative h-52 w-52 shrink-0">
          <svg viewBox="0 0 210 210" className="h-full w-full -rotate-90">
            <circle
              cx="105"
              cy="105"
              r={radius}
              fill="none"
              className="stroke-muted/30"
              strokeWidth="12"
            />
            <circle
              cx="105"
              cy="105"
              r={radius}
              fill="none"
              stroke={tone}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference - dash}`}
              style={{
                transition: "stroke-dasharray 800ms cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-5xl font-semibold tracking-tight tabular-nums">
              {score.total}
            </div>
            <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              out of {score.max}
            </div>
          </div>
        </div>

        {/* Status + category ladder */}
        <div className="flex flex-1 flex-col min-w-0 text-center sm:text-left justify-center">
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Financial Discipline
          </div>
          <div className="mt-1 text-2xl font-semibold tracking-tight">{score.category}</div>

          {cappedReason && (
            <div className="mt-3 rounded-md border border-warning/20 bg-warning/5 px-3 py-2 text-[11px] text-warning leading-relaxed text-left">
              {cappedReason}
            </div>
          )}

          <div className="mt-4 flex flex-col items-center sm:items-start space-y-1.5">
            {categories.map((c) => {
              const active = c === score.category;
              return (
                <div
                  key={c}
                  className={`flex items-center gap-2 text-xs transition-colors ${active ? "text-foreground font-medium" : "text-muted-foreground/50"}`}
                >
                  <span
                    className={`h-1.5 rounded-full transition-all ${active ? "w-7 bg-foreground" : "w-4 bg-muted"}`}
                  />
                  {c}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
