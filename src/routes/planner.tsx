import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageShell } from "@/components/page-shell";
import { useProfile } from "@/lib/profile-store";
import {
  disciplineScore,
  evaluateRules,
  inr,
  type FinancialProfile,
} from "@/lib/financial";
import { TrendingUp, ShoppingBag, ArrowUpRight, Banknote, Sparkles } from "lucide-react";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "Planner — WealthOS" },
      { name: "description", content: "Simulate financial decisions before you make them." },
    ],
  }),
  component: PlannerPage,
});

type Scenario = "salary" | "purchase" | "sip" | "loan";

const scenarios: { id: Scenario; title: string; icon: typeof TrendingUp; description: string }[] = [
  { id: "salary", title: "Salary Increase", icon: TrendingUp, description: "Model a raise and how to allocate it." },
  { id: "sip", title: "Investment Increase", icon: Sparkles, description: "Step up your SIP and see score lift." },
  { id: "purchase", title: "Major Purchase", icon: ShoppingBag, description: "Test impact of a big-ticket buy." },
  { id: "loan", title: "Take a Loan", icon: Banknote, description: "Add an EMI and see DTI shift." },
];

function PlannerPage() {
  const [profile] = useProfile();
  const setupReady = profile.onboardingComplete && profile.monthlyIncome > 0;
  const [active, setActive] = useState<Scenario>("salary");

  const [newSalary, setNewSalary] = useState(120000);
  const [extraSIP, setExtraSIP] = useState(7000);
  const [purchaseAmt, setPurchaseAmt] = useState(200000);
  const [loanEMI, setLoanEMI] = useState(15000);

  const baseRules = useMemo(() => evaluateRules(profile), [profile]);
  const baseScore = useMemo(() => disciplineScore(baseRules), [baseRules]);

  const projectedProfile: FinancialProfile = useMemo(() => {
    const next = { ...profile };
    if (active === "salary") next.monthlyIncome = newSalary;
    if (active === "sip") next.monthlySIP = profile.monthlySIP + extraSIP;
    if (active === "purchase") {
      next.emergencyFund = Math.max(0, profile.emergencyFund - purchaseAmt);
    }
    if (active === "loan") {
      next.loans = profile.loans + loanEMI;
      next.monthlyExpenses = profile.monthlyExpenses + loanEMI;
    }
    return next;
  }, [active, profile, newSalary, extraSIP, purchaseAmt, loanEMI]);

  const projRules = useMemo(() => evaluateRules(projectedProfile), [projectedProfile]);
  const projScore = useMemo(() => disciplineScore(projRules), [projRules]);
  const diff = projScore.total - baseScore.total;

  const affected = useMemo(
    () =>
      baseRules
        .map((b, i) => ({ name: b.name, delta: projRules[i].points - b.points }))
        .filter((x) => x.delta !== 0)
        .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)),
    [baseRules, projRules]
  );

  if (!setupReady) {
    return (
      <PageShell
        eyebrow="Planner"
        title="Complete setup before simulating decisions"
        description="The planner needs your real income, spending, and debt numbers to estimate impact accurately."
      >
        <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
          Finish the onboarding flow first so this simulator works from your actual profile.
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow="Planner"
      title="Simulate a financial decision"
      description="Choose a scenario, change the numbers, and see how your discipline score will move — before you commit."
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {scenarios.map((s) => {
          const isActive = active === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={`group relative overflow-hidden rounded-xl border p-5 text-left transition-all ${
                isActive ? "border-foreground/40 bg-card" : "border-border bg-card/60 hover:border-foreground/20"
              }`}
            >
              <div className="flex items-center justify-between">
                <s.icon className={`h-4 w-4 ${isActive ? "text-foreground" : "text-muted-foreground"}`} />
                {isActive && <span className="text-[10px] font-medium uppercase tracking-wider text-success">Active</span>}
              </div>
              <div className="mt-4 text-sm font-semibold tracking-tight">{s.title}</div>
              <div className="mt-1 text-xs text-muted-foreground">{s.description}</div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {/* Inputs */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Inputs</div>
          <h3 className="mt-1 text-lg font-semibold tracking-tight">{scenarios.find((s) => s.id === active)!.title}</h3>

          <div className="mt-6 space-y-5">
            {active === "salary" && (
              <>
                <ReadOnly label="Current Salary" value={inr(profile.monthlyIncome)} />
                <Range label="New Salary" min={profile.monthlyIncome} max={profile.monthlyIncome * 3} step={1000} value={newSalary} onChange={setNewSalary} format={inr} />
              </>
            )}
            {active === "sip" && (
              <>
                <ReadOnly label="Current SIP" value={inr(profile.monthlySIP)} />
                <Range label="Additional SIP / month" min={0} max={profile.monthlyIncome} step={500} value={extraSIP} onChange={setExtraSIP} format={inr} />
              </>
            )}
            {active === "purchase" && (
              <>
                <ReadOnly label="Emergency Fund" value={inr(profile.emergencyFund)} />
                <Range label="Purchase Amount" min={10000} max={Math.max(500000, profile.emergencyFund * 2)} step={5000} value={purchaseAmt} onChange={setPurchaseAmt} format={inr} />
              </>
            )}
            {active === "loan" && (
              <>
                <ReadOnly label="Current EMIs" value={inr(profile.loans)} />
                <Range label="New EMI / month" min={1000} max={profile.monthlyIncome} step={500} value={loanEMI} onChange={setLoanEMI} format={inr} />
              </>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Results</div>
          <h3 className="mt-1 text-lg font-semibold tracking-tight">Projected impact</h3>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <ScoreCell label="Current" value={baseScore.total} />
            <ScoreCell label="Projected" value={projScore.total} highlight />
            <ScoreCell label="Δ Change" value={diff} delta />
          </div>

          <div className="mt-6">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Affected Rules</div>
            <div className="mt-2 space-y-2">
              {affected.length === 0 && <div className="text-xs text-muted-foreground">No rules affected.</div>}
              {affected.slice(0, 5).map((a) => (
                <div key={a.name} className="flex items-center justify-between rounded-md border border-border/60 bg-background/40 px-3 py-2 text-sm">
                  <span>{a.name}</span>
                  <span className={a.delta > 0 ? "text-success" : "text-destructive"}>
                    {a.delta > 0 ? "+" : ""}
                    {a.delta} pts
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-md border border-border/70 bg-background/40 p-4">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
              <ArrowUpRight className="h-3.5 w-3.5" />
              Recommendation
            </div>
            <p className="mt-2 text-sm leading-relaxed">{recommendationFor(active, { newSalary, extraSIP, purchaseAmt, loanEMI, profile, diff })}</p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function recommendationFor(
  active: Scenario,
  c: { newSalary: number; extraSIP: number; purchaseAmt: number; loanEMI: number; profile: FinancialProfile; diff: number }
) {
  if (active === "salary") {
    const inc = c.newSalary - c.profile.monthlyIncome;
    const suggest = Math.round(inc * 0.5);
    return `Channel ~${inr(suggest)} (50% of the raise) into SIP to lift your investment rate and score.`;
  }
  if (active === "sip") {
    return c.diff > 0
      ? `Strong move — projected score lifts by ${c.diff}. Automate the step-up on the 1st of next month.`
      : "Your investment rate is already on target. Consider a debt or gold rebalance instead.";
  }
  if (active === "purchase") {
    return c.purchaseAmt > c.profile.emergencyFund * 0.5
      ? "This buy materially weakens your emergency buffer. Delay 3-6 months or split into installments."
      : "Manageable — rebuild the emergency fund within 6 months to keep Rule 1 green.";
  }
  return c.loanEMI / c.profile.monthlyIncome > 0.3
    ? "EMI exceeds 30% of income. Reconsider the loan amount or extend tenure."
    : "DTI stays in safe territory. Maintain savings rate alongside the EMI.";
}

function ReadOnly({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border/60 bg-background/40 px-3 py-2.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium tabular-nums">{value}</span>
    </div>
  );
}

function Range({
  label,
  min,
  max,
  step,
  value,
  onChange,
  format,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  format: (n: number) => string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-sm font-semibold tabular-nums">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-foreground"
      />
      <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
}

function ScoreCell({ label, value, highlight, delta }: { label: string; value: number; highlight?: boolean; delta?: boolean }) {
  const display = delta ? `${value > 0 ? "+" : ""}${value}` : value;
  const color = delta ? (value > 0 ? "text-success" : value < 0 ? "text-destructive" : "text-muted-foreground") : "";
  return (
    <div className={`rounded-md border p-4 ${highlight ? "border-foreground/30 bg-background/60" : "border-border/60 bg-background/40"}`}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 text-3xl font-semibold tracking-tight tabular-nums ${color}`}>{display}</div>
    </div>
  );
}
