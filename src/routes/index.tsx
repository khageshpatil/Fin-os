import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowUpRight, TrendingUp, Wallet, PiggyBank, CreditCard, LineChart, Coins, ShieldCheck } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { recordCheckIn, useHistory, useProfile } from "@/lib/profile-store";
import {
  disciplineScore,
  evaluateRules,
  inr,
  netWorth,
  statusTone,
  topActions,
  totalInvestments,
} from "@/lib/financial";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — WealthOS" },
      { name: "description", content: "Your financial discipline score and next best actions." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [profile] = useProfile();
  const history = useHistory();
  const rules = useMemo(() => evaluateRules(profile), [profile]);
  const score = useMemo(() => disciplineScore(rules), [rules]);
  const actions = useMemo(() => topActions(rules), [rules]);
  const setupReady = profile.onboardingComplete && profile.monthlyIncome > 0;

  if (!setupReady) {
    return (
      <PageShell
        eyebrow="Dashboard"
        title="Finish setup to start tracking"
        description="WealthOS is built around your real numbers. Complete onboarding once, and the 9-rule dashboard will use only your actual profile data."
        actions={
          <Link
            to="/onboarding"
            className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3 py-2 text-xs font-medium text-background hover:opacity-90"
          >
            Continue setup <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        }
      >
        <section className="grid gap-4 lg:grid-cols-[420px_minmax(0,1fr)]">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">First run</div>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">No profile data yet</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Complete onboarding with your actual income, expenses, insurance, investments, and SIP details.
              After that, this dashboard becomes your personal scorecard for all 9 rules.
            </p>
            <div className="mt-6 rounded-lg border border-border/70 bg-background/40 p-4 text-sm text-muted-foreground">
              This app is intentionally blank until you enter your real numbers. No example profile is loaded.
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">What you'll provide</div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {[
                "Income and monthly spending",
                "Needs vs wants split",
                "Emergency fund and insurance",
                "Credit usage and debt",
                "SIP, assets, and gold",
                "Life stage and goals",
              ].map((item) => (
                <div key={item} className="rounded-md border border-border/60 bg-background/40 px-3 py-2 text-sm text-foreground">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>
      </PageShell>
    );
  }

  const savingsRate = profile.monthlyIncome > 0 ? ((profile.monthlyIncome - profile.monthlyExpenses) / profile.monthlyIncome) * 100 : 0;
  const investRate = profile.monthlyIncome > 0 ? (profile.monthlySIP / profile.monthlyIncome) * 100 : 0;
  const dti = profile.monthlyIncome > 0 ? (profile.loans / profile.monthlyIncome) * 100 : 0;
  const utilization = profile.creditLimit > 0 ? (profile.creditUsage / profile.creditLimit) * 100 : 0;
  const latestCheckIn = history[0];
  const nextCheckInDate = latestCheckIn ? new Date(new Date(latestCheckIn.createdAt).getTime() + 7 * 86400000) : null;

  return (
    <PageShell
      eyebrow="Dashboard"
      title="How am I doing financially right now?"
      description="A single, opinionated score across nine proven rules — refreshed in real time as your profile changes."
      actions={
        <Link
          to="/planner"
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-xs font-medium text-foreground hover:bg-accent"
        >
          Simulate a decision <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      }
    >
      {/* Hero — score + breakdown */}
      <section className="grid gap-4 lg:grid-cols-[420px_minmax(0,1fr)]">
        <ScoreHero score={score.total} category={score.category} />
        <SnapshotGrid
          netW={netWorth(profile)}
          inv={totalInvestments(profile)}
          income={profile.monthlyIncome}
          expense={profile.monthlyExpenses}
          savingsRate={savingsRate}
          investRate={investRate}
          dti={dti}
          utilization={utilization}
        />
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <CheckInBanner
          latestCheckIn={latestCheckIn}
          nextCheckInDate={nextCheckInDate}
          onLogCheckIn={() => recordCheckIn(profile)}
        />
        <QuickStats history={history} />
      </section>

      {/* Needs/Wants breakdown (if available) */}
      {profile.monthlyNeeds !== undefined && profile.monthlyWants !== undefined && (
        <section className="mt-6">
          <SectionHeading title="Budget breakdown" subtitle="Your needs, wants, and savings split" />
          <NeedsWantsBreakdown profile={profile} />
        </section>
      )}

      {/* Top action items */}
      <section className="mt-8">
        <SectionHeading title="Top action items" subtitle="The three highest-impact moves you can make next" />
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {actions.length === 0 && (
            <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground md:col-span-3">
              You're following the system. Maintain it.
            </div>
          )}
          {actions.map((a, i) => (
            <article key={i} className="group relative overflow-hidden rounded-lg border border-border bg-card p-5 transition-colors hover:border-foreground/20">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">{a.rule}</span>
                <PriorityPill priority={a.priority} />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-foreground">{a.title}</p>
              <div className="mt-5 flex items-end justify-between border-t border-border pt-4">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Impact</div>
                  <div className="text-lg font-semibold tracking-tight text-success">+{a.impact} pts</div>
                </div>
                <div className="grid h-9 w-9 place-items-center rounded-md bg-muted/40 text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <SectionHeading title="Recent check-ins" subtitle="Your last 5 score snapshots" />
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {history.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-5 text-sm text-muted-foreground md:col-span-2 xl:col-span-5">
              Log your first check-in from the dashboard or finish onboarding to create one automatically.
            </div>
          ) : (
            history.slice(0, 5).map((entry) => (
              <article key={entry.id} className="rounded-lg border border-border bg-card p-4">
                <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{formatCheckInDate(entry.createdAt)}</div>
                <div className="mt-2 text-2xl font-semibold tracking-tight">{entry.score}</div>
                <div className="text-xs text-muted-foreground">{entry.category}</div>
                <div className="mt-3 rounded-md border border-border/60 bg-background/40 p-3 text-xs text-muted-foreground">
                  Top focus: <span className="text-foreground">{entry.topRule}</span>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      {/* Score breakdown — all 9 rules */}
      <section className="mt-10">
        <SectionHeading title="Score breakdown" subtitle="All nine rules, scored individually" />
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {rules.map((r) => {
            const t = statusTone(r.status);
            const pct = (r.points / r.maxPoints) * 100;
            return (
              <article key={r.id} className="group rounded-lg border border-border bg-card p-5 transition-colors hover:border-foreground/20">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-foreground">{r.name}</div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">Target {r.target}</div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 rounded-full border ${t.ring} bg-background/40 px-2 py-0.5 text-[10px] font-medium ${t.color}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${t.dot}`} /> {t.label}
                  </span>
                </div>
                <div className="mt-5 flex items-baseline justify-between">
                  <div className="text-2xl font-semibold tracking-tight">{r.current}</div>
                  <div className="text-xs text-muted-foreground">{r.points}/{r.maxPoints} pts</div>
                </div>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted/40">
                  <div className={`h-full ${pct >= 90 ? "bg-success" : pct >= 50 ? "bg-warning" : "bg-destructive"}`} style={{ width: `${Math.min(100, pct)}%` }} />
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </PageShell>
  );
}

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex items-end justify-between">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}

function CheckInBanner({
  latestCheckIn,
  nextCheckInDate,
  onLogCheckIn,
}: {
  latestCheckIn?: { createdAt: string; score: number; topAction: string };
  nextCheckInDate: Date | null;
  onLogCheckIn: () => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Weekly check-in</div>
      <h3 className="mt-1 text-lg font-semibold tracking-tight">Keep the score moving</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {latestCheckIn
          ? `Last check-in: ${formatCheckInDate(latestCheckIn.createdAt)}. Next review by ${formatCheckInDate(nextCheckInDate?.toISOString() ?? latestCheckIn.createdAt)}`
          : "Log a check-in after your weekly review so you can see the score trend over time."}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onLogCheckIn}
          className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3 py-2 text-xs font-medium text-background hover:opacity-90"
        >
          Log check-in
        </button>
        {latestCheckIn && (
          <div className="rounded-md border border-border/60 bg-background/40 px-3 py-2 text-xs text-muted-foreground">
            Latest focus: <span className="text-foreground">{latestCheckIn.topAction}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function QuickStats({ history }: { history: Array<{ score: number; createdAt: string; topRule: string }> }) {
  const latest = history[0];
  const previous = history[1];
  const delta = latest && previous ? latest.score - previous.score : 0;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Trend</div>
      <h3 className="mt-1 text-lg font-semibold tracking-tight">Momentum</h3>
      <div className="mt-4 grid gap-3">
        <div className="rounded-md border border-border/60 bg-background/40 p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Current score</div>
          <div className="mt-1 text-3xl font-semibold tracking-tight">{latest?.score ?? 0}</div>
        </div>
        <div className="rounded-md border border-border/60 bg-background/40 p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Change since last</div>
          <div className={`mt-1 text-2xl font-semibold tracking-tight ${delta >= 0 ? "text-success" : "text-destructive"}`}>
            {delta >= 0 ? "+" : ""}{delta}
          </div>
        </div>
        <div className="rounded-md border border-border/60 bg-background/40 p-3 text-xs text-muted-foreground">
          {latest ? `Current focus: ${latest.topRule}` : "No check-ins yet."}
        </div>
      </div>
    </div>
  );
}

function formatCheckInDate(iso: string) {
  return new Intl.DateTimeFormat("en-IN", { month: "short", day: "numeric" }).format(new Date(iso));
}

function PriorityPill({ priority }: { priority: "High" | "Medium" | "Low" }) {
  const map = {
    High: "border-destructive/30 text-destructive",
    Medium: "border-warning/30 text-warning",
    Low: "border-border text-muted-foreground",
  } as const;
  return (
    <span className={`rounded-full border bg-background/40 px-2 py-0.5 text-[10px] font-medium ${map[priority]}`}>
      {priority}
    </span>
  );
}

function ScoreHero({ score, category }: { score: number; category: string }) {
  const radius = 92;
  const c = 2 * Math.PI * radius;
  const dash = (score / 100) * c;
  const tone =
    score >= 90 ? "var(--success)" : score >= 60 ? "var(--success)" : score >= 40 ? "var(--warning)" : "var(--destructive)";

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card p-6">
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-foreground/20 to-transparent" />
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Financial Discipline</div>
          <div className="mt-1 text-sm text-muted-foreground">Composite score across 9 rules</div>
        </div>
        <span className="rounded-full border border-border bg-background/50 px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
          Live
        </span>
      </div>

      <div className="mt-6 flex items-center gap-6">
        <div className="relative h-55 w-55 shrink-0">
          <svg viewBox="0 0 220 220" className="h-full w-full -rotate-90">
            <circle cx="110" cy="110" r={radius} fill="none" stroke="oklch(0.27 0.006 270)" strokeWidth="14" />
            <circle
              cx="110"
              cy="110"
              r={radius}
              fill="none"
              stroke={tone}
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${c - dash}`}
              style={{ transition: "stroke-dasharray 600ms ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-6xl font-semibold tracking-tight tabular-nums">{score}</div>
            <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">out of 100</div>
          </div>
        </div>
        <div className="flex-1">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Status</div>
          <div className="mt-1 text-2xl font-semibold tracking-tight">{category}</div>
          <div className="mt-4 space-y-2">
            {(["Critical", "Needs Attention", "Good", "Strong", "Excellent"] as const).map((c) => {
              const active = c === category;
              return (
                <div key={c} className={`flex items-center gap-2 text-xs ${active ? "text-foreground" : "text-muted-foreground/60"}`}>
                  <span className={`h-1.5 w-6 rounded-full ${active ? "bg-foreground" : "bg-muted"}`} />
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

function NeedsWantsBreakdown({ profile }: { profile: ReturnType<typeof useProfile>[0] }) {
  const needsAmount = profile.monthlyNeeds || 0;
  const wantsAmount = profile.monthlyWants || 0;
  const savingsAmount = Math.max(0, profile.monthlyIncome - needsAmount - wantsAmount);
  const total = profile.monthlyIncome;

  const needsPct = total > 0 ? (needsAmount / total) * 100 : 0;
  const wantsPct = total > 0 ? (wantsAmount / total) * 100 : 0;
  const savingsPct = total > 0 ? (savingsAmount / total) * 100 : 0;

  return (
    <div className="mt-4 grid gap-4 md:grid-cols-3">
      {[
        {
          label: "Needs",
          amount: needsAmount,
          percent: needsPct,
          hint: "Essentials",
          color: "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800",
          barColor: "bg-blue-500",
        },
        {
          label: "Wants",
          amount: wantsAmount,
          percent: wantsPct,
          hint: "Discretionary",
          color: "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800",
          barColor: "bg-amber-500",
        },
        {
          label: "Savings",
          amount: savingsAmount,
          percent: savingsPct,
          hint: "Future",
          color: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
          barColor: "bg-emerald-500",
        },
      ].map((item) => (
        <div key={item.label} className={`rounded-lg border ${item.color} p-4`}>
          <div className="text-sm font-semibold">{item.label}</div>
          <div className="mt-1 text-xs text-muted-foreground">{item.hint}</div>
          <div className="mt-3 text-2xl font-semibold tabular-nums">{inr(item.amount)}</div>
          <div className="mt-2 text-xs text-muted-foreground">{item.percent.toFixed(0)}% of income</div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted/40">
            <div className={`h-full ${item.barColor} transition-all`} style={{ width: `${Math.min(100, item.percent)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function SnapshotGrid(props: {
  netW: number;
  inv: number;
  income: number;
  expense: number;
  savingsRate: number;
  investRate: number;
  dti: number;
  utilization: number;
}) {
  const items = [
    { label: "Net Worth", value: inr(props.netW), icon: Wallet, hint: "Investments + Emergency Fund" },
    { label: "Investments", value: inr(props.inv), icon: LineChart, hint: "MF + Stocks + EPF + Gold" },
    { label: "Monthly Income", value: inr(props.income), icon: TrendingUp, hint: "Net take-home" },
    { label: "Monthly Expenses", value: inr(props.expense), icon: CreditCard, hint: "Total outflows" },
    { label: "Savings Rate", value: `${props.savingsRate.toFixed(0)}%`, icon: PiggyBank, hint: "Income not spent" },
    { label: "Investment Rate", value: `${props.investRate.toFixed(0)}%`, icon: Coins, hint: "SIP as % of income" },
    { label: "Debt-to-Income", value: `${props.dti.toFixed(0)}%`, icon: ShieldCheck, hint: "Monthly EMIs" },
    { label: "Credit Utilization", value: `${props.utilization.toFixed(0)}%`, icon: CreditCard, hint: "Used vs limit" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((m) => (
        <div key={m.label} className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">{m.label}</span>
            <m.icon className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <div className="mt-3 text-xl font-semibold tracking-tight tabular-nums">{m.value}</div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">{m.hint}</div>
        </div>
      ))}
    </div>
  );
}
