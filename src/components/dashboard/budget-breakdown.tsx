// Budget breakdown — needs/wants/savings split (50-30-20 visualization).
// Only renders when hasBudgetCategories(profile) === true.

import type { FinancialProfile } from "@/lib/profile/types";
import { inr } from "@/lib/format";

interface BudgetSlice {
  label: string;
  amount: number;
  percent: number;
  hint: string;
  target: string;
  barColor: string;
  bgColor: string;
}

export function BudgetBreakdown({ profile }: { profile: FinancialProfile }) {
  const total = profile.monthlyIncome;
  if (total <= 0) return null;

  const needsAmount = profile.monthlyNeeds || 0;
  const wantsAmount = profile.monthlyWants || 0;
  const savingsAmount = Math.max(0, total - needsAmount - wantsAmount);

  const slices: BudgetSlice[] = [
    {
      label: "Needs",
      amount: needsAmount,
      percent: (needsAmount / total) * 100,
      hint: "Essentials — rent, groceries, utilities",
      target: "≤ 50%",
      barColor: "bg-blue-500",
      bgColor: "border-blue-500/20 bg-blue-500/5",
    },
    {
      label: "Wants",
      amount: wantsAmount,
      percent: (wantsAmount / total) * 100,
      hint: "Discretionary — dining, entertainment",
      target: "≤ 30%",
      barColor: "bg-amber-500",
      bgColor: "border-amber-500/20 bg-amber-500/5",
    },
    {
      label: "Savings",
      amount: savingsAmount,
      percent: (savingsAmount / total) * 100,
      hint: "Investments, emergency fund, future",
      target: "≥ 20%",
      barColor: "bg-emerald-500",
      bgColor: "border-emerald-500/20 bg-emerald-500/5",
    },
  ];

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {slices.map((s) => (
        <div key={s.label} className={`rounded-lg border p-4 ${s.bgColor}`}>
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">{s.label}</div>
            <span className="text-[10px] text-muted-foreground">{s.target}</span>
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">{s.hint}</div>
          <div className="mt-3 text-2xl font-semibold tabular-nums tracking-tight">
            {inr(s.amount)}
          </div>
          <div className="mt-1 text-xs text-muted-foreground tabular-nums">
            {s.percent.toFixed(0)}% of income
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted/30">
            <div
              className={`h-full rounded-full ${s.barColor}`}
              style={{
                width: `${Math.min(100, s.percent)}%`,
                transition: "width 600ms cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
