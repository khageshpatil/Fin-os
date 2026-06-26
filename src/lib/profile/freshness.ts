// Freshness tracking utilities.
// Determines which profile fields are stale and how long since last update.

import type { FinancialProfile } from "./types";

/** Fields that are meaningful for freshness tracking (exclude meta fields). */
const TRACKABLE_FIELDS: (keyof FinancialProfile)[] = [
  "monthlyIncome",
  "monthlyExpenses",
  "monthlyNeeds",
  "monthlyWants",
  "emergencyFund",
  "monthlyInvestment",
  "investmentStartDate",
  "investmentLastYear",
  "mutualFunds",
  "stocks",
  "epf",
  "gold",
  "healthInsurance",
  "termInsurance",
  "creditLimit",
  "creditUsage",
  "monthlyEMI",
  "threeAccountSystem",
];

/** Human-readable label for a profile field name. */
const FIELD_LABELS: Record<string, string> = {
  monthlyIncome: "Monthly Income",
  monthlyExpenses: "Monthly Expenses",
  monthlyNeeds: "Monthly Needs",
  monthlyWants: "Monthly Wants",
  emergencyFund: "Emergency Fund",
  monthlyInvestment: "Monthly Investment",
  investmentStartDate: "Investment Start Date",
  investmentLastYear: "Investment (Last Year)",
  mutualFunds: "Mutual Funds",
  stocks: "Stocks",
  epf: "EPF",
  gold: "Gold",
  healthInsurance: "Health Insurance",
  termInsurance: "Term Insurance",
  creditLimit: "Credit Limit",
  creditUsage: "Credit Usage",
  monthlyEMI: "Monthly EMI",
  threeAccountSystem: "Three Account System",
};

/**
 * Returns field names that haven't been updated in more than `thresholdDays`.
 * A field with no timestamp entry is considered stale.
 */
export function getStaleFields(
  profile: FinancialProfile,
  thresholdDays = 30,
): string[] {
  const now = Date.now();
  const thresholdMs = thresholdDays * 24 * 60 * 60 * 1000;
  const stale: string[] = [];

  for (const field of TRACKABLE_FIELDS) {
    const value = profile[field];
    // Skip optional fields that are undefined/0/empty — they haven't been set
    if (value === undefined || value === 0 || value === "" || value === false) continue;

    const ts = profile.fieldTimestamps[field];
    if (!ts) {
      stale.push(field);
      continue;
    }
    const elapsed = now - new Date(ts).getTime();
    if (elapsed > thresholdMs) {
      stale.push(field);
    }
  }

  return stale;
}

/**
 * Returns the number of days since `profileLastUpdated`.
 * Returns `Infinity` if never updated.
 */
export function getDaysSinceUpdate(profile: FinancialProfile): number {
  if (!profile.profileLastUpdated) return Infinity;
  const elapsed = Date.now() - new Date(profile.profileLastUpdated).getTime();
  return Math.floor(elapsed / (24 * 60 * 60 * 1000));
}

/** Returns a human-readable label for a field name. */
export function fieldLabel(fieldName: string): string {
  return FIELD_LABELS[fieldName] ?? fieldName;
}
