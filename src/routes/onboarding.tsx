import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Shield, Wallet, CheckCircle2, Info, ArrowRight, Check } from "lucide-react";
import { loadProfile, saveProfile } from "@/lib/profile/store";
import { recordCheckIn } from "@/lib/profile/history";
import { evaluateRules, disciplineScore, topActions } from "@/lib/rules/engine";
import { type FinancialProfile, createBlankProfile } from "@/lib/profile/types";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Setup Scorecard — WealthOS" },
      { name: "description", content: "Onboard and seed your financial discipline scorecard." },
    ],
  }),
  component: OnboardingPage,
});

const employmentOptions = [
  { value: "salaried", label: "Salaried" },
  { value: "self-employed", label: "Self-employed" },
  { value: "startup", label: "Variable / Startup" },
];

const goalOptions = [
  { value: "wealth-creation", label: "Wealth Creation" },
  { value: "debt-freedom", label: "Debt Freedom" },
  { value: "early-retirement", label: "Early Retirement" },
];

function OnboardingPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<FinancialProfile>(() => {
    const saved = loadProfile();
    return saved.onboardingComplete ? saved : { ...createBlankProfile(), ...saved };
  });

  const update = <K extends keyof FinancialProfile>(key: K, value: FinancialProfile[K]) => {
    setProfile((current) => ({ ...current, [key]: value }));
  };

  const isValid = useMemo(() => {
    return profile.monthlyIncome > 0 && profile.monthlyExpenses >= 0;
  }, [profile]);

  const saveAndFinish = () => {
    if (!isValid) return;
    const completedProfile = { ...profile, onboardingComplete: true };
    saveProfile(completedProfile);
    // Create initial snapshot check-in
    recordCheckIn(completedProfile, evaluateRules, disciplineScore, topActions);
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-12 md:px-8">
      <div className="mx-auto w-full max-w-4xl">
        {/* Header and Philosophy */}
        <div className="mb-10 rounded-2xl border border-border bg-card p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full filter blur-3xl -mr-10 -mt-10 pointer-events-none" />
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1.5 max-w-2xl">
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary">WealthOS Framework</span>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Your Financial Discipline Scorecard</h1>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Enter your current numbers once. The WealthOS framework grades your discipline across nine rules.
                This is a <strong>monthly ritual tool</strong> to guide your next action, not a high-frequency stock ticker.
              </p>
            </div>
            <div className="shrink-0 flex flex-col gap-2.5 rounded-xl border border-border/80 bg-background/50 px-4 py-3 text-xs md:max-w-xs">
              <div className="flex items-start gap-2">
                <Wallet className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <span><strong>No APIs or banks linked:</strong> 100% private and stored locally in your browser storage.</span>
              </div>
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                <span><strong>Actionable metrics:</strong> Focuses on buffers, savings rates, and debt discipline.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Sections */}
        <div className="space-y-8">
          {/* Section 1: Cash Flow & Basics */}
          <SectionCard
            title="1. Cash Flow & Context"
            subtitle="The foundation of all formulas. Enter what's true for you today."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <NumberField
                label="Monthly Income"
                value={profile.monthlyIncome}
                onChange={(v) => update("monthlyIncome", v)}
                prefix="₹"
                required
                hint="Your actual post-tax take-home monthly pay."
              />
              <NumberField
                label="Monthly Expenses"
                value={profile.monthlyExpenses}
                onChange={(v) => update("monthlyExpenses", v)}
                prefix="₹"
                required
                hint="Your average monthly outflows (rent, food, lifestyle, etc.)"
              />
              <NumberField
                label="Number of Dependents"
                value={profile.dependents}
                onChange={(v) => update("dependents", v)}
                hint="For adjusting term insurance adequacy benchmarks."
              />
              <SelectField
                label="Employment Type"
                value={profile.employmentType}
                onChange={(v) => update("employmentType", v)}
                options={employmentOptions}
              />
              <div className="sm:col-span-2">
                <SelectField
                  label="Primary Financial Goal"
                  value={profile.financialGoal}
                  onChange={(v) => update("financialGoal", v)}
                  options={goalOptions}
                />
              </div>
            </div>
          </SectionCard>

          {/* Section 2: Budget split */}
          <SectionCard
            title="2. Spending Allocation (Optional)"
            subtitle="Splits your expenses into categories to unlock detailed 50-30-20 budget scoring."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <NumberField
                label="Monthly Needs"
                value={profile.monthlyNeeds || 0}
                onChange={(v) => update("monthlyNeeds", v)}
                prefix="₹"
                hint="Essential bills, groceries, rent, utilities, minimum EMIs."
              />
              <NumberField
                label="Monthly Wants"
                value={profile.monthlyWants || 0}
                onChange={(v) => update("monthlyWants", v)}
                prefix="₹"
                hint="Discretionary: dining out, shopping, travel, entertainment."
              />
              <div className="sm:col-span-2 rounded-lg border border-border bg-muted/20 p-3 text-xs leading-relaxed text-muted-foreground flex gap-2">
                <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <span>
                  If left at zero, the engine conservatively models your entire monthly expenses as Needs. Enter values here for a more nuanced discipline rating.
                </span>
              </div>
            </div>
          </SectionCard>

          {/* Section 3: Safety Nets */}
          <SectionCard
            title="3. Protection & Safety Net"
            subtitle="Evaluates your buffer size against sudden emergencies and risk exposure."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <NumberField
                label="Emergency Fund"
                value={profile.emergencyFund}
                onChange={(v) => update("emergencyFund", v)}
                prefix="₹"
                hint="Liquid cash in savings accounts or short-term deposits."
              />
              <NumberField
                label="Health Insurance Cover"
                value={profile.healthInsurance}
                onChange={(v) => update("healthInsurance", v)}
                prefix="₹"
                hint="Sum insured of your personal or corporate medical policy."
              />
              <div className="sm:col-span-2">
                <NumberField
                  label="Term Insurance Cover"
                  value={profile.termInsurance}
                  onChange={(v) => update("termInsurance", v)}
                  prefix="₹"
                  hint="Pure term plan coverage amount (death benefit)."
                />
              </div>
            </div>
          </SectionCard>

          {/* Section 4: SIP & Wealth Accumulation */}
          <SectionCard
            title="4. Investments & SIP Cadence"
            subtitle="Tracks how much you systematically accumulate and where your net assets sit."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <NumberField
                label="Monthly SIP Amount"
                value={profile.monthlyInvestment}
                onChange={(v) => update("monthlyInvestment", v)}
                prefix="₹"
                hint="Total automated monthly investments (mutual funds, stocks, etc.)"
              />
              <NumberField
                label="SIP Amount (One Year Ago)"
                value={profile.investmentLastYear}
                onChange={(v) => update("investmentLastYear", v)}
                prefix="₹"
                hint="Used to score your step-up investment rate discipline."
              />
              <DateField
                label="SIP / Investment Start Date"
                value={profile.investmentStartDate}
                onChange={(v) => update("investmentStartDate", v)}
              />
              <NumberField
                label="Mutual Funds Balance"
                value={profile.mutualFunds}
                onChange={(v) => update("mutualFunds", v)}
                prefix="₹"
              />
              <NumberField
                label="Stocks Value"
                value={profile.stocks}
                onChange={(v) => update("stocks", v)}
                prefix="₹"
              />
              <NumberField
                label="EPF / PPF Balance"
                value={profile.epf}
                onChange={(v) => update("epf", v)}
                prefix="₹"
              />
              <div className="sm:col-span-2">
                <NumberField
                  label="Gold Allocation"
                  value={profile.gold}
                  onChange={(v) => update("gold", v)}
                  prefix="₹"
                  hint="Physical or digital gold investments for asset diversification."
                />
              </div>
            </div>
          </SectionCard>

          {/* Section 5: Credit & Debt */}
          <SectionCard
            title="5. Debt & Account Discipline"
            subtitle="Checks your utilization ratios and automated money routing structures."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <NumberField
                label="Credit Card Limits"
                value={profile.creditLimit}
                onChange={(v) => update("creditLimit", v)}
                prefix="₹"
                hint="Combined limit across all active credit cards."
              />
              <NumberField
                label="Current Card Outstanding"
                value={profile.creditUsage}
                onChange={(v) => update("creditUsage", v)}
                prefix="₹"
                hint="Total unpaid balance reported on cards."
              />
              <NumberField
                label="Monthly Loan EMIs"
                value={profile.monthlyEMI}
                onChange={(v) => update("monthlyEMI", v)}
                prefix="₹"
                hint="Total monthly EMIs (home, auto, personal loans)."
              />
              <div>
                <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-1.5">
                  Three-Account System
                </div>
                <div className="flex items-start gap-3 rounded-md border border-border bg-background/30 p-3 h-[70px]">
                  <input
                    type="checkbox"
                    id="threeAccount"
                    checked={profile.threeAccountSystem}
                    onChange={(e) => update("threeAccountSystem", e.target.checked)}
                    className="h-4 w-4 rounded border-border bg-card text-primary focus:ring-primary mt-0.5"
                  />
                  <label htmlFor="threeAccount" className="text-xs text-muted-foreground select-none cursor-pointer">
                    <strong className="text-foreground font-medium block">Three dedicated accounts</strong>
                    Separate Spending, Savings, and Investment accounts to control impulses.
                  </label>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Action Button & Errors */}
        <div className="mt-10 flex flex-col items-center gap-4 rounded-xl border border-border/80 bg-card p-5">
          {!isValid ? (
            <div className="text-xs text-destructive flex items-center gap-1.5">
              <Info className="h-4 w-4" /> Please enter a valid Monthly Income (greater than zero) to proceed.
            </div>
          ) : (
            <div className="text-xs text-success flex items-center gap-1.5">
              <Check className="h-4 w-4" /> Ready to initialize! Check over your numbers, then click below.
            </div>
          )}

          <button
            type="button"
            onClick={saveAndFinish}
            disabled={!isValid}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-foreground px-6 py-3 font-semibold text-background hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Activate Dashboard <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-5 border-b border-border/60 pb-3">
        <h2 className="text-base font-semibold tracking-tight text-foreground">{title}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function NumberField({
  label,
  value,
  onChange,
  prefix,
  required,
  hint,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="block">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label} {required && <span className="text-destructive font-bold">*</span>}
        </span>
        <div className="mt-1 flex items-center gap-2 rounded-md border border-border bg-background/30 px-3 focus-within:border-foreground/30">
          {prefix && <span className="text-sm text-muted-foreground">{prefix}</span>}
          <input
            type="number"
            min="0"
            value={Number.isFinite(value) ? value : ""}
            placeholder="0"
            onChange={(event) => onChange(Number(event.target.value) || 0)}
            className="w-full bg-transparent py-2.5 text-sm font-medium tabular-nums outline-none"
          />
        </div>
      </label>
      {hint && <span className="text-[10px] text-muted-foreground/80 leading-normal">{hint}</span>}
    </div>
  );
}

function DateField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="block">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
        <input
          type="date"
          value={value.slice(0, 10)}
          onChange={(event) => onChange(event.target.value)}
          className="mt-1 w-full rounded-md border border-border bg-background/30 px-3 py-2 text-sm outline-none focus:border-foreground/30"
        />
      </label>
      <span className="text-[10px] text-muted-foreground/80 leading-normal">
        Approximate date when you started your systematic investments.
      </span>
    </div>
  );
}

function SelectField<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: Array<{ value: T; label: string }>;
}) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{label}</div>
      <div className="grid gap-2 grid-cols-3">
        {options.map((option) => {
          const active = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`rounded-md border py-2 px-2 text-center text-xs font-medium transition-all ${
                active
                  ? "border-foreground bg-foreground text-background shadow-sm"
                  : "border-border bg-background/30 text-muted-foreground hover:border-foreground/30 hover:text-foreground"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
