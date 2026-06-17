import { useEffect, useState } from "react";
import { createBlankProfile, disciplineScore, evaluateRules, topActions, type FinancialProfile } from "./financial";

const KEY = "wealthos.profile.v1";
const HISTORY_KEY = "wealthos.history.v1";

export interface FinancialSnapshot {
  id: string;
  createdAt: string;
  score: number;
  category: string;
  income: number;
  expenses: number;
  savingsRate: number;
  investRate: number;
  dti: number;
  topAction: string;
  topRule: string;
}

export interface BackupPayload {
  profile: FinancialProfile;
  history: FinancialSnapshot[];
  exportedAt: string;
}

export function loadProfile(): FinancialProfile {
  if (typeof window === "undefined") return createBlankProfile();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return createBlankProfile();
    return { ...createBlankProfile(), ...JSON.parse(raw) } as FinancialProfile;
  } catch {
    return createBlankProfile();
  }
}

export function saveProfile(p: FinancialProfile) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(p));
  window.dispatchEvent(new CustomEvent("wealthos:profile"));
}

export function loadHistory(): FinancialSnapshot[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as FinancialSnapshot[];
  } catch {
    return [];
  }
}

export function saveHistory(history: FinancialSnapshot[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 60)));
  window.dispatchEvent(new CustomEvent("wealthos:history"));
}

export function createSnapshot(profile: FinancialProfile): FinancialSnapshot | null {
  if (!profile.onboardingComplete || profile.monthlyIncome <= 0) return null;
  const rules = evaluateRules(profile);
  const score = disciplineScore(rules);
  const actions = topActions(rules);
  const savingsRate = ((profile.monthlyIncome - profile.monthlyExpenses) / profile.monthlyIncome) * 100;
  const investRate = (profile.monthlySIP / profile.monthlyIncome) * 100;
  const dti = (profile.loans / profile.monthlyIncome) * 100;

  return {
    id: `${Date.now()}`,
    createdAt: new Date().toISOString(),
    score: score.total,
    category: score.category,
    income: profile.monthlyIncome,
    expenses: profile.monthlyExpenses,
    savingsRate,
    investRate,
    dti,
    topAction: actions[0]?.title ?? "Keep your current plan steady.",
    topRule: actions[0]?.rule ?? "All rules",
  };
}

export function recordCheckIn(profile: FinancialProfile) {
  if (typeof window === "undefined") return;
  const snapshot = createSnapshot(profile);
  if (!snapshot) return;
  const history = [snapshot, ...loadHistory().filter((entry) => entry.id !== snapshot.id)];
  saveHistory(history);
}

export function replaceProfileAndHistory(profile: FinancialProfile, history: FinancialSnapshot[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(profile));
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 60)));
  window.dispatchEvent(new CustomEvent("wealthos:profile"));
  window.dispatchEvent(new CustomEvent("wealthos:history"));
}

export function loadBackup(): BackupPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const profile = loadProfile();
    const history = loadHistory();
    return { profile, history, exportedAt: new Date().toISOString() };
  } catch {
    return null;
  }
}

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
  return [profile, (p: FinancialProfile) => { saveProfile(p); setProfile(p); }] as const;
}

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
