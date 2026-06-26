// Rule engine — evaluateRules, disciplineScore (with foundation check),
// topActions, and statusTone.

import type { FinancialProfile } from "@/lib/profile/types";
import { RULE_DEFINITIONS } from "./definitions";
import type { RuleResult, Score, ActionItem, RuleStatus } from "./types";

// ---------------------------------------------------------------------------
// Evaluate all 9 rules
// ---------------------------------------------------------------------------

export function evaluateRules(profile: FinancialProfile): RuleResult[] {
  return RULE_DEFINITIONS.map((def) => {
    const partial = def.evaluate(profile);
    return {
      ...partial,
      progressPct: partial.maxPoints > 0 ? (partial.points / partial.maxPoints) * 100 : 0,
    };
  });
}

// ---------------------------------------------------------------------------
// Composite score with foundation check
// ---------------------------------------------------------------------------

export function disciplineScore(rules: RuleResult[]): Score {
  const total = rules.reduce((s, r) => s + r.points, 0);
  const max = rules.reduce((s, r) => s + r.maxPoints, 0);
  const pct = max > 0 ? (total / max) * 100 : 0;

  let category: Score["category"] = "Critical";
  if (pct >= 90) category = "Excellent";
  else if (pct >= 75) category = "Strong";
  else if (pct >= 60) category = "Good";
  else if (pct >= 40) category = "Needs Attention";

  // Foundation check:
  // If Emergency Fund (rule 0) scores 0 OR both insurance rules (1+2) score 0 → cap at "Needs Attention"
  let cappedReason: string | null = null;
  const efRule = rules.find((r) => r.id === "emergency-fund");
  const hiRule = rules.find((r) => r.id === "health-insurance");
  const tiRule = rules.find((r) => r.id === "term-insurance");

  const efFailed = efRule && efRule.points === 0;
  const insuranceFailed = hiRule && tiRule && hiRule.points === 0 && tiRule.points === 0;

  if (efFailed || insuranceFailed) {
    const categoryRank = ["Critical", "Needs Attention", "Good", "Strong", "Excellent"];
    const currentIdx = categoryRank.indexOf(category);
    const capIdx = categoryRank.indexOf("Needs Attention");
    if (currentIdx > capIdx) {
      category = "Needs Attention";
      cappedReason = "Your foundation rules (emergency fund or insurance) need attention first.";
    }
  }

  return { total: Math.round(pct), max: 100, category, cappedReason };
}

// ---------------------------------------------------------------------------
// Top 3 actionable recommendations
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Status → visual tokens
// ---------------------------------------------------------------------------

export function statusTone(s: RuleStatus) {
  switch (s) {
    case "excellent":
      return { label: "Excellent", color: "text-success", dot: "bg-success", ring: "border-success/30" };
    case "good":
      return { label: "Good", color: "text-success", dot: "bg-success", ring: "border-success/30" };
    case "warning":
      return { label: "Warning", color: "text-warning", dot: "bg-warning", ring: "border-warning/30" };
    case "critical":
      return { label: "Critical", color: "text-destructive", dot: "bg-destructive", ring: "border-destructive/30" };
  }
}
