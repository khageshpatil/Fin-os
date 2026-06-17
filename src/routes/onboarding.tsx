import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Shield, Wallet } from "lucide-react";
import { loadProfile, recordCheckIn, saveProfile } from "@/lib/profile-store";
import { type FinancialProfile, createBlankProfile } from "@/lib/financial";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Onboarding — WealthOS" },
      { name: "description", content: "Set up WealthOS with your real financial numbers in a detailed guided flow." },
    ],
  }),
  component: OnboardingPage,
});

type Step = 0 | 1 | 2 | 3 | 4;

const employmentOptions = [
  { value: "salaried", label: "Salaried" },
  { value: "self-employed", label: "Self-employed" },
  { value: "startup", label: "Startup / variable" },
];

const goalOptions = [
  { value: "wealth-creation", label: "Wealth creation" },
  { value: "debt-freedom", label: "Debt freedom" },
  { value: "early-retirement", label: "Early retirement" },
];

function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(0);
  const [profile, setProfile] = useState<FinancialProfile>(() => {
    const saved = loadProfile();
    return saved.onboardingComplete ? saved : { ...createBlankProfile(), ...saved };
  });

  const update = <K extends keyof FinancialProfile>(key: K, value: FinancialProfile[K]) => {
    setProfile((current) => ({ ...current, [key]: value }));
  };

  const completion = useMemo(() => {
    const fields = [
      profile.monthlyIncome,
      profile.monthlyExpenses,
      profile.monthlyNeeds,
      profile.monthlyWants,
      profile.emergencyFund,
      profile.healthInsurance,
      profile.termInsurance,
      profile.creditLimit,
      profile.creditUsage,
      profile.monthlySIP,
      profile.sipLastYear,
      profile.mutualFunds,
      profile.stocks,
      profile.epf,
      profile.gold,
      profile.loans,
    ];
    const filled = fields.filter((value) => value > 0).length;
    return Math.round((filled / fields.length) * 100);
  }, [profile]);

  const saveAndFinish = () => {
    const completedProfile = { ...profile, onboardingComplete: true };
    saveProfile(completedProfile);
    recordCheckIn(completedProfile);
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Setup</div>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">Personal setup for your 9-rule scorecard</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Fill in your real numbers once. The dashboard, rules, and planner will then reflect your actual financial situation instead of a demo profile.
            </p>
          </div>

          <div className="grid gap-2 rounded-xl border border-border/70 bg-background/50 px-4 py-3 text-sm">
            <div className="flex items-center gap-2 text-foreground">
              <Wallet className="h-4 w-4 text-muted-foreground" />
              Use real monthly income, expenses, assets, and debt
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <Shield className="h-4 w-4 text-muted-foreground" />
              Every field maps to one or more of the 9 rules
            </div>
          </div>
        </div>

        <StepTracker step={step} />

        {step === 0 && (
          <SectionCard
            eyebrow="Basics"
            title="Your core financial context"
            subtitle="This gives the dashboard a stable base and helps tailor the language of the rules."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <NumberField label="Monthly income" value={profile.monthlyIncome} onChange={(value) => update("monthlyIncome", value)} prefix="₹" required />
              <NumberField label="Monthly expenses" value={profile.monthlyExpenses} onChange={(value) => update("monthlyExpenses", value)} prefix="₹" required />
              <NumberField label="Number of dependents" value={profile.dependents} onChange={(value) => update("dependents", value)} />
              <SelectField label="Employment type" value={profile.employmentType} onChange={(value) => update("employmentType", value)} options={employmentOptions} />
              <SelectField label="Primary goal" value={profile.financialGoal} onChange={(value) => update("financialGoal", value)} options={goalOptions} />
              <TextHint>
                Use your current real income and spending. If your monthly pay fluctuates, enter the average you actually live on.
              </TextHint>
            </div>
          </SectionCard>
        )}

        {step === 1 && (
          <SectionCard
            eyebrow="Budget"
            title="How your monthly cash flow is split"
            subtitle="This is what makes the 50-30-20 rule useful instead of abstract."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <NumberField label="Monthly needs" value={profile.monthlyNeeds || 0} onChange={(value) => update("monthlyNeeds", value)} prefix="₹" />
              <NumberField label="Monthly wants" value={profile.monthlyWants || 0} onChange={(value) => update("monthlyWants", value)} prefix="₹" />
              <NumberField label="Monthly SIP" value={profile.monthlySIP} onChange={(value) => update("monthlySIP", value)} prefix="₹" />
              <NumberField label="SIP amount a year ago" value={profile.sipLastYear} onChange={(value) => update("sipLastYear", value)} prefix="₹" />
              <DateField label="SIP start date" value={profile.sipStartDate} onChange={(value) => update("sipStartDate", value)} />
              <NumberField label="Monthly loan EMI" value={profile.loans} onChange={(value) => update("loans", value)} prefix="₹" />
              <SelectField
                label="Three-account system"
                value={profile.threeAccountSystem ? "yes" : "no"}
                onChange={(value) => update("threeAccountSystem", value === "yes")}
                options={[
                  { value: "yes", label: "Yes" },
                  { value: "no", label: "No" },
                ]}
              />
              <TextHint>
                If you already know your needs/wants breakdown, enter it now. If not, start with your best estimate and refine it later in Settings.
              </TextHint>
            </div>
          </SectionCard>
        )}

        {step === 2 && (
          <SectionCard
            eyebrow="Protection"
            title="Safety net and credit exposure"
            subtitle="These inputs power the emergency fund, insurance, and credit utilization rules."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <NumberField label="Emergency fund" value={profile.emergencyFund} onChange={(value) => update("emergencyFund", value)} prefix="₹" />
              <NumberField label="Health insurance cover" value={profile.healthInsurance} onChange={(value) => update("healthInsurance", value)} prefix="₹" />
              <NumberField label="Term insurance cover" value={profile.termInsurance} onChange={(value) => update("termInsurance", value)} prefix="₹" />
              <NumberField label="Credit limit" value={profile.creditLimit} onChange={(value) => update("creditLimit", value)} prefix="₹" />
              <NumberField label="Current credit usage" value={profile.creditUsage} onChange={(value) => update("creditUsage", value)} prefix="₹" />
              <TextHint>
                Enter the actual sum insured, not the premium. Credit usage should be the outstanding balance currently reported on your card.
              </TextHint>
            </div>
          </SectionCard>
        )}

        {step === 3 && (
          <SectionCard
            eyebrow="Investments"
            title="Where your wealth is already parked"
            subtitle="This is the input layer for net worth, gold allocation, and the investment-rate rule."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <NumberField label="Mutual funds" value={profile.mutualFunds} onChange={(value) => update("mutualFunds", value)} prefix="₹" />
              <NumberField label="Stocks" value={profile.stocks} onChange={(value) => update("stocks", value)} prefix="₹" />
              <NumberField label="EPF / provident fund" value={profile.epf} onChange={(value) => update("epf", value)} prefix="₹" />
              <NumberField label="Gold" value={profile.gold} onChange={(value) => update("gold", value)} prefix="₹" />
              <div className="md:col-span-2 rounded-xl border border-border/70 bg-background/50 p-4 text-sm text-muted-foreground">
                If you hold other assets, keep them outside the scorecard for now. The app is optimized for the 9 rules you actually want to track daily.
              </div>
            </div>
          </SectionCard>
        )}

        {step === 4 && (
          <SectionCard
            eyebrow="Review"
            title="Check the profile before activating"
            subtitle="This is the last pass before the dashboard starts using your real numbers."
          >
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
              <div className="space-y-3 rounded-xl border border-border/70 bg-background/40 p-4 text-sm">
                <SummaryRow label="Income" value={inr(profile.monthlyIncome)} />
                <SummaryRow label="Expenses" value={inr(profile.monthlyExpenses)} />
                <SummaryRow label="Needs / Wants" value={`${inr(profile.monthlyNeeds || 0)} / ${inr(profile.monthlyWants || 0)}`} />
                <SummaryRow label="Emergency fund" value={inr(profile.emergencyFund)} />
                <SummaryRow label="Insurance cover" value={`${inr(profile.healthInsurance)} health / ${inr(profile.termInsurance)} term`} />
                <SummaryRow label="Investments" value={`${inr(profile.mutualFunds)} MF / ${inr(profile.stocks)} stocks / ${inr(profile.epf)} EPF / ${inr(profile.gold)} gold`} />
              </div>

              <div className="rounded-xl border border-border/70 bg-background/40 p-4">
                <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">Completion</div>
                <div className="mt-2 text-4xl font-semibold tracking-tight text-foreground">{completion}%</div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  A higher completion score means the dashboard can produce better rule guidance. Any field left at zero will be treated as an actual zero.
                </p>
                <div className="mt-4 rounded-lg border border-border/60 bg-card p-3 text-xs text-muted-foreground">
                  After saving, the dashboard will show only your real profile values and the 9-rule score will update from this data.
                </div>
              </div>
            </div>
          </SectionCard>
        )}

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setStep((current) => (current > 0 ? ((current - 1) as Step) : current))}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
            disabled={step === 0}
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep((current) => ((current + 1) as Step))}
              className="inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:opacity-90"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={saveAndFinish}
              className="inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:opacity-90"
            >
              Activate dashboard <CheckCircle2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function StepTracker({ step }: { step: Step }) {
  const labels = ["Basics", "Budget", "Protection", "Investments", "Review"];
  return (
    <div className="mb-6 grid gap-2 md:grid-cols-5">
      {labels.map((label, index) => {
        const active = step === index;
        const complete = step > index;
        return (
          <div
            key={label}
            className={`rounded-lg border px-3 py-2 text-xs font-medium ${
              active
                ? "border-foreground bg-card text-foreground"
                : complete
                ? "border-success/40 bg-success/10 text-success"
                : "border-border bg-card text-muted-foreground"
            }`}
          >
            <div className="uppercase tracking-[0.16em]">Step {index + 1}</div>
            <div className="mt-1 text-sm font-semibold tracking-tight">{label}</div>
          </div>
        );
      })}
    </div>
  );
}

