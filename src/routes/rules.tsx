import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { PageShell } from "@/components/page-shell";
import { useProfile } from "@/lib/profile-store";
import { evaluateRules, statusTone } from "@/lib/financial";
import { Target, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/rules")({
  head: () => ({
    meta: [
      { title: "Rules — WealthOS" },
      { name: "description", content: "Nine proven financial rules, evaluated against your profile." },
    ],
  }),
  component: RulesPage,
});

function RulesPage() {
  const [profile] = useProfile();
  const setupReady = profile.onboardingComplete && profile.monthlyIncome > 0;
  const rules = useMemo(() => evaluateRules(profile), [profile]);

  if (!setupReady) {
    return (
      <PageShell
        eyebrow="Rules"
        title="Complete setup to view your rule scores"
        description="WealthOS needs your real profile before it can score the nine rules accurately."
      >
        <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
          Finish onboarding, then come back here to review the full rule breakdown.
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow="Rules"
      title="The nine rules of the system"
      description="Each rule is graded against your profile. Close the gaps in order — start with the critical ones."
    >
      <div className="space-y-3">
        {rules.map((r, idx) => {
          const tone = statusTone(r.status);
          const pct = Math.min(100, (r.currentNum / r.targetNum) * 100);
          return (
            <article
              key={r.id}
              className="group grid gap-5 rounded-xl border border-border bg-card p-6 transition-colors hover:border-foreground/20 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto]"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-muted/40 text-[10px] font-semibold text-muted-foreground tabular-nums">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <h3 className="truncate text-base font-semibold tracking-tight">{r.name}</h3>
                  <span className={`ml-auto inline-flex items-center gap-1.5 rounded-full border ${tone.ring} bg-background/40 px-2 py-0.5 text-[10px] font-medium ${tone.color} lg:ml-0`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
                    {tone.label}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.description}</p>
                <div className="mt-4 flex items-start gap-2 rounded-md border border-border/70 bg-background/40 p-3 text-xs text-foreground/90">
                  <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span>{r.action}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 self-start">
                <Stat label="Current" value={r.current} />
                <Stat label="Target" value={r.target} />
                <Stat label="Gap" value={r.gap} muted />
              </div>

              <div className="flex flex-col items-end justify-between gap-3 lg:w-44">
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Points</div>
                  <div className="text-2xl font-semibold tracking-tight tabular-nums">
                    {r.points}
                    <span className="text-base text-muted-foreground">/{r.maxPoints}</span>
                  </div>
                </div>
                <div className="flex w-full items-center gap-2">
                  <Target className="h-3.5 w-3.5 text-muted-foreground" />
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted/40">
                    <div className={`h-full ${pct >= 90 ? "bg-success" : pct >= 50 ? "bg-warning" : "bg-destructive"}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </PageShell>
  );
}

function Stat({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="rounded-md border border-border/60 bg-background/40 p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 text-sm font-medium tabular-nums ${muted ? "text-muted-foreground" : "text-foreground"}`}>{value}</div>
    </div>
  );
}
