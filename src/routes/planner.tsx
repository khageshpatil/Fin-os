import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageShell } from "@/components/page-shell";
import { useProfile } from "@/lib/profile/store";
import { evaluateRules, disciplineScore } from "@/lib/rules/engine";
import { type FinancialProfile } from "@/lib/profile/types";
import { inr } from "@/lib/format";
import { TrendingUp, ShoppingBag, ArrowUpRight, Banknote, Sparkles } from "lucide-react";
import { ScenarioCard } from "@/components/planner/scenario-card";
import { ScoreCell } from "@/components/planner/score-cell";
import { ReadOnly, Range } from "@/components/planner/inputs";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "Planner — WealthOS" },
      { name: "description", content: "Simulate financial decisions before you make them." },
    ],
  }),
  component: PlannerPage,
});

type Scenario = "salary" | "sip" | "purchase" | "loan";

const scenarios = [
  {
    id: "salary" as const,
    title: "Salary Increase",
    icon: TrendingUp,
    description: "Model a raise and how to allocate it.",
  },
  {
    id: "sip" as const,
    title: "Investment Increase",
    icon: Sparkles,
    description: "Step up your SIP and see score lift.",
  },
  {
    id: "purchase" as const,
    title: "Major Purchase",
    icon: ShoppingBag,
    description: "Test impact of a big-ticket buy.",
  },
  {
    id: "loan" as const,
    title: "Take a Loan",
    icon: Banknote,
    description: "Add an EMI and see DTI shift.",
  },
] as const;

