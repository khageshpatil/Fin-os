// Financial Profile + WealthOS rule evaluation engine.

export interface FinancialProfile {
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyNeeds?: number; // optional: rent, utilities, food, etc.
  monthlyWants?: number; // optional: dining out, subscriptions, entertainment, etc.
  emergencyFund: number;
  mutualFunds: number;
  stocks: number;
  epf: number;
  gold: number;
  creditLimit: number;
  creditUsage: number;
  healthInsurance: number;
  termInsurance: number;
  monthlySIP: number;
  sipStartDate: string; // ISO
  sipLastYear: number; // last year SIP amount, used for growth check
  threeAccountSystem: boolean;
  loans: number; // monthly EMI
  // Onboarding state
  onboardingComplete: boolean;
  dependents: number; // 0, 1, 2, 3+
  incomeRange: string; // "under-30", "30-50", "50-75", "75-100", "over-100" (in K/month)
  employmentType: string; // "salaried", "self-employed", "startup"
  financialGoal: string; // "wealth-creation", "debt-freedom", "early-retirement"
}

export function createBlankProfile(): FinancialProfile {
  return {
    monthlyIncome: 0,
    monthlyExpenses: 0,
    monthlyNeeds: undefined,
    monthlyWants: undefined,
    emergencyFund: 0,
    mutualFunds: 0,
    stocks: 0,
    epf: 0,
    gold: 0,
    creditLimit: 0,
    creditUsage: 0,
    healthInsurance: 0,
    termInsurance: 0,
    monthlySIP: 0,
    sipStartDate: "",
    sipLastYear: 0,
    threeAccountSystem: false,
    loans: 0,
    onboardingComplete: false,
    dependents: 0,
    incomeRange: "",
    employmentType: "",
    financialGoal: "",
  };
}

export const SAMPLE_PROFILE: FinancialProfile = {
  monthlyIncome: 85000,
  monthlyExpenses: 42000,
  monthlyNeeds: 25000,
  monthlyWants: 17000,
  emergencyFund: 180000,
  mutualFunds: 320000,
  stocks: 110000,
  epf: 240000,
  gold: 25000,
  creditLimit: 100000,
  creditUsage: 18000,
  healthInsurance: 1000000,
  termInsurance: 7500000,
  monthlySIP: 12000,
  sipStartDate: "2022-04-01",
  sipLastYear: 9000,
  threeAccountSystem: true,
  loans: 0,
  onboardingComplete: true,
  dependents: 0,
  incomeRange: "75-100",
  employmentType: "salaried",
  financialGoal: "wealth-creation",
};

export type RuleStatus = "critical" | "warning" | "good" | "excellent";

export interface RuleResult {
  id: string;
  name: string;
  description: string;
  current: string;
  target: string;
  currentNum: number;
  targetNum: number;
  gap: string;
  points: number;
  maxPoints: number;
  progressPct: number;
  status: RuleStatus;
  action: string;
}

function withProgress(rule: Omit<RuleResult, "progressPct">): RuleResult {
  return {
    ...rule,
    progressPct: rule.maxPoints > 0 ? (rule.points / rule.maxPoints) * 100 : 0,
  };
}

