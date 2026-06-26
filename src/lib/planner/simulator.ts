// Planner simulator — pure functions for what-if scenarios.
// Follows the exact scenario definitions from Section 8 of the implementation plan.

import type { FinancialProfile } from "@/lib/profile/types";
import { evaluateRules, disciplineScore } from "@/lib/rules/engine";
import { inr } from "@/lib/format";
import type {
  ScenarioType,
  ScenarioInputs,
  SalaryInputs,
  InvestmentInputs,
  PurchaseInputs,
  LoanInputs,
  SimulationResult,
  AffectedRule,
} from "./types";

// ---------------------------------------------------------------------------
// Apply scenario mutations to a cloned profile
// ---------------------------------------------------------------------------

export function applyScenario(
  profile: FinancialProfile,
  type: ScenarioType,
  inputs: ScenarioInputs,
): FinancialProfile {
  // Deep-enough clone (profile is a flat object with one nested Record)
  const next: FinancialProfile = {
    ...profile,
    fieldTimestamps: { ...profile.fieldTimestamps },
  };

  switch (type) {
    case "salary": {
      const { newSalary, raiseToInvestmentPct } = inputs as SalaryInputs;
      const raise = newSalary - profile.monthlyIncome;
      next.monthlyIncome = newSalary;
      next.monthlyInvestment = profile.monthlyInvestment + (raise * raiseToInvestmentPct) / 100;
      break;
    }
    case "investment": {
      const { additionalInvestment } = inputs as InvestmentInputs;
      next.monthlyInvestment = profile.monthlyInvestment + additionalInvestment;
      break;
    }
    case "purchase": {
      const { purchaseAmount } = inputs as PurchaseInputs;
      next.emergencyFund = Math.max(0, profile.emergencyFund - purchaseAmount);
      break;
    }
    case "loan": {
      const { newEMI } = inputs as LoanInputs;
      next.monthlyEMI = profile.monthlyEMI + newEMI;
      next.monthlyExpenses = profile.monthlyExpenses + newEMI;
      break;
    }
  }

  return next;
}

// ---------------------------------------------------------------------------
// Full simulation
// ---------------------------------------------------------------------------

export function simulate(
  profile: FinancialProfile,
  type: ScenarioType,
  inputs: ScenarioInputs,
): SimulationResult {
  const projected = applyScenario(profile, type, inputs);

  const baseRules = evaluateRules(profile);
  const projRules = evaluateRules(projected);
  const baseScore = disciplineScore(baseRules);
  const projScore = disciplineScore(projRules);

  const delta = projScore.total - baseScore.total;

  const affectedRules: AffectedRule[] = baseRules
    .map((base, i) => ({
      name: base.name,
      delta: projRules[i].points - base.points,
    }))
    .filter((r) => r.delta !== 0)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

  const recommendation = generateRecommendation(type, inputs, profile, delta);

  return {
    baseScore: { total: baseScore.total, category: baseScore.category },
    projectedScore: { total: projScore.total, category: projScore.category },
    delta,
    affectedRules,
    recommendation,
  };
}

// ---------------------------------------------------------------------------
// Template-based recommendations (Section 8)
// ---------------------------------------------------------------------------

function generateRecommendation(
  type: ScenarioType,
  inputs: ScenarioInputs,
  profile: FinancialProfile,
  delta: number,
): string {
  switch (type) {
    case "salary": {
      const { newSalary, raiseToInvestmentPct } = inputs as SalaryInputs;
      const raise = newSalary - profile.monthlyIncome;
      const allocated = (raise * raiseToInvestmentPct) / 100;
      return `This scenario sends ${inr(allocated)} (${raiseToInvestmentPct}% of the raise) into investment each month. Adjust the split until the score lift feels worth it.`;
    }
    case "investment": {
      return delta > 0
        ? `Strong move — projected score lifts by ${delta}. Automate the step-up on the 1st of next month.`
        : "Your investment rate is already on target.";
    }
    case "purchase": {
      const { purchaseAmount } = inputs as PurchaseInputs;
      return purchaseAmount > profile.emergencyFund * 0.5
        ? "This buy materially weakens your emergency buffer. Delay 3-6 months or split into installments."
        : "Manageable — rebuild the emergency fund within 6 months.";
    }
    case "loan": {
      const { newEMI } = inputs as LoanInputs;
      const totalEMI = profile.monthlyEMI + newEMI;
      return totalEMI / profile.monthlyIncome > 0.3
        ? "EMI exceeds 30% of income. Reconsider the loan amount or extend tenure."
        : "DTI stays in safe territory.";
    }
  }
}
