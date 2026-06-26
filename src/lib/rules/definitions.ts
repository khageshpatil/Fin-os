// 9 rule definitions. Each is a self-contained evaluator.
// Formulas match Section 7 of the implementation plan exactly.

import { inr } from "@/lib/format";
import type { FinancialProfile } from "@/lib/profile/types";
import { totalInvestments, hasBudgetCategories } from "@/lib/profile/types";
import type { RuleDefinition } from "./types";

// ---------------------------------------------------------------------------
// Rule 1: Emergency Fund (20 pts, foundation)
// ---------------------------------------------------------------------------
const emergencyFund: RuleDefinition = {
  id: "emergency-fund",
  name: "Emergency Fund",
  description: "Maintain at least 6 months of expenses as emergency savings.",
  maxPoints: 20,
  category: "foundation",
  evaluate(p) {
    const months = p.monthlyExpenses > 0 ? p.emergencyFund / p.monthlyExpenses : 0;
    let points = 0;
    if (months >= 6) points = 20;
    else if (months >= 4) points = 15;
    else if (months >= 2) points = 10;

    const status =
      months >= 6 ? "excellent" as const
      : months >= 4 ? "good" as const
      : months >= 2 ? "warning" as const
      : "critical" as const;

    return {
      id: this.id, name: this.name, description: this.description,
      current: `${months.toFixed(1)} Months`,
      target: "6 Months",
      currentNum: months,
      targetNum: 6,
      gap: months >= 6 ? "On Track" : `${(6 - months).toFixed(1)} months short`,
      points,
      maxPoints: this.maxPoints,
      status,
      action: months >= 6
        ? "Maintain your buffer in a liquid fund."
        : `Add ${inr((6 - months) * p.monthlyExpenses)} to your emergency fund.`,
    };
  },
};

// ---------------------------------------------------------------------------
// Rule 2: Health Insurance (10 pts, protection)
// ---------------------------------------------------------------------------
const healthInsurance: RuleDefinition = {
  id: "health-insurance",
  name: "Health Insurance",
  description: "Hold a health cover of at least ₹10 Lakhs.",
  maxPoints: 10,
  category: "protection",
  evaluate(p) {
    let points = 0;
    if (p.healthInsurance >= 1_000_000) points = 10;
    else if (p.healthInsurance >= 500_000) points = 5;

    const status =
      p.healthInsurance >= 1_000_000 ? "excellent" as const
      : p.healthInsurance >= 500_000 ? "warning" as const
      : "critical" as const;

    return {
      id: this.id, name: this.name, description: this.description,
      current: inr(p.healthInsurance),
      target: "₹10 L",
      currentNum: p.healthInsurance,
      targetNum: 1_000_000,
      gap: p.healthInsurance >= 1_000_000 ? "Covered" : `${inr(1_000_000 - p.healthInsurance)} short`,
      points,
      maxPoints: this.maxPoints,
      status,
      action: p.healthInsurance >= 1_000_000
        ? "Review cover every 2 years for inflation."
        : p.healthInsurance === 0
          ? "Buy a ₹10L+ family floater plan."
          : "Top-up to a ₹10L family floater plan.",
    };
  },
};

// ---------------------------------------------------------------------------
// Rule 3: Term Insurance (10 pts, protection)
// ---------------------------------------------------------------------------
const termInsurance: RuleDefinition = {
  id: "term-insurance",
  name: "Term Insurance",
  description: "Carry pure term cover of at least 10x your annual income.",
  maxPoints: 10,
  category: "protection",
  evaluate(p) {
    const annualIncome = p.monthlyIncome * 12;
    const termTarget = annualIncome * 10;
    const ratio = annualIncome > 0 ? p.termInsurance / annualIncome : 0;

    let points = 0;
    if (ratio >= 10) points = 10;
    else if (ratio >= 5) points = 5;

    const status =
      ratio >= 10 ? "excellent" as const
      : ratio >= 5 ? "warning" as const
      : "critical" as const;

    let action: string;
    if (ratio >= 10) {
      action = "Cover is on track.";
    } else if (p.dependents === 0) {
      action = "No dependents currently. Re-evaluate if your situation changes.";
    } else {
      action = `Buy additional term cover of ${inr(termTarget - p.termInsurance)}.`;
    }

    return {
      id: this.id, name: this.name, description: this.description,
      current: inr(p.termInsurance),
      target: `${inr(termTarget)} (10x)`,
      currentNum: p.termInsurance,
      targetNum: termTarget,
      gap: p.termInsurance >= termTarget ? "Adequate" : `${inr(termTarget - p.termInsurance)} short`,
      points,
      maxPoints: this.maxPoints,
      status,
      action,
    };
  },
};