function SectionCard({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-5 border-b border-border/60 pb-4">
        <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</div>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
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
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label} {required ? <span className="text-foreground">*</span> : null}
      </span>
      <div className="mt-1.5 flex items-center gap-2 rounded-md border border-border bg-background/50 px-3 focus-within:border-foreground/40">
        {prefix && <span className="text-sm text-muted-foreground">{prefix}</span>}
        <input
          type="number"
          min="0"
          value={Number.isFinite(value) ? value : 0}
          onChange={(event) => onChange(Number(event.target.value) || 0)}
          className="w-full bg-transparent py-2.5 text-sm font-medium tabular-nums outline-none"
        />
      </div>
    </label>
  );
}

function DateField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <input
        type="date"
        value={value.slice(0, 10)}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 w-full rounded-md border border-border bg-background/50 px-3 py-2.5 text-sm outline-none focus:border-foreground/40"
      />
    </label>
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
      <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1.5 grid gap-2 sm:grid-cols-3">
        {options.map((option) => {
          const active = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                active
                  ? "border-foreground bg-background text-foreground"
                  : "border-border bg-background/50 text-muted-foreground hover:border-foreground/30 hover:text-foreground"
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

function TextHint({ children }: { children: React.ReactNode }) {
  return <div className="rounded-md border border-border/60 bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground md:col-span-2">{children}</div>;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-2 last:border-b-0 last:pb-0">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground text-right">{value}</span>
    </div>
  );
}

function inr(value: number) {
  if (!value) return "₹0";
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${Math.round(value)}`;
}