function PlannerPage() {
  const [profile] = useProfile();
  const setupReady = profile.onboardingComplete && profile.monthlyIncome > 0;
  const [active, setActive] = useState<Scenario>("salary");

  const [newSalary, setNewSalary] = useState(profile.monthlyIncome || 120000);
  const [raiseToSipPct, setRaiseToSipPct] = useState(50);
  const [extraSIP, setExtraSIP] = useState(7000);
  const [purchaseAmt, setPurchaseAmt] = useState(200000);
  const [loanEMI, setLoanEMI] = useState(15000);

  // Synchronize newSalary range fallback if profile income is updated
  useMemo(() => {
    if (profile.monthlyIncome > 0 && newSalary < profile.monthlyIncome) {
      setNewSalary(profile.monthlyIncome);
    }
  }, [profile.monthlyIncome]);

  const baseRules = useMemo(() => evaluateRules(profile), [profile]);
  const baseScore = useMemo(() => disciplineScore(baseRules), [baseRules]);

  const projectedProfile: FinancialProfile = useMemo(() => {
    const next = { ...profile };
    if (active === "salary") {
      const raise = Math.max(0, newSalary - profile.monthlyIncome);
      next.monthlyIncome = newSalary;
      next.monthlyInvestment = profile.monthlyInvestment + (raise * raiseToSipPct) / 100;
    }
    if (active === "sip") {
      next.monthlyInvestment = profile.monthlyInvestment + extraSIP;
    }
    if (active === "purchase") {
      next.emergencyFund = Math.max(0, profile.emergencyFund - purchaseAmt);
    }
    if (active === "loan") {
      next.monthlyEMI = profile.monthlyEMI + loanEMI;
      next.monthlyExpenses = profile.monthlyExpenses + loanEMI;
    }
    return next;
  }, [active, profile, newSalary, raiseToSipPct, extraSIP, purchaseAmt, loanEMI]);

  const projRules = useMemo(() => evaluateRules(projectedProfile), [projectedProfile]);
  const projScore = useMemo(() => disciplineScore(projRules), [projRules]);
  const diff = projScore.total - baseScore.total;

  const affected = useMemo(
    () =>
      baseRules
        .map((b, i) => ({ name: b.name, delta: projRules[i].points - b.points }))
        .filter((x) => x.delta !== 0)
        .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)),
    [baseRules, projRules],
  );

  if (!setupReady) {
    return (
      <PageShell
        eyebrow="Planner"
        title="Complete setup before simulating decisions"
        description="The planner needs your real income, spending, and debt numbers to estimate impact accurately."
      >
        <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground shadow-sm">
          Please complete your onboarding profile setup first so that the simulator can run projections against your real numbers.
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow="Planner"
      title="Simulate a financial decision"
      description="Choose a scenario, adjust inputs, and preview the impact on your discipline score before executing."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {scenarios.map((s) => (
          <ScenarioCard
            key={s.id}
            title={s.title}
            description={s.description}
            icon={s.icon}
            isActive={active === s.id}
            onClick={() => setActive(s.id)}
          />
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Inputs */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Inputs
          </div>
          <h3 className="mt-1 text-lg font-semibold tracking-tight">
            {scenarios.find((s) => s.id === active)!.title}
          </h3>

          <div className="mt-6 space-y-6">
            {active === "salary" && (
              <>
                <ReadOnly label="Current Income" value={inr(profile.monthlyIncome)} />
                <Range
                  label="Projected Salary"
                  min={profile.monthlyIncome}
                  max={profile.monthlyIncome * 3}
                  step={1000}
                  value={newSalary}
                  onChange={setNewSalary}
                  format={inr}
                />
                <Range
                  label="Raise to Investments (SIP)"
                  min={0}
                  max={100}
                  step={5}
                  value={raiseToSipPct}
                  onChange={setRaiseToSipPct}
                  format={(value) => `${value}%`}
                />
                <ReadOnly
                  label="Additional Monthly Investment"
                  value={inr(
                    (Math.max(0, newSalary - profile.monthlyIncome) * raiseToSipPct) / 100,
                  )}
                />
              </>
            )}
            {active === "sip" && (
              <>
                <ReadOnly label="Current Monthly SIP" value={inr(profile.monthlyInvestment)} />
                <Range
                  label="Extra Systematic Investment"
                  min={0}
                  max={profile.monthlyIncome}
                  step={500}
                  value={extraSIP}
                  onChange={setExtraSIP}
                  format={inr}
                />
              </>
            )}
            {active === "purchase" && (
              <>
                <ReadOnly label="Current Emergency Fund" value={inr(profile.emergencyFund)} />
                <Range
                  label="One-time Purchase Amount"
                  min={10000}
                  max={Math.max(500000, profile.emergencyFund * 2)}
                  step={5000}
                  value={purchaseAmt}
                  onChange={setPurchaseAmt}
                  format={inr}
                />
              </>
            )}
            {active === "loan" && (
              <>
                <ReadOnly label="Current EMIs" value={inr(profile.monthlyEMI)} />
                <Range
                  label="New EMI Amount"
                  min={1000}
                  max={profile.monthlyIncome}
                  step={500}
                  value={loanEMI}
                  onChange={setLoanEMI}
                  format={inr}
                />
              </>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Results
            </div>
            <h3 className="mt-1 text-lg font-semibold tracking-tight">Projected Impact</h3>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <ScoreCell label="Current" value={baseScore.total} />
              <ScoreCell label="Projected" value={projScore.total} highlight />
              <ScoreCell label="Δ Change" value={diff} delta />
            </div>

            <div className="mt-6">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Affected Rules
              </div>
              <div className="mt-2.5 space-y-2">
                {affected.length === 0 && (
                  <div className="text-xs text-muted-foreground py-2 italic">
                    No scorecard rules are affected by this simulation.
                  </div>
                )}
                {affected.slice(0, 5).map((a) => (
                  <div
                    key={a.name}
                    className="flex items-center justify-between rounded-md border border-border/60 bg-background/30 px-3 py-2 text-xs font-medium"
                  >
                    <span>{a.name}</span>
                    <span className={a.delta > 0 ? "text-success font-semibold" : "text-destructive font-semibold"}>
                      {a.delta > 0 ? "+" : ""}
                      {a.delta} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-border/70 bg-background/30 p-4">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <ArrowUpRight className="h-3.5 w-3.5 text-primary" />
              Recommendation
            </div>
            <p className="mt-2 text-xs leading-relaxed text-foreground/90 font-medium">
              {recommendationFor(active, {
                newSalary,
                raiseToSipPct,
                extraSIP,
                purchaseAmt,
                loanEMI,
                profile,
                diff,
              })}
            </p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function recommendationFor(
  active: Scenario,
  c: {
    newSalary: number;
    raiseToSipPct: number;
    extraSIP: number;
    purchaseAmt: number;
    loanEMI: number;
    profile: FinancialProfile;
    diff: number;
  },
) {
  if (active === "salary") {
    const inc = c.newSalary - c.profile.monthlyIncome;
    const allocated = Math.round((Math.max(0, inc) * c.raiseToSipPct) / 100);
    return inc > 0
      ? `This scenario sends ${inr(allocated)} (${c.raiseToSipPct}% of the raise) into systematic investment each month. Adjust the split until the score lift feels worth it.`
      : "Increase the projected salary first to see how a raise changes your allocation options.";
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
  return (c.profile.monthlyEMI + c.loanEMI) / c.profile.monthlyIncome > 0.3
    ? "EMI exceeds 30% of income. Reconsider the loan amount or extend tenure."
    : "DTI stays in safe territory. Maintain savings rate alongside the EMI.";
}
