// Rule engine types — shared across definitions, engine, and UI.

import type { FinancialProfile } from "@/lib/profile/types";

// ---------------------------------------------------------------------------
// Status
// ---------------------------------------------------------------------------

export type RuleStatus = "critical" | "warning" | "good" | "excellent";

export type RuleCategory = "foundation" | "protection" | "growth" | "discipline";

// ---------------------------------------------------------------------------
// Rule definition (static config)
// ---------------------------------------------------------------------------

export interface RuleDefinition {
  id: string;
  name: string;
  description: string;
  maxPoints: number;
  category: RuleCategory;
  evaluate: (profile: FinancialProfile) => Omit<RuleResult, "progressPct">;
}

// ---------------------------------------------------------------------------
// Rule result (computed per evaluation)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Score (composite)
// ---------------------------------------------------------------------------

export interface Score {
  total: number;
  max: number;
  category: "Critical" | "Needs Attention" | "Good" | "Strong" | "Excellent";
  /** Non-null if category was capped due to foundation failure. */
  cappedReason: string | null;
}

// ---------------------------------------------------------------------------
// Action item
// ---------------------------------------------------------------------------

export interface ActionItem {
  title: string;
  rule: string;
  impact: number;
  priority: "High" | "Medium" | "Low";
}
