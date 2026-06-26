import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { PageShell } from "@/components/page-shell";
import {
  loadProfile,
  saveProfile,
  replaceProfileAndHistory,
} from "@/lib/profile/store";
import { useHistory, loadHistory } from "@/lib/profile/history";
import { type FinancialProfile, createBlankProfile } from "@/lib/profile/types";
import { Section, Field, DateField, Toggle } from "@/components/settings/fields";
import { DataManagement } from "@/components/settings/data-management";
import { Save, RotateCcw, Check, RotateCw } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — WealthOS" },
      { name: "description", content: "Your financial profile — the data behind your score." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [profile, setProfile] = useState<FinancialProfile>(() => loadProfile());
  const history = useHistory();
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  const pendingUpdatesRef = useRef<Set<keyof FinancialProfile>>(new Set());

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const pending = Array.from(pendingUpdatesRef.current);
      if (pending.length > 0) {
        const now = new Date().toISOString();
        const updatedProfile = { ...profile };
        updatedProfile.profileLastUpdated = now;
        updatedProfile.fieldTimestamps = { ...updatedProfile.fieldTimestamps };
        pending.forEach((f) => {
          updatedProfile.fieldTimestamps[f as string] = now;
        });
        saveProfile(updatedProfile);
        pendingUpdatesRef.current.clear();
        setSaved(true);
      }
    }, 1500);

    return () => window.clearTimeout(timer);
  }, [profile]);

  useEffect(() => {
    if (!saved) return;
    const timer = window.setTimeout(() => setSaved(false), 1800);
    return () => window.clearTimeout(timer);
  }, [saved]);

  const update = <K extends keyof FinancialProfile>(k: K, v: FinancialProfile[K]) => {
    setProfile((p) => ({ ...p, [k]: v }));
    pendingUpdatesRef.current.add(k);
    setSaved(false);
  };

  const handleSave = () => {
    const pending = Array.from(pendingUpdatesRef.current);
    const now = new Date().toISOString();
    const updatedProfile = { ...profile };
    updatedProfile.profileLastUpdated = now;
    updatedProfile.fieldTimestamps = { ...updatedProfile.fieldTimestamps };
    pending.forEach((f) => {
      updatedProfile.fieldTimestamps[f as string] = now;
    });
    saveProfile(updatedProfile);
    pendingUpdatesRef.current.clear();
    setSaved(true);
  };

  const handleReset = () => {
    if (!window.confirm("Are you sure you want to reset your profile to blank? This cannot be undone.")) {
      return;
    }
    const blankProfile = createBlankProfile();
    setProfile(blankProfile);
    saveProfile(blankProfile);
    setSaved(true);
  };

  const handleReOnboard = () => {
    const newProfile = { ...profile, onboardingComplete: false };
    saveProfile(newProfile);
    navigate({ to: "/onboarding" });
  };

  const handleExport = () => {
    const payload = {
      profile,
      history,
      exportedAt: new Date().toISOString(),
      version: 2,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `wealthos-backup-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      const importedProfile = parsed.profile
        ? { ...createBlankProfile(), ...parsed.profile }
        : { ...createBlankProfile(), ...parsed };

      const importedHistory = Array.isArray(parsed.history) ? parsed.history : [];

      replaceProfileAndHistory(importedProfile, importedHistory);
      setProfile(importedProfile);
      setSaved(true);
      window.alert("Backup imported successfully!");
    } catch {
      window.alert("That backup file could not be read.");
    } finally {
      event.target.value = "";
    }
  };

  return (
    <PageShell
      eyebrow="Settings"
      title="Financial profile"
      description="The numbers that power your score. Enter what's true today — your dashboard updates instantly."
      actions={
        <>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer transition-all"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset to blank
          </button>
          <button
            onClick={handleReOnboard}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer transition-all"
          >
            <RotateCw className="h-3.5 w-3.5" /> Re-do setup
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3 py-2 text-xs font-semibold text-background hover:opacity-90 cursor-pointer transition-all"
          >
            {saved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
            {saved ? "Saved" : "Save Changes"}
          </button>
        </>
      }
    >
      <div className="space-y-6">
        <DataManagement
          history={history}
          onExport={handleExport}
          onImportClick={handleImportClick}
          fileInputRef={fileInputRef}
          onImportFile={handleImportFile}
        />

        <Section title="Cash Flow" subtitle="What comes in and what goes out each month.">
          <Field label="Monthly Income" value={profile.monthlyIncome} onChange={(v) => update("monthlyIncome", v)} prefix="₹" />
          <Field label="Monthly Expenses" value={profile.monthlyExpenses} onChange={(v) => update("monthlyExpenses", v)} prefix="₹" />
        </Section>

        <Section title="Expenses Breakdown" subtitle="Optional: Split expenses into needs vs wants for smarter 50-30-20 advice.">
          <Field label="Monthly Needs" value={profile.monthlyNeeds || 0} onChange={(v) => update("monthlyNeeds", v)} prefix="₹" />
          <Field label="Monthly Wants" value={profile.monthlyWants || 0} onChange={(v) => update("monthlyWants", v)} prefix="₹" />
          <div className="rounded-md border border-border/60 bg-muted/20 p-3 text-xs text-muted-foreground col-span-full leading-normal">
            <strong>Needs:</strong> Rent, utilities, groceries, insurance. <strong>Wants:</strong> Dining out, subscriptions, entertainment, hobbies.
          </div>
        </Section>

        <Section title="Safety Net" subtitle="Buffers and insurance covers.">
          <Field label="Emergency Fund" value={profile.emergencyFund} onChange={(v) => update("emergencyFund", v)} prefix="₹" />
          <Field label="Health Insurance Cover" value={profile.healthInsurance} onChange={(v) => update("healthInsurance", v)} prefix="₹" />
          <Field label="Term Insurance Cover" value={profile.termInsurance} onChange={(v) => update("termInsurance", v)} prefix="₹" />
        </Section>

        <Section title="Investments" subtitle="Where your money is working.">
          <Field label="Mutual Funds" value={profile.mutualFunds} onChange={(v) => update("mutualFunds", v)} prefix="₹" />
          <Field label="Stocks" value={profile.stocks} onChange={(v) => update("stocks", v)} prefix="₹" />
          <Field label="EPF" value={profile.epf} onChange={(v) => update("epf", v)} prefix="₹" />
          <Field label="Gold" value={profile.gold} onChange={(v) => update("gold", v)} prefix="₹" />
        </Section>

        <Section title="SIP & Step-Up" subtitle="Recurring investment cadence.">
          <Field label="Monthly SIP" value={profile.monthlyInvestment} onChange={(v) => update("monthlyInvestment", v)} prefix="₹" />
          <Field label="SIP a Year Ago" value={profile.investmentLastYear} onChange={(v) => update("investmentLastYear", v)} prefix="₹" />
          <DateField label="SIP Start Date" value={profile.investmentStartDate} onChange={(v) => update("investmentStartDate", v)} />
        </Section>

        <Section title="Credit" subtitle="Limits and current usage.">
          <Field label="Credit Limit" value={profile.creditLimit} onChange={(v) => update("creditLimit", v)} prefix="₹" />
          <Field label="Current Credit Usage" value={profile.creditUsage} onChange={(v) => update("creditUsage", v)} prefix="₹" />
          <Field label="Monthly Loan EMIs" value={profile.monthlyEMI} onChange={(v) => update("monthlyEMI", v)} prefix="₹" />
        </Section>

        <Section title="Systems" subtitle="Discipline structures you've set up.">
          <Toggle
            label="Three Account System"
            description="Separate Spending, Savings and Investment accounts to control automatic money routing"
            checked={profile.threeAccountSystem}
            onChange={(v) => update("threeAccountSystem", v)}
          />
        </Section>
      </div>
    </PageShell>
  );
}