// ---------------------------------------------------------------------------
// Rule 4: Investment Rate (15 pts, growth)
// ---------------------------------------------------------------------------
const investmentRate: RuleDefinition = {
  id: "investment-rate",
  name: "Investment Rate",
  description: "Invest at least 20% of your monthly income.",
  maxPoints: 15,
  category: "growth",
  evaluate(p) {
    const rate = p.monthlyIncome > 0 ? (p.monthlyInvestment / p.monthlyIncome) * 100 : 0;
    let points = 0;
    if (rate >= 20) points = 15;
    else if (rate >= 10) points = 10;

    const status =
      rate >= 20 ? "excellent" as const
      : rate >= 10 ? "good" as const
      : rate >= 5 ? "warning" as const
      : "critical" as const;

    const gap = Math.max(0, (0.20 * p.monthlyIncome) - p.monthlyInvestment);

    return {
      id: this.id, name: this.name, description: this.description,
      current: `${rate.toFixed(1)}%`,
      target: "20%",
      currentNum: rate,
      targetNum: 20,
      gap: rate >= 20 ? "On Track" : `${(20 - rate).toFixed(1)}% gap`,
      points,
      maxPoints: this.maxPoints,
      status,
      action: rate >= 20
        ? "Keep increasing investment with each raise."
        : `Increase monthly investment by ${inr(gap)}/month.`,
    };
  },
};

// ---------------------------------------------------------------------------
// Rule 5: Investment Growth (10 pts, growth)
// ---------------------------------------------------------------------------
const investmentGrowth: RuleDefinition = {
  id: "investment-growth",
  name: "Investment Growth",
  description: "Step-up your investment contribution every year.",
  maxPoints: 10,
  category: "growth",
  evaluate(p) {
    let growth: number;
    if (p.investmentLastYear === 0 && p.monthlyInvestment > 0) {
      growth = 100; // New investor — treat as excellent
    } else if (p.investmentLastYear === 0) {
      growth = 0;
    } else {
      growth = ((p.monthlyInvestment - p.investmentLastYear) / p.investmentLastYear) * 100;
    }

    let points = 0;
    if (growth >= 10) points = 10;
    else if (growth >= 5) points = 8;
    else if (growth > 0) points = 5;

    const status =
      growth >= 10 ? "excellent" as const
      : growth >= 5 ? "good" as const
      : growth > 0 ? "warning" as const
      : "critical" as const;

    return {
      id: this.id, name: this.name, description: this.description,
      current: `${growth.toFixed(0)}% YoY`,
      target: "≥ 10% YoY",
      currentNum: growth,
      targetNum: 10,
      gap: growth >= 10 ? "Growing" : "Below target",
      points,
      maxPoints: this.maxPoints,
      status,
      action: growth >= 10
        ? "Maintain the step-up cadence."
        : "Step up investment by at least 10% this year.",
    };
  },
};

// ---------------------------------------------------------------------------
// Rule 6: Three Account System (10 pts, discipline)
// ---------------------------------------------------------------------------
const threeAccountSystem: RuleDefinition = {
  id: "three-account",
  name: "Three Account System",
  description: "Separate Spending, Savings and Investment accounts.",
  maxPoints: 10,
  category: "discipline",
  evaluate(p) {
    const implemented = p.threeAccountSystem;
    return {
      id: this.id, name: this.name, description: this.description,
      current: implemented ? "Fully Implemented" : "Not Set Up",
      target: "Fully Implemented",
      currentNum: implemented ? 1 : 0,
      targetNum: 1,
      gap: implemented ? "Done" : "Set up missing accounts",
      points: implemented ? 10 : 0,
      maxPoints: this.maxPoints,
      status: implemented ? "excellent" as const : "critical" as const,
      action: implemented
        ? "Automate monthly sweeps."
        : "Open dedicated Savings & Investment accounts.",
    };
  },
};

