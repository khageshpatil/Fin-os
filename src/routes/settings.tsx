import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { PageShell } from "@/components/page-shell";
import {
  loadHistory,
  loadProfile,
  recordCheckIn,
  replaceProfileAndHistory,
  saveProfile,
  useHistory,
} from "@/lib/profile-store";
import { createBlankProfile, type FinancialProfile } from "@/lib/financial";
import { Save, RotateCcw, Check, RotateCw, Download, Upload } from "lucide-react";

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

  useEffect(() => {
    const timer = window.setTimeout(() => {
      saveProfile(profile);
      setSaved(true);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [profile]);

  useEffect(() => {
    if (!saved) return;
    const timer = window.setTimeout(() => setSaved(false), 1800);
    return () => window.clearTimeout(timer);
  }, [saved]);

  const update = <K extends keyof FinancialProfile>(k: K, v: FinancialProfile[K]) =>
    setProfile((p) => ({ ...p, [k]: v }));

  const handleSave = () => {
    saveProfile(profile);
    recordCheckIn(profile);
    setSaved(true);
  };

  const handleReset = () => {
    const blankProfile = createBlankProfile();
    setProfile(blankProfile);
    saveProfile(blankProfile);
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
      const parsed = JSON.parse(text) as {
        profile?: FinancialProfile;
        history?: ReturnType<typeof loadHistory>;
      } & FinancialProfile;

      const importedProfile = parsed.profile ? { ...createBlankProfile(), ...parsed.profile } : { ...createBlankProfile(), ...parsed };
      const importedHistory = Array.isArray(parsed.history) ? parsed.history : [];

      if (parsed.profile) {
        replaceProfileAndHistory(importedProfile, importedHistory);
      } else {
        replaceProfileAndHistory(importedProfile, []);
      }

      setProfile(importedProfile);
      setSaved(true);
    } catch {
      window.alert("That backup file could not be read.");
    } finally {
      event.target.value = "";
    }
  };

  const handleLogCheckIn = () => {
    saveProfile(profile);
    recordCheckIn(profile);
    setSaved(true);
  };

  const latestCheckIn = history[0];

  return (
    <PageShell
      eyebrow="Settings"
      title="Financial profile"
      description="The numbers that power your score. Enter what's true today — your dashboard updates instantly."
      actions={
        <>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset to blank
          </button>
          <button
            onClick={handleReOnboard}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <RotateCw className="h-3.5 w-3.5" /> Re-do setup
          </button>
          <button
            onClick={handleLogCheckIn}
            className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3 py-2 text-xs font-medium text-background hover:opacity-90"
          >
            {saved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
            {saved ? "Saved" : "Log Check-in"}
          </button>
        </>
      }
    >
      <div className="space-y-6">
        <Section title="Tracking & Backup" subtitle="Autosave is on. Use check-ins to snapshot your progress, then export or import a full backup anytime.">
          <div className="rounded-md border border-border bg-background/40 p-4 sm:col-span-2 lg:col-span-3">
            <div className="grid gap-4 lg:grid-cols-3">
              <div>
                <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Last check-in</div>
                <div className="mt-1 text-sm font-medium text-foreground">
                  {latestCheckIn ? formatCheckInDate(latestCheckIn.createdAt) : "No check-ins yet"}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">History entries: {history.length}</div>
              </div>
              <div>
                <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Auto-save</div>
                <div className="mt-1 text-sm font-medium text-foreground">Enabled</div>
                <div className="mt-1 text-xs text-muted-foreground">Every edit is saved automatically after a short pause.</div>
              </div>
              <div className="flex flex-wrap gap-2 lg:justify-end">
                <button
                  type="button"
                  onClick={handleExport}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <Download className="h-3.5 w-3.5" /> Export backup
                </button>
                <button
                  type="button"
                  onClick={handleImportClick}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <Upload className="h-3.5 w-3.5" /> Import backup
                </button>
                <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleImportFile} />
              </div>
            </div>
          </div>
        </Section>

        <Section title="Cash Flow" subtitle="What comes in and what goes out each month.">
          <Field label="Monthly Income" value={profile.monthlyIncome} onChange={(v) => update("monthlyIncome", v)} prefix="₹" />
          <Field label="Monthly Expenses" value={profile.monthlyExpenses} onChange={(v) => update("monthlyExpenses", v)} prefix="₹" />
        </Section>

        <Section title="Expenses Breakdown" subtitle="Optional: Split expenses into needs vs wants for smarter 50-30-20 advice.">
          <Field label="Monthly Needs" value={profile.monthlyNeeds || 0} onChange={(v) => update("monthlyNeeds", v)} prefix="₹" />
          <Field label="Monthly Wants" value={profile.monthlyWants || 0} onChange={(v) => update("monthlyWants", v)} prefix="₹" />
          <div className="rounded-md border border-border/60 bg-muted/40 p-3 text-xs text-muted-foreground col-span-full">
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
          <Field label="Monthly SIP" value={profile.monthlySIP} onChange={(v) => update("monthlySIP", v)} prefix="₹" />
          <Field label="SIP a Year Ago" value={profile.sipLastYear} onChange={(v) => update("sipLastYear", v)} prefix="₹" />
          <DateField label="SIP Start Date" value={profile.sipStartDate} onChange={(v) => update("sipStartDate", v)} />
        </Section>

        <Section title="Credit" subtitle="Limits and current usage.">
          <Field label="Credit Limit" value={profile.creditLimit} onChange={(v) => update("creditLimit", v)} prefix="₹" />
          <Field label="Current Credit Usage" value={profile.creditUsage} onChange={(v) => update("creditUsage", v)} prefix="₹" />
          <Field label="Monthly Loan EMIs" value={profile.loans} onChange={(v) => update("loans", v)} prefix="₹" />
        </Section>

        <Section title="Systems" subtitle="Discipline structures you've set up.">
          <Toggle
            label="Three Account System"
            description="Separate Spending, Savings and Investment accounts"
            checked={profile.threeAccountSystem}
            onChange={(v) => update("threeAccountSystem", v)}
          />
        </Section>
      </div>
    </PageShell>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-6">
      <div className="mb-5 flex flex-col gap-1 border-b border-border/60 pb-4">
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  prefix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="mt-1.5 flex items-center gap-2 rounded-md border border-border bg-background/40 px-3 focus-within:border-foreground/40">
        {prefix && <span className="text-sm text-muted-foreground">{prefix}</span>}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="w-full bg-transparent py-2.5 text-sm font-medium tabular-nums outline-none"
        />
      </div>
    </label>
  );
}

function DateField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      <input
        type="date"
        value={value.slice(0, 10)}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-md border border-border bg-background/40 px-3 py-2.5 text-sm outline-none focus:border-foreground/40"
      />
    </label>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-md border border-border bg-background/40 p-4 sm:col-span-2 lg:col-span-3">
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">{description}</div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? "bg-success" : "bg-muted"}`}
        aria-pressed={checked}
      >
        <span
          className="absolute top-0.5 h-5 w-5 rounded-full bg-background shadow transition-transform"
          style={{ transform: checked ? "translateX(22px)" : "translateX(2px)" }}
        />
      </button>
    </div>
  );
}

function formatCheckInDate(iso: string) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(iso));
}
