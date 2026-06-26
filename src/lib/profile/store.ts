// Unified v2 profile store.
// Replaces src/lib/profile-store.ts — all profile persistence lives here.

import { useEffect, useState } from "react";
import { type FinancialProfile, createBlankProfile } from "./types";

const KEY_V2 = "wealthos.profile.v2";
const KEY_V1 = "wealthos.profile.v1";

// ---------------------------------------------------------------------------
// Migration
// ---------------------------------------------------------------------------

/** Run once on boot. If v1 data exists and v2 does not, migrate and delete v1. */
export function migrateProfileV1ToV2() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(KEY_V2)) return; // already migrated

  const rawV1 = localStorage.getItem(KEY_V1);
  if (!rawV1) return;

  try {
    const v1 = JSON.parse(rawV1);
    const now = new Date().toISOString();

    const v2: FinancialProfile = {
      monthlyIncome: v1.monthlyIncome ?? 0,
      monthlyExpenses: v1.monthlyExpenses ?? 0,
      monthlyNeeds: v1.monthlyNeeds,
      monthlyWants: v1.monthlyWants,
      emergencyFund: v1.emergencyFund ?? 0,
      monthlyInvestment: v1.monthlySIP ?? 0,
      investmentStartDate: v1.sipStartDate ?? "",
      investmentLastYear: v1.sipLastYear ?? 0,
      mutualFunds: v1.mutualFunds ?? 0,
      stocks: v1.stocks ?? 0,
      epf: v1.epf ?? 0,
      gold: v1.gold ?? 0,
      healthInsurance: v1.healthInsurance ?? 0,
      termInsurance: v1.termInsurance ?? 0,
      creditLimit: v1.creditLimit ?? 0,
      creditUsage: v1.creditUsage ?? 0,
      monthlyEMI: v1.loans ?? 0,
      threeAccountSystem: !!v1.threeAccountSystem,
      onboardingComplete: !!v1.onboardingComplete,
      dependents: v1.dependents ?? 0,
      incomeRange: v1.incomeRange ?? "",
      employmentType: v1.employmentType ?? "",
      financialGoal: v1.financialGoal ?? "",
      fieldTimestamps: {},
      profileLastUpdated: now,
    };

    // Seed timestamps for non-default fields
    for (const [key, value] of Object.entries(v2)) {
      if (key === "fieldTimestamps" || key === "profileLastUpdated") continue;
      if (typeof value === "number" && value > 0) v2.fieldTimestamps[key] = now;
      if (typeof value === "string" && value.length > 0) v2.fieldTimestamps[key] = now;
      if (typeof value === "boolean" && value && key !== "onboardingComplete") v2.fieldTimestamps[key] = now;
    }

    localStorage.setItem(KEY_V2, JSON.stringify(v2));
    localStorage.removeItem(KEY_V1);
    window.dispatchEvent(new CustomEvent("wealthos:profile"));
  } catch (e) {
    console.error("[WealthOS] v1→v2 migration failed:", e);
  }
}

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------

export function loadProfile(): FinancialProfile {
  if (typeof window === "undefined") return createBlankProfile();
  try {
    const raw = localStorage.getItem(KEY_V2);
    if (!raw) return createBlankProfile();
    return { ...createBlankProfile(), ...JSON.parse(raw) };
  } catch {
    return createBlankProfile();
  }
}

/**
 * Persist profile. Optionally pass `changedField` to stamp its freshness.
 * Always updates `profileLastUpdated`.
 */
export function saveProfile(p: FinancialProfile, changedField?: string) {
  if (typeof window === "undefined") return;

  const now = new Date().toISOString();
  p.profileLastUpdated = now;

  if (changedField) {
    p.fieldTimestamps = { ...p.fieldTimestamps, [changedField]: now };
  }

  localStorage.setItem(KEY_V2, JSON.stringify(p));
  window.dispatchEvent(new CustomEvent("wealthos:profile"));
}

// ---------------------------------------------------------------------------
// Backup helpers
// ---------------------------------------------------------------------------

export function replaceProfileAndHistory(
  profile: FinancialProfile,
  history: unknown[],
) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY_V2, JSON.stringify(profile));
  // History is managed by history.ts, but we write raw for import compatibility
  localStorage.setItem("wealthos.history.v2", JSON.stringify(history));
  window.dispatchEvent(new CustomEvent("wealthos:profile"));
  window.dispatchEvent(new CustomEvent("wealthos:history"));
}

// ---------------------------------------------------------------------------
// React hook
// ---------------------------------------------------------------------------

export function useProfile() {
  const [profile, setProfile] = useState<FinancialProfile>(createBlankProfile());

  useEffect(() => {
    setProfile(loadProfile());
    const handler = () => setProfile(loadProfile());
    window.addEventListener("wealthos:profile", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("wealthos:profile", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  return [
    profile,
    (p: FinancialProfile, changedField?: string) => {
      saveProfile(p, changedField);
      setProfile(p);
    },
  ] as const;
}