// ---------------------------------------------------------------------------
// Rule 7: 50-30-20 Rule (10 pts, discipline)
// ---------------------------------------------------------------------------
const rule503020: RuleDefinition = {
  id: "50-30-20",
  name: "50-30-20 Rule",
  description: "Spend ≤50% on needs, ≤30% on wants, save ≥20%.",
  maxPoints: 10,
  category: "discipline",
  evaluate(p) {
    if (p.monthlyIncome === 0) {
      return {
        id: this.id, name: this.name, description: this.description,
        current: "N/A", target: "Needs ≤50% / Wants ≤30% / Save ≥20%",
        currentNum: 0, targetNum: 20, gap: "No income recorded",
        points: 0, maxPoints: this.maxPoints, status: "warning" as const,
        action: "Enter your monthly income to evaluate this rule.",
      };
    }

    let needsPct: number;
    let wantsPct: number;
    let savingsPct: number;
    let categoryTracked = false;

    if (hasBudgetCategories(p)) {
      needsPct = (p.monthlyNeeds! / p.monthlyIncome) * 100;
      wantsPct = (p.monthlyWants! / p.monthlyIncome) * 100;
      savingsPct = ((p.monthlyIncome - p.monthlyNeeds! - p.monthlyWants!) / p.monthlyIncome) * 100;
      categoryTracked = true;
    } else {
      needsPct = (p.monthlyExpenses / p.monthlyIncome) * 100;
      wantsPct = 0;
      savingsPct = ((p.monthlyIncome - p.monthlyExpenses) / p.monthlyIncome) * 100;
    }

    const compliant = needsPct <= 50 && savingsPct >= 20;
    const close = (savingsPct >= 15 || needsPct <= 60) && !compliant;
    let points = 0;
    if (compliant) points = 10;
    else if (close) points = 5;

    const status = compliant ? "excellent" as const : close ? "good" as const : "warning" as const;

    return {
      id: this.id, name: this.name, description: this.description,
      current: categoryTracked
        ? `Needs ${needsPct.toFixed(0)}% | Wants ${wantsPct.toFixed(0)}% | Save ${savingsPct.toFixed(0)}%`
        : `Expenses ${needsPct.toFixed(0)}% / Save ${savingsPct.toFixed(0)}%`,
      target: "Needs ≤50% / Wants ≤30% / Save ≥20%",
      currentNum: savingsPct,
      targetNum: 20,
      gap: compliant ? "Compliant" : categoryTracked ? "Shift spending away from wants" : "Track your needs vs wants",
      points,
      maxPoints: this.maxPoints,
      status,
      action: compliant
        ? "Keep your ratios steady."
        : categoryTracked
          ? "Reduce wants or increase income to hit 20%+ savings rate."
          : "Add needs vs wants breakdown in settings to get personalized advice.",
    };
  },
};

// ---------------------------------------------------------------------------
// Rule 8: Credit Utilization (10 pts, discipline)
// ---------------------------------------------------------------------------
const creditUtilization: RuleDefinition = {
  id: "credit-utilization",
  name: "Credit Utilization",
  description: "Keep credit utilization below 30% of total limit.",
  maxPoints: 10,
  category: "discipline",
  evaluate(p) {
    // No credit card → utilization 0%, full points
    const utilization = p.creditLimit > 0 ? (p.creditUsage / p.creditLimit) * 100 : 0;
    let points = 0;
    if (utilization < 30) points = 10;
    else if (utilization <= 50) points = 5;

    const status =
      utilization < 30 ? "excellent" as const
      : utilization <= 50 ? "warning" as const
      : "critical" as const;

    return {
      id: this.id, name: this.name, description: this.description,
      current: `${utilization.toFixed(0)}%`,
      target: "< 30%",
      currentNum: utilization,
      targetNum: 30,
      gap: utilization < 30 ? "Healthy" : `${(utilization - 30).toFixed(0)}% above`,
      points,
      maxPoints: this.maxPoints,
      status,
      action: utilization < 30
        ? "Pay statements in full each month."
        : "Lower outstanding balance or request a limit increase.",
    };
  },
};

// ---------------------------------------------------------------------------
// Rule 9: Gold Allocation (5 pts, growth)
// ---------------------------------------------------------------------------
const goldAllocation: RuleDefinition = {
  id: "gold-allocation",
  name: "Gold Allocation",
  description: "Hold 5-15% of investments in gold for stability.",
  maxPoints: 5,
  category: "growth",
  evaluate(p) {
    const inv = totalInvestments(p);
    const goldPct = inv > 0 ? (p.gold / inv) * 100 : 0;
    const inRange = goldPct >= 5 && goldPct <= 15;

    let points = 0;
    if (inRange) points = 5;
    else if (goldPct > 15) points = 3;

    const status =
      inRange ? "excellent" as const
      : goldPct > 15 ? "good" as const
      : "warning" as const;

    return {
      id: this.id, name: this.name, description: this.description,
      current: `${goldPct.toFixed(1)}%`,
      target: "5 – 15%",
      currentNum: goldPct,
      targetNum: 10,
      gap: inRange ? "Balanced" : goldPct < 5 ? "Under-allocated" : "Over-allocated",
      points,
      maxPoints: this.maxPoints,
      status,
      action: inRange
        ? "Maintain allocation through SGB or gold ETFs."
        : goldPct < 5
          ? "Increase gold via Sovereign Gold Bonds."
          : "Trim gold exposure into equity.",
    };
  },
};

// ---------------------------------------------------------------------------
// Export ordered array
// ---------------------------------------------------------------------------

export const RULE_DEFINITIONS: RuleDefinition[] = [
  emergencyFund,
  healthInsurance,
  termInsurance,
  investmentRate,
  investmentGrowth,
  threeAccountSystem,
  rule503020,
  creditUtilization,
  goldAllocation,
];
