// History store — manages FinancialSnapshot persistence.
// Replaces history logic that was in profile-store.ts.

import { useEffect, useState } from "react";
import type { FinancialProfile, FinancialSnapshot } from "./types";
import type { RuleResult, Score, ActionItem } from "@/lib/rules/types";

const KEY_V2 = "wealthos.history.v2";
const KEY_V1 = "wealthos.history.v1";
const MAX_ENTRIES = 60;

// ---------------------------------------------------------------------------
// Migration
// ---------------------------------------------------------------------------

/** Migrate v1 history to v2 format. Run once on boot alongside profile migration. */
export function migrateHistoryV1ToV2() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(KEY_V2)) return;

  const rawV1 = localStorage.getItem(KEY_V1);
  if (!rawV1) return;

  try {
    const v1Entries = JSON.parse(rawV1) as Record<string, unknown>[];
    const v2Entries: FinancialSnapshot[] = v1Entries.map((entry) => ({
      id: String(entry.id ?? Date.now()),
      createdAt: String(entry.createdAt ?? new Date().toISOString()),
      score: Number(entry.score ?? 0),
      category: (entry.category as FinancialSnapshot["category"]) ?? "Critical",
      income: Number(entry.income ?? 0),
      expenses: Number(entry.expenses ?? 0),
      savingsRate: Number(entry.savingsRate ?? 0),
      investmentRate: Number(entry.investRate ?? entry.investmentRate ?? 0),
      weakestRule: String(entry.weakestRule ?? ""),
      topAction: String(entry.topAction ?? ""),
      topRule: String(entry.topRule ?? ""),
    }));

    localStorage.setItem(KEY_V2, JSON.stringify(v2Entries.slice(0, MAX_ENTRIES)));
    localStorage.removeItem(KEY_V1);
    window.dispatchEvent(new CustomEvent("wealthos:history"));
  } catch (e) {
    console.error("[WealthOS] history v1→v2 migration failed:", e);
  }
}

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------

export function loadHistory(): FinancialSnapshot[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY_V2);
    if (!raw) return [];
    return JSON.parse(raw) as FinancialSnapshot[];
  } catch {
    return [];
  }
}

export function saveHistory(history: FinancialSnapshot[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY_V2, JSON.stringify(history.slice(0, MAX_ENTRIES)));
  window.dispatchEvent(new CustomEvent("wealthos:history"));
}

// ---------------------------------------------------------------------------
// Snapshot creation
// ---------------------------------------------------------------------------

/**
 * Create a snapshot from the current profile.
 * Depends on rule engine — imported lazily to avoid circular deps.
 */
export function createSnapshot(
  profile: FinancialProfile,
  evaluateRules: (p: FinancialProfile) => RuleResult[],
  disciplineScore: (rules: RuleResult[]) => Score,
  topActions: (rules: RuleResult[]) => ActionItem[],
): FinancialSnapshot | null {
  if (!profile.onboardingComplete || profile.monthlyIncome <= 0) return null;

  const rules = evaluateRules(profile);
  const score = disciplineScore(rules);
  const actions = topActions(rules);

  const savingsRate =
    ((profile.monthlyIncome - profile.monthlyExpenses) / profile.monthlyIncome) * 100;
  const investmentRate =
    (profile.monthlyInvestment / profile.monthlyIncome) * 100;

  // Find weakest rule (lowest points/maxPoints ratio among non-perfect rules)
  const weakest = [...rules]
    .filter((r) => r.points < r.maxPoints)
    .sort((a, b) => a.points / a.maxPoints - b.points / b.maxPoints)[0];

  return {
    id: `${Date.now()}`,
    createdAt: new Date().toISOString(),
    score: score.total,
    category: score.category as FinancialSnapshot["category"],
    income: profile.monthlyIncome,
    expenses: profile.monthlyExpenses,
    savingsRate,
    investmentRate,
    weakestRule: weakest?.name ?? "",
    topAction: actions[0]?.title ?? "Keep your current plan steady.",
    topRule: actions[0]?.rule ?? "All rules",
  };
}

/** Record a check-in: create snapshot and prepend to history. */
export function recordCheckIn(
  profile: FinancialProfile,
  evaluateRules: Parameters<typeof createSnapshot>[1],
  disciplineScore: Parameters<typeof createSnapshot>[2],
  topActions: Parameters<typeof createSnapshot>[3],
) {
  const snapshot = createSnapshot(profile, evaluateRules, disciplineScore, topActions);
  if (!snapshot) return;
  const history = [snapshot, ...loadHistory().filter((e) => e.id !== snapshot.id)];
  saveHistory(history);
}

// ---------------------------------------------------------------------------
// React hook
// ---------------------------------------------------------------------------

export function useHistory() {
  const [history, setHistory] = useState<FinancialSnapshot[]>([]);

  useEffect(() => {
    setHistory(loadHistory());
    const handler = () => setHistory(loadHistory());
    window.addEventListener("wealthos:history", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("wealthos:history", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  return history;
}
