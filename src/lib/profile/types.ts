export interface FinancialProfile {
  // Core
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyNeeds?: number;
  monthlyWants?: number;
  // Assets
  emergencyFund: number;
  monthlyInvestment: number; // Renamed from monthlySIP
  investmentStartDate: string; // Renamed from sipStartDate
  investmentLastYear: number; // Renamed from sipLastYear
  mutualFunds: number;
  stocks: number;
  epf: number;
  gold: number;
  // Liabilities & Protection
  healthInsurance: number;
  termInsurance: number;
  creditLimit: number;
  creditUsage: number;
  monthlyEMI: number; // Renamed from loans
  // Meta
  threeAccountSystem: boolean;
  onboardingComplete: boolean;
  dependents: number;
  incomeRange: string;
  employmentType: string;
  financialGoal: string;
  fieldTimestamps: Record<string, string>; // NEW: ISO dates for field updates
  profileLastUpdated: string; // NEW: ISO timestamp
}

export interface FinancialSnapshot {
  id: string;
  createdAt: string; // ISO
  score: number;
  category: "Critical" | "Needs Attention" | "Good" | "Strong" | "Excellent";
  income: number;
  expenses: number;
  savingsRate: number;
  investmentRate: number;
  weakestRule: string;
  topAction: string;
  topRule: string;
}

export interface BackupPayload {
  profile: FinancialProfile;
  history: FinancialSnapshot[];
  exportedAt: string;
  version: number;
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
    monthlyInvestment: 0,
    investmentStartDate: "",
    investmentLastYear: 0,
    threeAccountSystem: false,
    monthlyEMI: 0,
    onboardingComplete: false,
    dependents: 0,
    incomeRange: "",
    employmentType: "",
    financialGoal: "",
    fieldTimestamps: {},
    profileLastUpdated: "",
  };
}

// ---------------------------------------------------------------------------
// Pure utility functions on FinancialProfile
// ---------------------------------------------------------------------------

export function totalInvestments(p: FinancialProfile): number {
  return p.mutualFunds + p.stocks + p.epf + p.gold;
}

export function netWorth(p: FinancialProfile): number {
  return totalInvestments(p) + p.emergencyFund;
}

export function hasBudgetCategories(p: FinancialProfile): boolean {
  return (
    p.monthlyNeeds !== undefined &&
    p.monthlyWants !== undefined &&
    (p.monthlyNeeds > 0 || p.monthlyWants > 0 || p.monthlyExpenses === 0)
  );
}

