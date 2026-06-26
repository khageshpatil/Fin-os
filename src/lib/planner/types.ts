// Planner scenario types.

export type ScenarioType = "salary" | "investment" | "purchase" | "loan";

export interface SalaryInputs {
  newSalary: number;
  raiseToInvestmentPct: number; // 0-100, default 50
}

export interface InvestmentInputs {
  additionalInvestment: number;
}

export interface PurchaseInputs {
  purchaseAmount: number;
}

export interface LoanInputs {
  newEMI: number;
}

export type ScenarioInputs = SalaryInputs | InvestmentInputs | PurchaseInputs | LoanInputs;

export interface AffectedRule {
  name: string;
  delta: number; // positive = improvement
}

export interface SimulationResult {
  baseScore: { total: number; category: string };
  projectedScore: { total: number; category: string };
  delta: number;
  affectedRules: AffectedRule[];
  recommendation: string;
}