export function inr(n: number) {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${Math.round(n)}`;
}

export function totalInvestments(p: FinancialProfile) {
  return p.mutualFunds + p.stocks + p.epf + p.gold;
}

export function netWorth(p: FinancialProfile) {
  return totalInvestments(p) + p.emergencyFund;
}

export function hasBudgetCategories(p: FinancialProfile) {
  return (
    p.monthlyNeeds !== undefined &&
    p.monthlyWants !== undefined &&
    (p.monthlyNeeds > 0 || p.monthlyWants > 0 || p.monthlyExpenses === 0)
  );
}

export function evaluateRules(p: FinancialProfile): RuleResult[] {
  const annualIncome = p.monthlyIncome * 12;

  // 1. Emergency Fund — 6 months expenses (tiered: <2=0, 2-4=10, 4-6=15, 6+=20)
  const efMonths = p.monthlyExpenses > 0 ? p.emergencyFund / p.monthlyExpenses : 0;
  let efPoints = 0;
  if (efMonths >= 6) efPoints = 20;
  else if (efMonths >= 4) efPoints = 15;
  else if (efMonths >= 2) efPoints = 10;
  const r1 = withProgress({
    id: "emergency-fund",
    name: "Emergency Fund",
    description: "Maintain at least 6 months of expenses as emergency savings.",
    current: `${efMonths.toFixed(1)} Months`,
    target: "6 Months",
    currentNum: efMonths,
    targetNum: 6,
    gap: efMonths >= 6 ? "On Track" : `${(6 - efMonths).toFixed(1)} months short`,
    points: efPoints,
    maxPoints: 20,
    status:
      efMonths >= 6 ? "excellent" : efMonths >= 4 ? "good" : efMonths >= 2 ? "warning" : "critical",
    action:
      efMonths >= 6
        ? "Maintain your buffer in a liquid fund."
        : `Add ${inr((6 - efMonths) * p.monthlyExpenses)} to your emergency fund.`,
  });

  // 2. Health Insurance — 10L+ (tiered: <5L=0, 5L-10L=5, 10L+=10)
  let hiPoints = 0;
  if (p.healthInsurance >= 1000000) hiPoints = 10;
  else if (p.healthInsurance >= 500000) hiPoints = 5;
  const r2 = withProgress({
    id: "health-insurance",
    name: "Health Insurance",
    description: "Hold a health cover of at least ₹10 Lakhs.",
    current: inr(p.healthInsurance),
    target: "₹10 L",
    currentNum: p.healthInsurance,
    targetNum: 1000000,
    gap: p.healthInsurance >= 1000000 ? "Covered" : `${inr(1000000 - p.healthInsurance)} short`,
    points: hiPoints,
    maxPoints: 10,
    status:
      p.healthInsurance >= 1000000
        ? "excellent"
        : p.healthInsurance >= 500000
          ? "warning"
          : "critical",
    action:
      p.healthInsurance >= 1000000
        ? "Review cover every 2 years for inflation."
        : "Top-up to a ₹10L family floater plan.",
  });

  // 3. Term Insurance — 10x annual income (tiered: <5x=0, 5x-10x=5, 10x+=10)
  const termTarget = annualIncome * 10;
  const termRatio = annualIncome > 0 ? p.termInsurance / annualIncome : 0;
  let tiPoints = 0;
  if (termRatio >= 10) tiPoints = 10;
  else if (termRatio >= 5) tiPoints = 5;
  const r3 = withProgress({
    id: "term-insurance",
    name: "Term Insurance",
    description: "Carry pure term cover of at least 10x your annual income.",
    current: inr(p.termInsurance),
    target: `${inr(termTarget)} (10x)`,
    currentNum: p.termInsurance,
    targetNum: termTarget,
    gap: p.termInsurance >= termTarget ? "Adequate" : `${inr(termTarget - p.termInsurance)} short`,
    points: tiPoints,
    maxPoints: 10,
    status:
      p.termInsurance >= termTarget
        ? "excellent"
        : p.termInsurance >= termTarget * 0.5
          ? "warning"
          : "critical",
    action:
      p.termInsurance >= termTarget
        ? "Cover is on track."
        : `Buy additional term cover of ${inr(termTarget - p.termInsurance)}.`,
  });

  // 4. Investment Rate — 20%+ of income (tiered: <10%=0, 10-20%=10, 20%+=15)
  const investRate = p.monthlyIncome > 0 ? (p.monthlySIP / p.monthlyIncome) * 100 : 0;
  let irPoints = 0;
  if (investRate >= 20) irPoints = 15;
  else if (investRate >= 10) irPoints = 10;
  const r4 = withProgress({
    id: "investment-rate",
    name: "Investment Rate",
    description: "Invest at least 20% of your monthly income.",
    current: `${investRate.toFixed(1)}%`,
    target: "20%",
    currentNum: investRate,
    targetNum: 20,
    gap: investRate >= 20 ? "On Track" : `${(20 - investRate).toFixed(1)}% gap`,
    points: irPoints,
    maxPoints: 15,
    status:
      investRate >= 20
        ? "excellent"
        : investRate >= 10
          ? "good"
          : investRate >= 5
            ? "warning"
            : "critical",
    action:
      investRate >= 20
        ? "Keep increasing SIP with each raise."
        : `Increase SIP by ${inr(((20 - investRate) / 100) * p.monthlyIncome)} / month.`,
  });

  // 5. SIP Growth — increase every year (tiered: 0=0, 1-5%=5, 5-10%=8, 10%+=10)
  const sipGrowth = p.sipLastYear > 0 ? ((p.monthlySIP - p.sipLastYear) / p.sipLastYear) * 100 : 0;
  let sgPoints = 0;
  if (sipGrowth >= 10) sgPoints = 10;
  else if (sipGrowth >= 5) sgPoints = 8;
  else if (sipGrowth > 0) sgPoints = 5;
  const r5 = withProgress({
    id: "sip-growth",
    name: "SIP Growth",
    description: "Step-up your SIP contribution every year.",
    current: `${sipGrowth.toFixed(0)}% YoY`,
    target: "≥ 10% YoY",
    currentNum: sipGrowth,
    targetNum: 10,
    gap: sipGrowth >= 10 ? "Growing" : "Below target",
    points: sgPoints,
    maxPoints: 10,
    status:
      sipGrowth >= 10
        ? "excellent"
        : sipGrowth >= 5
          ? "good"
          : sipGrowth > 0
            ? "warning"
            : "critical",
    action:
      sipGrowth >= 10 ? "Maintain the step-up cadence." : "Step-up SIP by at least 10% this year.",
  });

  // 6. Three-Account System (tiered: Not=0, Partial=5, Fully=10)
  const r6 = withProgress({
    id: "three-account",
    name: "Three Account System",
    description: "Separate Spending, Savings and Investment accounts.",
    current: p.threeAccountSystem ? "Fully Implemented" : "Not Set Up",
    target: "Fully Implemented",
    currentNum: p.threeAccountSystem ? 1 : 0,
    targetNum: 1,
    gap: p.threeAccountSystem ? "Done" : "Set up missing accounts",
    points: p.threeAccountSystem ? 10 : 0,
    maxPoints: 10,
    status: p.threeAccountSystem ? "excellent" : "critical",
    action: p.threeAccountSystem
      ? "Automate monthly sweeps."
      : "Open dedicated Savings & Investment accounts.",
  });

  // 7. 50-30-20 — needs/wants/savings ratio (tiered: Poor=0, Close=5, Compliant=10)
  // If category data is available, use it; otherwise fall back to total expenses
  let needsPct: number;
  let wantsPct: number;
  let savingsPct: number;
  let categoryTracked = false;

  if (hasBudgetCategories(p)) {
    // Category-based calculation (more accurate)
    needsPct = (p.monthlyNeeds / p.monthlyIncome) * 100;
    wantsPct = (p.monthlyWants / p.monthlyIncome) * 100;
    savingsPct = ((p.monthlyIncome - p.monthlyNeeds - p.monthlyWants) / p.monthlyIncome) * 100;
    categoryTracked = true;
  } else {
    // Fallback: assume all expenses are needs (conservative)
    needsPct = (p.monthlyExpenses / p.monthlyIncome) * 100;
    wantsPct = 0;
    savingsPct = ((p.monthlyIncome - p.monthlyExpenses) / p.monthlyIncome) * 100;
  }

  const compliant = needsPct <= 50 && savingsPct >= 20;
  const close = (savingsPct >= 15 || needsPct <= 60) && !compliant;
  let r7Points = 0;
  if (compliant) r7Points = 10;
  else if (close) r7Points = 5;

  const r7 = withProgress({
    id: "50-30-20",
    name: "50-30-20 Rule",
    description: "Spend ≤50% on needs, ≤30% on wants, save ≥20%.",
    current: categoryTracked
      ? `Needs ${needsPct.toFixed(0)}% | Wants ${wantsPct.toFixed(0)}% | Save ${savingsPct.toFixed(0)}%`
      : `Expenses ${needsPct.toFixed(0)}% / Save ${savingsPct.toFixed(0)}%`,
    target: "Needs ≤50% / Wants ≤30% / Save ≥20%",
    currentNum: savingsPct,
    targetNum: 20,
    gap: compliant
      ? "Compliant"
      : categoryTracked
        ? "Shift spending away from wants"
        : "Track your needs vs wants",
    points: r7Points,
    maxPoints: 10,
    status: compliant ? "excellent" : close ? "good" : "warning",
    action: compliant
      ? "Keep your ratios steady."
      : categoryTracked
        ? "Reduce wants or increase income to hit 20%+ savings rate."
        : "Add needs vs wants breakdown in settings to get personalized advice.",
  });

  // 8. Credit Utilization — below 30% (tiered: >50%=0, 30-50%=5, <30%=10)
  const utilization = p.creditLimit > 0 ? (p.creditUsage / p.creditLimit) * 100 : 0;
  let cuPoints = 0;
  if (utilization < 30) cuPoints = 10;
  else if (utilization <= 50) cuPoints = 5;
  const r8 = withProgress({
    id: "credit-utilization",
    name: "Credit Utilization",
    description: "Keep credit utilization below 30% of total limit.",
    current: `${utilization.toFixed(0)}%`,
    target: "< 30%",
    currentNum: utilization,
    targetNum: 30,
    gap: utilization < 30 ? "Healthy" : `${(utilization - 30).toFixed(0)}% above`,
    points: cuPoints,
    maxPoints: 10,
    status: utilization < 30 ? "excellent" : utilization <= 50 ? "warning" : "critical",
    action:
      utilization < 30
        ? "Pay statements in full each month."
        : "Lower outstanding balance or request a limit increase.",
  });

  // 9. Gold Allocation — 5-15% of investments (tiered: <5%=0, 5-15%=5, >15%=3)
  const inv = totalInvestments(p);
  const goldPct = inv > 0 ? (p.gold / inv) * 100 : 0;
  const goldOk = goldPct >= 5 && goldPct <= 15;
  let gaPoints = 0;
  if (goldPct >= 5 && goldPct <= 15) gaPoints = 5;
  else if (goldPct > 15) gaPoints = 3;
  const r9 = withProgress({
    id: "gold-allocation",
    name: "Gold Allocation",
    description: "Hold 5-15% of investments in gold for stability.",
    current: `${goldPct.toFixed(1)}%`,
    target: "5 – 15%",
    currentNum: goldPct,
    targetNum: 10,
    gap: goldOk ? "Balanced" : goldPct < 5 ? "Under-allocated" : "Over-allocated",
    points: gaPoints,
    maxPoints: 5,
    status: goldOk ? "excellent" : goldPct > 15 ? "good" : "warning",
    action: goldOk
      ? "Maintain allocation through SGB or gold ETFs."
      : goldPct < 5
        ? "Increase gold via Sovereign Gold Bonds."
        : "Trim gold exposure into equity.",
  });

  return [r1, r2, r3, r4, r5, r6, r7, r8, r9];
}

export interface Score {
  total: number;
  max: number;
  category: "Critical" | "Needs Attention" | "Good" | "Strong" | "Excellent";
}

export function disciplineScore(rules: RuleResult[]): Score {
  const total = rules.reduce((s, r) => s + r.points, 0);
  const max = rules.reduce((s, r) => s + r.maxPoints, 0);
  const pct = (total / max) * 100;
  let category: Score["category"] = "Critical";
  if (pct >= 90) category = "Excellent";
  else if (pct >= 75) category = "Strong";
  else if (pct >= 60) category = "Good";
  else if (pct >= 40) category = "Needs Attention";
  return { total: Math.round(pct), max: 100, category };
}

export interface ActionItem {
  title: string;
  rule: string;
  impact: number;
  priority: "High" | "Medium" | "Low";
}

export function topActions(rules: RuleResult[]): ActionItem[] {
  return rules
    .map((r) => ({
      title: r.action,
      rule: r.name,
      impact: r.maxPoints - r.points,
      priority: (r.maxPoints - r.points >= 8
        ? "High"
        : r.maxPoints - r.points >= 4
          ? "Medium"
          : "Low") as ActionItem["priority"],
    }))
    .filter((a) => a.impact > 0)
    .sort((a, b) => b.impact - a.impact)
    .slice(0, 3);
}

export function statusTone(s: RuleStatus) {
  switch (s) {
    case "excellent":
      return {
        label: "Excellent",
        color: "text-success",
        dot: "bg-success",
        ring: "border-success/30",
      };
    case "good":
      return { label: "Good", color: "text-success", dot: "bg-success", ring: "border-success/30" };
    case "warning":
      return {
        label: "Warning",
        color: "text-warning",
        dot: "bg-warning",
        ring: "border-warning/30",
      };
    case "critical":
      return {
        label: "Critical",
        color: "text-destructive",
        dot: "bg-destructive",
        ring: "border-destructive/30",
      };
  }
}
