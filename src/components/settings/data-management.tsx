import React from "react";
import { Download, Upload } from "lucide-react";
import { formatDate } from "@/lib/format";
import type { FinancialSnapshot } from "@/lib/profile/types";

interface DataManagementProps {
  history: FinancialSnapshot[];
  onExport: () => void;
  onImportClick: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onImportFile: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function DataManagement({
  history,
  onExport,
  onImportClick,
  fileInputRef,
  onImportFile,
}: DataManagementProps) {
  const latestCheckIn = history[0];

  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-5 flex flex-col gap-1 border-b border-border/60 pb-4">
        <h2 className="text-sm font-semibold tracking-tight">Tracking & Backup</h2>
        <p className="text-xs text-muted-foreground">
          Autosave is enabled. Use check-ins to snapshot your progress, or export/import backup files.
        </p>
      </div>

      <div className="rounded-md border border-border bg-background/30 p-4">
        <div className="grid gap-4 lg:grid-cols-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Last check-in snapshot
            </div>
            <div className="mt-1 text-sm font-medium text-foreground">
              {latestCheckIn ? formatDate(latestCheckIn.createdAt) : "No check-ins logged yet"}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Historical snapshots: {history.length}
            </div>
          </div>

          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground font-sans">
              Auto-save Status
            </div>
            <div className="mt-1 text-sm font-medium text-success flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              Active
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Profile modifications save automatically after 1.5 seconds of inactivity.
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <button
              type="button"
              onClick={onExport}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2.5 text-xs font-semibold text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer transition-all"
            >
              <Download className="h-3.5 w-3.5" /> Export backup
            </button>
            <button
              type="button"
              onClick={onImportClick}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2.5 text-xs font-semibold text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer transition-all"
            >
              <Upload className="h-3.5 w-3.5" /> Import backup
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={onImportFile}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
